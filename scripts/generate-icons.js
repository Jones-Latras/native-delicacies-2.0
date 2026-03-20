const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convert(srcSvg, outPng, size) {
  const svg = fs.readFileSync(srcSvg);
  await sharp(svg)
    .resize(size, size)
    .png({ quality: 90 })
    .toFile(outPng);
  console.log(`Wrote ${outPng}`);
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const iconsDir = path.join(root, 'public', 'icons');
  const svg192 = path.join(iconsDir, 'icon-192.svg');
  const svg512 = path.join(iconsDir, 'icon-512.svg');
  const out192 = path.join(iconsDir, 'icon-192.png');
  const out512 = path.join(iconsDir, 'icon-512.png');

  if (!fs.existsSync(svg192) || !fs.existsSync(svg512)) {
    console.error('SVG source files not found in', iconsDir);
    process.exit(2);
  }

  try {
    await convert(svg192, out192, 192);
    await convert(svg512, out512, 512);
    console.log('Conversion complete');
  } catch (err) {
    console.error('Conversion failed:', err);
    process.exit(1);
  }
}

main();
