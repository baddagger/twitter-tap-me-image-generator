import UPNG from 'upng-js';

const ctx = self as any;

ctx.onmessage = (e: MessageEvent) => {
  const { thumbBuffer, fullBuffer, targetWidth, targetHeight, pattern, cnum, forceTransparent } = e.data;

  const thumbPixels = new Uint8ClampedArray(thumbBuffer);
  const fullPixels = new Uint8ClampedArray(fullBuffer);
  const outPixels = new Uint8ClampedArray(targetWidth * targetHeight * 4);

  // Pixel processing loop
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const idx = (y * targetWidth + x) * 4;

      // Retrieve raw image pixels
      const taR = thumbPixels[idx] ?? 0;
      const taG = thumbPixels[idx + 1] ?? 0;
      const taB = thumbPixels[idx + 2] ?? 0;
      const taA = thumbPixels[idx + 3] ?? 255;

      const faR = fullPixels[idx] ?? 0;
      const faG = fullPixels[idx + 1] ?? 0;
      const faB = fullPixels[idx + 2] ?? 0;
      const faA = fullPixels[idx + 3] ?? 255;

      let isT = false; // Is this a pixel for the Thumbnail Image?

      if (pattern === 'tetromino') {
        // 4x4 T-Tetromino mask formula
        isT = (y % 2 === 0 && x % 4 === 0) || (y % 2 === 1 && x % 4 !== 2);
      } else {
        // 2x2 Checkerboard mask
        isT = (x + y) % 2 === 0;
      }

      if (isT) {
        // Set to Full-View Image (ImgB)
        outPixels[idx] = faR;
        outPixels[idx + 1] = faG;
        outPixels[idx + 2] = faB;
        outPixels[idx + 3] = faA;
      } else {
        // Set to Thumbnail Image (ImgA)
        outPixels[idx] = taR;
        outPixels[idx + 1] = taG;
        outPixels[idx + 2] = taB;
        outPixels[idx + 3] = taA;
      }
    }
  }

  // Force top-left 1x1 pixel to be semi-transparent (90% alpha) if enabled.
  // Twitter's Android pipeline might strip fully transparent (0 alpha) pixels,
  // but preserving a 90% alpha value forces the image format to remain PNG.
  if (forceTransparent && outPixels.length >= 4) {
    outPixels[3] = 230; // 90% alpha (approx. 230/255)
  }

  // Notify main thread that we are starting compression
  ctx.postMessage({ type: 'status', status: 'compressing' });

  try {
    const compressed = UPNG.encode([outPixels.buffer], targetWidth, targetHeight, cnum, [0]);
    ctx.postMessage({
      type: 'done',
      outBuffer: outPixels.buffer,
      compressed: compressed
    }, [outPixels.buffer, compressed]);
  } catch (err: any) {
    ctx.postMessage({
      type: 'error',
      message: err.message || 'PNG Compression failed'
    });
  }
};
