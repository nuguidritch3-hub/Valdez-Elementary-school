import { Jimp } from "jimp";

async function makeCircle() {
  // Read the image
  const image = await Jimp.read("public/logo.png");
  
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2;

  // Make outside of circle transparent
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
      // slightly smaller radius for anti-aliasing effect or to remove edge artifacts
      if (dist > r - 2) {
        // Get the current color
        const color = image.getPixelColor(x, y);
        // Set alpha to 0
        const transparentColor = ((color & 0xFFFFFF00) | 0x00) >>> 0;
        image.setPixelColor(transparentColor, x, y);
      }
    }
  }

  // Save the result
  await image.write("public/logo.png");
  console.log("Done making background transparent.");
}

makeCircle().catch(console.error);
