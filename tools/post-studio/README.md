# me0wberry post studio

Local-only post creation tool for me0wberry.com.

(IVY ADDED NOTE: run this instead lol "& "C:\Users\Ivyti\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" tools/post-studio/server.js")

Run from the repository root:

```powershell
node tools/post-studio/server.js
```

Open the private link printed in the terminal. It starts with `http://127.0.0.1:8124/#token=` and unlocks the editor for that running server. Reopen the latest terminal link after restarting Post Studio; an older link will no longer authorize post creation.

The browser removes the token from the address bar and keeps it in the current tab's session storage so refreshes work. If browser storage is unavailable, the link still unlocks the current page; reopen it after refreshing. The token stays out of HTTP URLs, generated posts, and repository files. Treat the startup link as private.

Post Studio remains bound to localhost. It requires the private token, a matching local origin, and JSON requests before it can create posts, and rejects requests using other hostnames. No password or shared secret needs copying between the PC and cloud workspace: each running server generates its own link. An ordinary static-site preview should use a separate web server.

After pulling a dependency update, run `pnpm install` in that checkout and restart Post Studio. Run `pnpm check:studio` to check the editor's request protections.

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
