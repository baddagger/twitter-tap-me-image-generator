# Twitter Tap Me Image Generator

A browser-based tool to generate interactive "click-to-reveal" double-layer images optimized for X (Twitter). The generated image displays a preview (cover) on the timeline thumbnail, but reveals a different hidden image when tapped or expanded.

**[Try It Now](https://baddagger.github.io/twitter-tap-me-image-generator/)**

---

## Technical Principles (Based on Empirical Testing)

To achieve the best chance of a successful "click-to-reveal" double-layer effect on X (Twitter), we recommend following these empirical guidelines. Note that behaviors vary depending on upload clients, network environments, and "High-quality uploads" settings in the app.

### 1. Minimizing JPEG Conversion Risk
* **File Size Threshold**: PNG images larger than **~1.46 MB** are highly susceptible to being compressed and converted to JPEG on X's servers. Keeping file sizes below **1.46 MB** (using the **256 colors** option is recommended) helps prevent this.
* **Alpha Channel Protection**: X is more likely to convert fully opaque PNGs to JPEGs. The generator forces the top-left pixel (1x1) to be fully transparent (Alpha=0), which triggers X to preserve the PNG format.

### 2. Alpha Binarization (Critical)
* **No semi-transparent pixels allowed**: The output PNG must have **only fully opaque (Alpha=255) or fully transparent (Alpha=0) pixels**. In indexed-color (palette) PNGs, each palette entry has a corresponding transparency value in the `tRNS` chunk. If any entry has a semi-transparent value (1–254), X's image pipeline appears to apply a different compositing path that blends both checkerboard phases together, completely destroying the double-layer effect.
* **How the generator handles this**: After compositing the two images into the checkerboard grid, all alpha values are binarized with a threshold of 128 (≥128 → 255, <128 → 0). This ensures the `tRNS` chunk contains only `0` and `255` values, matching the format of known working images.

### 3. Aspect Ratio & Grid Alignment
* **Vertical Formats Only**: Currently, **square (1:1) and landscape (horizontal) images are confirmed to fail the click-to-reveal effect in the expanded view**. Only vertical formats (such as **2:3**, **3:4**, or **9:16**) have been shown to work.
* **Width Multiples**: X timeline displays vertical cards at ~700px wide. Using **1400px** (2x) or **2112px** (3x) width aligns best with the timeline downsampling grid.
* **2x2 Checkerboard**: This pattern provides 2-phase redundancy (both odd-sum phases contain the cover, both even-sum phases contain the hidden image). It reduces the chance of blending if the client's downsampling offset shifts by 1 pixel.

### 4. Content Contrast & Blending
* **Watermarks / Logos**: If the logo is colored (e.g. pink), draw it in **both** the cover and hidden images in the same location to avoid transparent masking overlays.
* **Click-to-Reveal Text**: Use **pure black** text on a transparent background. It forms a dark silhouette on the white timeline, and vanishes against the black background on expand.

---

## Setup & Running

Install dependencies:
```bash
bun install
# or npm install
```

Start the development server:
```bash
bun run dev
# or npm run dev
```

Build for production:
```bash
bun run build
# or npm run build
```
