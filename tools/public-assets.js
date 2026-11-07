const path = require('node:path');

function versionAssetLinks(source, page, versions) {
  return source.replace(/(<(?:script|link)\b[^>]*\b(?:src|href)=["'])([^"']+)(["'])/gi, (match, prefix, url, quote) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return match;
    const assetPath = url.split(/[?#]/)[0];
    const file = path.posix.normalize(assetPath.startsWith('/')
      ? assetPath.slice(1) : path.posix.join(path.posix.dirname(page), assetPath));
    const version = versions.get(file);
    return version ? `${prefix}${assetPath}?v=${version}${quote}` : match;
  });
}

module.exports = { versionAssetLinks };
