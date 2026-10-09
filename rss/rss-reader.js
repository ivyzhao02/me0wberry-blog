(() => {
  const posts = Array.isArray(window.me0wberrySearchIndex?.posts)
    ? window.me0wberrySearchIndex.posts
    : [];
  const list = document.getElementById('rss-reader-list');
  const status = document.getElementById('rss-reader-status');
  const filters = [...document.querySelectorAll('[data-rss-filter]')];
  const copyButton = document.getElementById('rss-copy-address');
  const copyStatus = document.getElementById('rss-copy-status');
  const feedAddress = document.getElementById('rss-feed-address')?.textContent.trim() || '';

  function createEntry(post) {
    const article = document.createElement('article');
    const heading = document.createElement('h3');
    const link = document.createElement('a');
    const meta = document.createElement('div');
    const category = document.createElement('span');
    const date = document.createElement('span');
    const summary = document.createElement('p');

    article.className = 'rss-reader-entry';
    article.dataset.category = post.category;
    heading.className = 'rss-reader-entry-title';
    link.href = `..${post.url}`;
    link.textContent = post.title;
    meta.className = 'rss-reader-meta';
    category.className = 'rss-reader-category';
    category.textContent = post.category;
    date.textContent = post.date;
    summary.className = 'rss-reader-summary';
    summary.textContent = post.summary;

    heading.append(link);
    meta.append(category, date);
    article.append(heading, meta, summary);
    return article;
  }

  function showCategory(selected) {
    const visiblePosts = selected === 'all'
      ? posts
      : posts.filter((post) => post.category === selected);
    const fragment = document.createDocumentFragment();

    visiblePosts.forEach((post) => fragment.append(createEntry(post)));
    list.replaceChildren(fragment);
    filters.forEach((button) => {
      const active = button.dataset.rssFilter === selected;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    status.textContent = `${visiblePosts.length} ${visiblePosts.length === 1 ? 'post' : 'posts'}${selected === 'all' ? ' in the feed' : ` in ${selected}`}`;
  }

  async function copyFeedAddress() {
    try {
      await navigator.clipboard.writeText(feedAddress);
    } catch (error) {
      const textarea = document.createElement('textarea');
      textarea.value = feedAddress;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    copyStatus.textContent = 'copied ! paste it into your feed reader ♡';
    copyButton.textContent = 'copied ♡';
    window.setTimeout(() => { copyButton.textContent = 'copy address'; }, 1800);
  }

  filters.forEach((button) => {
    button.addEventListener('click', () => showCategory(button.dataset.rssFilter));
  });
  copyButton?.addEventListener('click', copyFeedAddress);

  if (posts.length) showCategory('all');
  else status.textContent = 'the feed is taking a nap right now (ᐢ. .ᐢ)';
})();
