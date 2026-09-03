# me0wberry post studio

Local-only post creation tool for me0wberry.com.

(IVY ADDED NOTE: run this instead lol "& "C:\Users\Ivyti\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" tools/post-studio/server.js")

Run from the repository root:

```powershell
node tools/post-studio/server.js
```

Then open:

```text
http://127.0.0.1:8124
```

The tool writes post HTML into `posts/<category>/`, updates the matching `index.json`, and copies selected images into the right local image folder.

Image behavior:

- Selected images become gallery images in `images/<category>/`.
- Large JPEG and PNG uploads are optimized to WebP by default, up to 2560px on the longest edge. Uncheck the optimization option to keep the original dimensions and file type.
- Embedded EXIF/XMP data is removed from uploaded still images so location and device metadata are not published.
- HEIC and HEIF photos are always converted to WebP so they display reliably in browsers.
- GIFs and other unsupported browser image formats are left untouched.
- Existing images can be reused by entering their exact filenames, one per line.
- Existing filenames are resolved inside the selected category folder and are not copied again.
- An explicit image URL can still be used instead of selecting a file.
