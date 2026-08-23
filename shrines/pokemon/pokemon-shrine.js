(function () {
  const list = document.getElementById('pokemon-post-list');
  const posts = window.me0wberrySearchIndex?.posts;
  if (!list || !Array.isArray(posts)) return;

  const matches = posts.filter((post) => {
    const searchable = `${post.title || ''} ${post.text || ''}`;
    return post.category === 'games' && /pok[eé]mon/i.test(searchable);
  });

  if (!matches.length) {
    list.innerHTML = '<li>no trainer logs yet ♡</li>';
    return;
  }

  list.innerHTML = '';
  matches.forEach((post) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const date = document.createElement('small');
    link.href = new URL(`../../${post.url.replace(/^\//, '')}`, window.location.href).href;
    link.textContent = `${post.title} ↗`;
    date.textContent = post.date;
    item.append(link, date);
    list.appendChild(item);
  });
})();
