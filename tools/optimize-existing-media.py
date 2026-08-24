import argparse
import json
import math
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageChops, ImageOps, ImageStat


ROOT = Path(__file__).resolve().parent.parent
MEDIA_ROOT = ROOT / "images"
REPORT_PATH = ROOT / "tools" / "media-optimization-report.json"
SOURCE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
TEXT_EXTENSIONS = {".css", ".html", ".js", ".json", ".md", ".xml", ".xsl", ".yml"}
MIN_SOURCE_BYTES = 1024 * 1024
MAX_DIMENSION = 2560
WEBP_QUALITY = 90
MIN_PSNR = 38.0


def candidates():
    return sorted(
        (
            path
            for path in MEDIA_ROOT.rglob("*")
            if path.is_file()
            and path.suffix.lower() in SOURCE_EXTENSIONS
            and path.stat().st_size >= MIN_SOURCE_BYTES
        ),
        key=lambda path: path.stat().st_size,
        reverse=True,
    )


def output_mode(image):
    if "A" in image.mode or "transparency" in image.info:
        return image.convert("RGBA")
    return image.convert("RGB")


def psnr(reference, encoded):
    reference_rgb = reference.convert("RGB")
    encoded_rgb = encoded.convert("RGB")
    difference = ImageChops.difference(reference_rgb, encoded_rgb)
    channel_rms = ImageStat.Stat(difference).rms
    mse = sum(value * value for value in channel_rms) / len(channel_rms)
    return 99.0 if mse == 0 else 20 * math.log10(255 / math.sqrt(mse))


def encode_candidate(source_path):
    with Image.open(source_path) as source:
        image = ImageOps.exif_transpose(source)
        scale = min(1.0, MAX_DIMENSION / max(image.size))
        target_size = (round(image.width * scale), round(image.height * scale))
        if scale < 1.0:
            image = image.resize(target_size, Image.Resampling.LANCZOS)
        image = output_mode(image)

        save_options = {
            "format": "WEBP",
            "quality": WEBP_QUALITY,
            "method": 6,
        }
        if image.mode == "RGBA":
            save_options["exact"] = True

        exif = image.getexif()
        if exif:
            save_options["exif"] = exif.tobytes()
        icc_profile = source.info.get("icc_profile")
        if icc_profile:
            save_options["icc_profile"] = icc_profile

        buffer = BytesIO()
        image.save(buffer, **save_options)
        encoded_bytes = buffer.getvalue()
        with Image.open(BytesIO(encoded_bytes)) as encoded:
            encoded.load()
            similarity = psnr(image, encoded)
            if encoded.size != image.size:
                raise RuntimeError(f"dimension mismatch for {source_path.relative_to(ROOT)}")
            if similarity < MIN_PSNR:
                raise RuntimeError(
                    f"quality check failed for {source_path.relative_to(ROOT)} ({similarity:.1f} dB)"
                )

        return encoded_bytes, image.size, similarity


def text_files():
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        if ".git" in path.parts or "node_modules" in path.parts:
            continue
        yield path


def replace_references(mapping):
    changed_files = []
    for path in text_files():
        source = path.read_text(encoding="utf-8")
        updated = source
        for old_name, new_name in mapping.items():
            updated = updated.replace(old_name, new_name)
        if updated != source:
            path.write_text(updated, encoding="utf-8", newline="\n")
            changed_files.append(path.relative_to(ROOT).as_posix())
    return changed_files


def assert_unique_names(paths):
    names = {}
    for path in MEDIA_ROOT.rglob("*"):
        if not path.is_file():
            continue
        key = path.name.lower()
        names.setdefault(key, []).append(path)

    duplicates = [path.name for path in paths if len(names[path.name.lower()]) > 1]
    if duplicates:
        raise RuntimeError(f"candidate filenames are not unique: {', '.join(sorted(duplicates))}")


def optimize(write=False):
    paths = candidates()
    print(f"found {len(paths)} JPEG/PNG assets over 1 MB")
    if not write or not paths:
        return

    assert_unique_names(paths)
    prepared = []
    try:
        for index, source_path in enumerate(paths, start=1):
            output_path = source_path.with_suffix(".webp")
            if output_path.exists():
                raise RuntimeError(f"output already exists: {output_path.relative_to(ROOT)}")

            encoded_bytes, dimensions, similarity = encode_candidate(source_path)
            temporary_path = output_path.with_suffix(".webp.media-opt-tmp")
            temporary_path.write_bytes(encoded_bytes)
            prepared.append(
                {
                    "source": source_path,
                    "output": output_path,
                    "temporary": temporary_path,
                    "old_bytes": source_path.stat().st_size,
                    "new_bytes": len(encoded_bytes),
                    "dimensions": dimensions,
                    "psnr": similarity,
                }
            )
            print(
                f"[{index:02}/{len(paths)}] {source_path.relative_to(ROOT)} "
                f"{source_path.stat().st_size / 1048576:.2f} -> {len(encoded_bytes) / 1048576:.2f} MB"
            )

        mapping = {
            item["source"].name: item["output"].name
            for item in prepared
        }
        changed_files = replace_references(mapping)

        for item in prepared:
            item["temporary"].replace(item["output"])
            item["source"].unlink()

        report = {
            "settings": {
                "minimum_source_bytes": MIN_SOURCE_BYTES,
                "maximum_dimension": MAX_DIMENSION,
                "webp_quality": WEBP_QUALITY,
                "minimum_psnr": MIN_PSNR,
            },
            "summary": {
                "files": len(prepared),
                "original_bytes": sum(item["old_bytes"] for item in prepared),
                "optimized_bytes": sum(item["new_bytes"] for item in prepared),
                "changed_reference_files": len(changed_files),
            },
            "files": [
                {
                    "source": item["source"].relative_to(ROOT).as_posix(),
                    "output": item["output"].relative_to(ROOT).as_posix(),
                    "original_bytes": item["old_bytes"],
                    "optimized_bytes": item["new_bytes"],
                    "width": item["dimensions"][0],
                    "height": item["dimensions"][1],
                    "psnr_db": round(item["psnr"], 2),
                }
                for item in prepared
            ],
        }
        REPORT_PATH.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

        original = report["summary"]["original_bytes"]
        optimized = report["summary"]["optimized_bytes"]
        print(
            f"optimized {len(prepared)} files: {original / 1048576:.1f} -> "
            f"{optimized / 1048576:.1f} MB ({(original - optimized) / original:.1%} smaller)"
        )
        print(f"updated references in {len(changed_files)} text files")
    except Exception:
        for item in prepared:
            item["temporary"].unlink(missing_ok=True)
        raise


def main():
    parser = argparse.ArgumentParser(description="Optimize oversized site JPEG/PNG assets to WebP.")
    parser.add_argument("--write", action="store_true", help="apply conversions and update references")
    args = parser.parse_args()
    optimize(write=args.write)


if __name__ == "__main__":
    main()
