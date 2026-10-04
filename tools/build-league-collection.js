const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'shrines', 'league', 'league-inventory.json');
const OUTPUT_PATH = path.join(ROOT, 'shrines', 'league', 'league-collection.generated.js');
const SKIN_DIR = path.join(ROOT, 'images', 'league', 'skins');
const CHROMA_DIR = path.join(ROOT, 'images', 'league', 'chromas');
const COMMUNITY_BASE = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default';
const DATA_DRAGON_SPLASH = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash';
const force = process.argv.includes('--force');

function shortChromaName(skinName, chromaName) {
  const prefix = `${skinName} (`;
  return chromaName.startsWith(prefix) && chromaName.endsWith(')')
    ? chromaName.slice(prefix.length, -1)
    : chromaName;
}

function availabilityType(description = '') {
  if (/bundle exclusive/i.test(description)) return 'bundle';
  if (/loot exclusive/i.test(description)) return 'event';
  if (/awarded to players/i.test(description)) return 'ranked';
  return '';
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function writeOptimizedAsset(job) {
  if (!force) {
    try {
      await fs.access(job.output);
      return;
    } catch {
      // Generate missing assets below.
    }
  }

  const input = await fetchBuffer(job.url);
  const pipeline = sharp(input);
  if (job.kind === 'splash') {
    pipeline.resize(640, 360, { fit: 'cover', position: 'attention' });
  } else {
    pipeline.resize(180, 180, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }
  await pipeline.webp({ quality: 82, alphaQuality: 92 }).toFile(job.output);
}

async function runPool(jobs, size = 8) {
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const index = cursor;
      cursor += 1;
      await writeOptimizedAsset(jobs[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, jobs.length) }, worker));
}

function assertCount(champion, label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${champion} ${label}: expected ${expected}, received ${actual}`);
  }
}

async function build() {
  const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
  const collection = {
    snapshotDate: config.snapshotDate,
    accountTotals: config.accountTotals,
    sources: {
      metadata: 'CommunityDragon game-client data',
      splashes: 'Riot Games Data Dragon',
    },
    champions: {},
  };
  const jobs = [];

  await fs.mkdir(SKIN_DIR, { recursive: true });
  await fs.mkdir(CHROMA_DIR, { recursive: true });

  for (const [key, championConfig] of Object.entries(config.champions)) {
    const response = await fetch(`${COMMUNITY_BASE}/v1/champions/${championConfig.id}.json`);
    if (!response.ok) throw new Error(`Unable to fetch ${key} metadata: ${response.status}`);
    const metadata = await response.json();
    const missingSkins = new Set(championConfig.missingSkins || []);
    const officialSkins = championConfig.includeBase ? metadata.skins : metadata.skins.slice(1);

    const skins = officialSkins.map((skin) => {
      const officialName = skin.name;
      const skinNumber = skin.id - (championConfig.id * 1000);
      const owned = !missingSkins.has(officialName);
      const missingChromas = new Set(championConfig.missingChromas?.[officialName] || []);
      const officialChromas = Array.isArray(skin.chromas) ? skin.chromas : [];
      const customChromas = championConfig.customChromas?.[officialName] || [];
      const splashFile = `${key}-${skinNumber}.webp`;

      jobs.push({
        kind: 'splash',
        url: `${DATA_DRAGON_SPLASH}/${championConfig.assetName}_${skinNumber}.jpg`,
        output: path.join(SKIN_DIR, splashFile),
      });

      const chromas = officialChromas.map((chroma) => {
        const name = shortChromaName(officialName, chroma.name);
        const chromaFile = `${key}-${chroma.id}.webp`;
        const assetPath = chroma.chromaPath
          .replace('/lol-game-data/assets/', '')
          .toLowerCase();
        jobs.push({
          kind: 'chroma',
          url: `${COMMUNITY_BASE}/${assetPath}`,
          output: path.join(CHROMA_DIR, chromaFile),
        });
        return {
          id: chroma.id,
          name,
          owned: owned && !missingChromas.has(name),
          image: `../../images/league/chromas/${chromaFile}`,
          colors: chroma.colors || [],
          availability: availabilityType(chroma.description),
          description: chroma.description || '',
        };
      });

      customChromas.forEach((chroma, index) => {
        chromas.push({
          id: `custom-${key}-${skinNumber}-${index}`,
          name: chroma.name,
          owned: chroma.owned,
          image: '',
          colors: chroma.colors || [],
          availability: 'special',
          description: chroma.description || '',
        });
      });

      return {
        id: skin.id,
        number: skinNumber,
        name: championConfig.skinAliases?.[officialName] || officialName,
        officialName,
        owned,
        image: `../../images/league/skins/${splashFile}`,
        note: championConfig.skinNotes?.[officialName] || '',
        chromas,
      };
    });

    const counts = {
      skins: skins.length,
      ownedSkins: skins.filter((skin) => skin.owned).length,
      chromas: skins.reduce((total, skin) => total + skin.chromas.length, 0),
      ownedChromas: skins.reduce((total, skin) => total + skin.chromas.filter((chroma) => chroma.owned).length, 0),
    };

    Object.entries(championConfig.expected).forEach(([label, expected]) => {
      assertCount(key, label, counts[label], expected);
    });

    collection.champions[key] = {
      name: key,
      summary: championConfig.summary,
      counts,
      skins,
    };
  }

  await runPool(jobs);
  const output = `window.me0wberryLeagueCollection = ${JSON.stringify(collection, null, 2)};\n`;
  await fs.writeFile(OUTPUT_PATH, output, 'utf8');
  console.log(`League collection built: ${jobs.length} optimized assets and ${Object.keys(collection.champions).length} champion cabinets.`);
}

build().catch((error) => {
  console.error(`League collection build failed: ${error.message}`);
  process.exitCode = 1;
});
