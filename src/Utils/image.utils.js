
import sharp from "sharp";

export const checkImageQuality = async (filePath) => {
  const image = sharp(filePath);
  const metadata = await image.metadata();

  const MIN_WIDTH = 224;
  const MIN_HEIGHT = 224;
  const isLowResolution = metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT;

  const { data, info } = await sharp(filePath)
    .greyscale()
    .resize(512, 512, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Array.from(new Uint8Array(data));
  const width = info.width;
  const height = info.height;

 
  const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
  const variance =
    pixels.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / pixels.length;

 
  let laplacianSum = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const lap =
        -pixels[idx - width] +
        -pixels[idx - 1] +
        4 * pixels[idx] +
        -pixels[idx + 1] +
        -pixels[idx + width];
      laplacianSum += lap * lap;
      count++;
    }
  }
  const laplacianVariance = laplacianSum / count;

  
  const isBlurry = laplacianVariance < 15 

  return {
    width: metadata.width,
    height: metadata.height,
    variance: Math.round(variance),
    laplacianVariance: Math.round(laplacianVariance),
    isLowResolution,
    isBlurry,
  };
};