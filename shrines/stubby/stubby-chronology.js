(function () {
  const timeline = document.getElementById('stubby-timeline');
  if (!timeline) return;

  const years = [
    { year: 2012, images: 9, featured: 2, videos: 0, copy: 'the year i got stubby ♡ i was 10 & she became the love of my life basically immediately . she still looked like a teenage kitten here !' },
    { year: 2013, images: 11, featured: 2, videos: 0, copy: 'her first halloween with the festive collar she somehow still has , plus some very important turtle investigations' },
    { year: 2014, images: 4, featured: 2, videos: 0, copy: "only a few pictures survived , rescued from my mom's facebook" },
    { year: 2015, images: 5, featured: 3, videos: 0, copy: 'more little home photos , still mostly rescued from older family albums' },
    { year: 2016, images: 5, featured: 2, videos: 0, copy: 'the household ipad entered the timeline , so i finally started taking more pictures of her myself' },
    { year: 2017, images: 8, featured: 6, videos: 0, copy: 'she kept me company through grade 10 , whether she was helping or sitting directly on whatever i needed . also : usher cap' },
    { year: 2018, images: 8, featured: 7, videos: 1, copy: 'the first long stubby video i could find lives here ! the toilet-training saga remains lost media & that is probably for the best' },
    { year: 2019, images: 10, featured: 10, videos: 0, copy: 'the laptop era begins . stubby discovered one of her most important jobs : sitting on whatever screen i was using' },
    { year: 2020, images: 17, featured: 5, videos: 0, copy: 'lockdown meant lots of time together in the living room , lots of snapchat filters & the red mouse slowly getting worn with love' },
    { year: 2021, images: 13, featured: 2, videos: 0, copy: 'our brief waterloo chapter : the first & last time stubby moved out with me . it was stressful for both of us , so home became her forever base after that' },
    { year: 2022, images: 9, featured: 3, videos: 0, copy: 'the year of hats . she did not approve , but unfortunately she looked extremely cute' },
    { year: 2023, images: 7, featured: 1, videos: 4, copy: 'live photos took over , a bad chapter ended & i got my stubby tattoo a couple months later ♡' },
    { year: 2024, images: 7, featured: 7, videos: 7, copy: 'a quieter year of recovering , hanging out together & noticing the first little signs that my girl was getting older' },
    { year: 2025, images: 9, featured: 8, videos: 0, copy: 'more home days , more naps & the beginning of her monthly scrapbook on this site' }
  ];

  const imagePath = (year, index) => `../../images/stubby/chronology/${year}/stubby-${year}-${String(index).padStart(2, '0')}.jpg`;
  const videoPath = (year, index) => `../../images/stubby/chronology/${year}/stubby-${year}-video-${String(index).padStart(2, '0')}.mp4`;

  function makePhoto(year, index, featured) {
    const button = document.createElement('button');
    const image = document.createElement('img');
    const caption = `Stubby in ${year}, memory ${index}`;

    button.className = featured ? 'stubby-featured-photo' : 'stubby-memory-photo';
    button.type = 'button';
    button.dataset.full = imagePath(year, index);
    button.dataset.caption = caption;
    button.setAttribute('aria-label', `open ${caption.toLowerCase()}`);
    image.alt = caption;
    image.loading = 'lazy';
    image.decoding = 'async';
    if (featured) image.src = imagePath(year, index);
    else image.dataset.src = imagePath(year, index);
    button.appendChild(image);
    return button;
  }

  function makeYearCard(entry) {
    const card = document.createElement('article');
    const heading = document.createElement('div');
    const year = document.createElement('h3');
    const count = document.createElement('span');
    const copy = document.createElement('p');
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const gallery = document.createElement('div');
    const morePhotos = entry.images - 1;
    const parts = [`${morePhotos} more photo${morePhotos === 1 ? '' : 's'}`];

    card.className = 'stubby-year-card';
    heading.className = 'stubby-year-heading';
    year.textContent = entry.year;
    count.textContent = `${entry.images} photos${entry.videos ? ` + ${entry.videos} video${entry.videos === 1 ? '' : 's'}` : ''}`;
    copy.className = 'stubby-year-copy';
    copy.textContent = entry.copy;
    details.className = 'stubby-year-details';
    gallery.className = 'stubby-memory-grid';
    if (entry.videos) parts.push(`${entry.videos} little video${entry.videos === 1 ? '' : 's'}`);
    summary.textContent = `open ${parts.join(' + ')}`;

    heading.append(year, count);
    card.append(heading, makePhoto(entry.year, entry.featured, true), copy);

    for (let index = 1; index <= entry.images; index += 1) {
      if (index !== entry.featured) gallery.appendChild(makePhoto(entry.year, index, false));
    }

    for (let index = 1; index <= entry.videos; index += 1) {
      const video = document.createElement('video');
      const source = document.createElement('source');
      video.className = 'stubby-memory-video';
      video.controls = true;
      video.playsInline = true;
      video.preload = 'none';
      video.setAttribute('aria-label', `Stubby in ${entry.year}, little video ${index}`);
      source.dataset.src = videoPath(entry.year, index);
      source.type = 'video/mp4';
      video.appendChild(source);
      gallery.appendChild(video);
    }

    details.append(summary, gallery);
    details.addEventListener('toggle', () => {
      if (!details.open || details.dataset.loaded) return;
      details.querySelectorAll('[data-src]').forEach((asset) => {
        asset.src = asset.dataset.src;
        asset.removeAttribute('data-src');
      });
      details.querySelectorAll('video').forEach((video) => video.load());
      details.dataset.loaded = 'true';
    });
    card.appendChild(details);
    return card;
  }

  years.forEach((entry) => timeline.appendChild(makeYearCard(entry)));

  const dialog = document.getElementById('stubby-memory-dialog');
  const largeImage = document.getElementById('stubby-memory-large');
  const dialogCaption = document.getElementById('stubby-memory-caption');
  if (!dialog || !largeImage || !dialogCaption) return;

  timeline.addEventListener('click', (event) => {
    const photo = event.target.closest('[data-full]');
    if (!photo) return;
    largeImage.src = photo.dataset.full;
    largeImage.alt = photo.dataset.caption;
    dialogCaption.textContent = photo.dataset.caption;
    dialog.showModal();
  });

  dialog.querySelector('.stubby-memory-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
