# me0wberry post studio

Local-only post creation tool for me0wberry.com.

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

- `food` and `stubby` selected images become gallery images in `images/food/` or `images/stubby/`.
- Other categories use the first selected image as the post image and copy it into `images/misc/`.
- An explicit image URL can still be used instead of selecting a file.
