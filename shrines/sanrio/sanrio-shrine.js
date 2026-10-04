(function () {
  const list = document.getElementById('sanrio-post-list');

  async function renderRelatedPosts() {
    if (!list) return;
    const posts = typeof window.loadMe0wberrySearchPosts === 'function'
      ? await window.loadMe0wberrySearchPosts()
      : window.me0wberrySearchIndex?.posts;
    if (!Array.isArray(posts)) return;

    const matches = posts.filter((post) => {
      const searchable = `${post.title || ''} ${post.text || ''}`;
      return /sanrio|pochacco|cinnamoroll|my melody|hello kitty|chococat|kuromi|pompompurin/i.test(searchable);
    });

    list.innerHTML = '';
    if (!matches.length) {
      list.innerHTML = '<li>no sanrio notes yet ♡</li>';
      return;
    }

    matches.forEach((post) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const date = document.createElement('small');
      link.href = new URL(`../../${post.url.replace(/^\//, '')}`, window.location.href).href;
      link.textContent = `${post.title} ↗`;
      date.textContent = `${post.category} / ${post.date}`;
      item.append(link, date);
      list.appendChild(item);
    });
  }

  renderRelatedPosts();

  const dialog = document.getElementById('sanrio-photo-dialog');
  const largePhoto = document.getElementById('sanrio-photo-large');
  const caption = document.getElementById('sanrio-photo-caption');
  const close = dialog?.querySelector('.stubby-memory-close');

  document.querySelectorAll('[data-sanrio-photo]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!dialog || !largePhoto || !caption) return;
      largePhoto.src = button.dataset.sanrioPhoto;
      largePhoto.alt = button.querySelector('img')?.alt || '';
      caption.textContent = button.dataset.sanrioCaption || '';
      dialog.showModal();
    });
  });

  close?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
