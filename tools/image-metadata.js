const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const WEBP_METADATA_FLAGS = 0x08 | 0x04;
const XMP_GPS_PATTERN = /(?:GPSLatitude|GPSLongitude|GPSPosition|exif:GPS)/i;

function hasGpsCoordinatesInExif(input) {
  if (!Buffer.isBuffer(input) || input.length < 8) return false;

  let tiffStart = 0;
  if (input.length >= 14 && input.subarray(0, 6).equals(Buffer.from('Exif\0\0', 'binary'))) {
    tiffStart = 6;
  }

  const byteOrder = input.toString('ascii', tiffStart, tiffStart + 2);
  const littleEndian = byteOrder === 'II';
  if (!littleEndian && byteOrder !== 'MM') return false;

  const canRead = (offset, size) => offset >= 0 && offset + size <= input.length;
  const readUInt16 = (offset) => {
    if (!canRead(offset, 2)) return null;
    return littleEndian ? input.readUInt16LE(offset) : input.readUInt16BE(offset);
  };
  const readUInt32 = (offset) => {
    if (!canRead(offset, 4)) return null;
    return littleEndian ? input.readUInt32LE(offset) : input.readUInt32BE(offset);
  };

  if (readUInt16(tiffStart + 2) !== 42) return false;
  const firstIfdOffset = readUInt32(tiffStart + 4);
  if (firstIfdOffset === null) return false;

  const firstIfd = tiffStart + firstIfdOffset;
  const firstIfdCount = readUInt16(firstIfd);
  if (firstIfdCount === null) return false;

  let gpsIfdOffset = null;
  for (let index = 0; index < firstIfdCount; index += 1) {
    const entry = firstIfd + 2 + (index * 12);
    if (!canRead(entry, 12)) return false;
    if (readUInt16(entry) === 0x8825) {
      gpsIfdOffset = readUInt32(entry + 8);
      break;
    }
  }

  if (gpsIfdOffset === null) return false;
  const gpsIfd = tiffStart + gpsIfdOffset;
  const gpsIfdCount = readUInt16(gpsIfd);
  if (gpsIfdCount === null) return false;

  for (let index = 0; index < gpsIfdCount; index += 1) {
    const entry = gpsIfd + 2 + (index * 12);
    if (!canRead(entry, 12)) return false;
    const tag = readUInt16(entry);
    if (tag === 0x0002 || tag === 0x0004) return true;
  }

  return false;
}

function hasGpsCoordinatesInXmp(input) {
  if (!input) return false;
  const value = Buffer.isBuffer(input) ? input.toString('utf8') : String(input);
  return XMP_GPS_PATTERN.test(value);
}

async function imageHasGpsCoordinates(filePath) {
  const metadata = await sharp(filePath, { failOn: 'error' }).metadata();
  return hasGpsCoordinatesInExif(metadata.exif) || hasGpsCoordinatesInXmp(metadata.xmp);
}

function stripWebpPrivateMetadata(input) {
  if (!Buffer.isBuffer(input)
      || input.length < 12
      || input.toString('ascii', 0, 4) !== 'RIFF'
      || input.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Expected a valid WebP RIFF file.');
  }

  const riffEnd = Math.min(input.length, input.readUInt32LE(4) + 8);
  const chunks = [];
  let removedMetadata = false;
  let offset = 12;

  while (offset + 8 <= riffEnd) {
    const type = input.toString('ascii', offset, offset + 4);
    const size = input.readUInt32LE(offset + 4);
    const paddedEnd = offset + 8 + size + (size % 2);
    if (paddedEnd > riffEnd) throw new Error('WebP contains a truncated RIFF chunk.');

    if (type === 'EXIF' || type === 'XMP ') {
      removedMetadata = true;
    } else {
      const chunk = Buffer.from(input.subarray(offset, paddedEnd));
      if (type === 'VP8X' && size >= 1) chunk[8] &= ~WEBP_METADATA_FLAGS;
      chunks.push(chunk);
    }
    offset = paddedEnd;
  }

  if (!removedMetadata) return input;

  const body = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(body.length + 4, 4);
  header.write('WEBP', 8, 'ascii');
  return Buffer.concat([header, body]);
}

async function runCli() {
  const files = process.argv.slice(2);
  if (!files.length) throw new Error('Provide one or more WebP files to scrub.');

  for (const file of files) {
    if (path.extname(file).toLowerCase() !== '.webp') {
      throw new Error(`Lossless command-line scrubbing currently supports WebP only: ${file}`);
    }
    const before = fs.readFileSync(file);
    const after = stripWebpPrivateMetadata(before);
    fs.writeFileSync(file, after);
    if (await imageHasGpsCoordinates(file)) throw new Error(`GPS metadata remains in ${file}.`);
    console.log(`${file}: ${before.length} -> ${after.length} bytes`);
  }
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  hasGpsCoordinatesInExif,
  hasGpsCoordinatesInXmp,
  imageHasGpsCoordinates,
  stripWebpPrivateMetadata,
};
