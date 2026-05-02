(() => {
  const list = document.getElementById('archive-list');
  const category = document.body.dataset.archiveCategory;

  if (!list || !category) return;

  async function loadArchivePosts() {
    try {
      const res = await fetch(`/posts/${category}/index.json?t=${Date.now()}`);
      if (!res.ok) return;

      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) return;

      list.innerHTML = posts.map((post) => `
        <div style="margin-bottom:14px; padding-bottom:14px; border-bottom:1px dashed rgba(160,144,152,0.3);">
          <a href="/${post.file}" style="font-size:14px; color:var(--heading); text-decoration:none; border-bottom:1px dotted rgba(139,58,90,0.4);">${post.title}</a>
          <span style="font-size:11px; color:var(--muted); margin-left:8px;">· ${post.date}</span>
        </div>
      `).join('');
    } catch (err) {
      console.error(`Failed to load archive posts for ${category}`, err);
    }
  }

  loadArchivePosts();
})();
