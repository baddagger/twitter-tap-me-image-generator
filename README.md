# Twitter Tap Me Image Generator

A browser-based tool to generate interactive "click-to-reveal" double-layer images optimized for X (Twitter). The generated image displays a preview (cover) on the timeline thumbnail, but reveals a different hidden image when tapped or expanded.

## Principle

For the underlying downsampling mechanics and 4x4 T-Tetromino interlocking mask principles, refer to the detailed analysis in this [Zhihu Article](https://zhuanlan.zhihu.com/p/2035435716495328839).


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

## Tips for Uploading to X

1. **Resolution**: Choose at least `2400 x 2400` or `3072 x 3072` (defaults) to trigger the downsampling resizer.
2. **Format**: Save and upload strictly as a lossless PNG.
3. **Data Saver**: Disable client-side image compression in the mobile app settings before uploading.
