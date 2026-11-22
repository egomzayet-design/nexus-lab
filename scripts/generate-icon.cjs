/**
 * Generates build/icon.png and build/icon.ico for NEXUS LAB branding.
 */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const OUT = path.join(__dirname, "..", "build");
fs.mkdirSync(OUT, { recursive: true });

function makePng(size) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (size * y + x) << 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const edge = size * 0.42;
      let r = 5, g = 7, b = 5, a = 255;
      if (dist < edge) {
        const glow = Math.max(0, 1 - dist / edge);
        r = Math.floor(5 + 20 * glow);
        g = Math.floor(7 + 180 * glow);
        b = Math.floor(5 + 20 * glow);
        if (dist > edge * 0.72) {
          r = 57;
          g = 255;
          b = 20;
        }
        if (dist < edge * 0.22) {
          r = 232;
          g = 255;
          b = 232;
        }
      } else if (dist < edge + size * 0.04) {
        r = 57;
        g = 255;
        b = 20;
        a = 220;
      } else {
        a = 0;
      }
      png.data[i] = r;
      png.data[i + 1] = g;
      png.data[i + 2] = b;
      png.data[i + 3] = a;
    }
  }
  return PNG.sync.write(png);
}

function pngToIco(pngBuf) {
  // Minimal single-image ICO wrapper
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0); // width 256 -> 0
  entry.writeUInt8(0, 1); // height 256 -> 0
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, pngBuf]);
}

const png256 = makePng(256);
fs.writeFileSync(path.join(OUT, "icon.png"), png256);
fs.writeFileSync(path.join(OUT, "icon.ico"), pngToIco(png256));
console.log("Generated build/icon.png and build/icon.ico");
