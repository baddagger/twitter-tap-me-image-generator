// Twitter Tap Me (Phantom Tank) Generator

interface State {
  thumbImage: HTMLImageElement | null;
  fullImage: HTMLImageElement | null;
  isProcessing: boolean;
  currentLang: 'zh' | 'en' | 'ja' | 'ko';
  compressedOutput: Uint8Array | null;
}

const state: State = {
  thumbImage: null,
  fullImage: null,
  isProcessing: false,
  currentLang: 'zh',
  compressedOutput: null,
};

let imageWorker: Worker | null = null;

function getImageWorker(): Worker {
  if (!imageWorker) {
    imageWorker = new Worker(new URL('./image.worker.ts', import.meta.url), { type: 'module' });
  }
  return imageWorker;
}

// Translation dictionary
const translations = {
  zh: {
    "subtitle": "推特新版“点开变图”双层图生成器",
    "card1-title": "1. 配置输入图像",
    "card1-desc": "💡 表图（封面）是里图（大图）的一部分且位置对应时拥有最佳分离效果。",
    "label-thumb": "表图 (在推特时间线预览时显示的图片)",
    "upload-thumb-text": "点击或拖拽上传表图",
    "upload-thumb-hint": "建议使用比例 1:1，色彩较简单的图",
    "label-full": "里图 (点击展开后看到的完整画面)",
    "upload-full-text": "点击或拖拽上传里图",
    "upload-full-hint": "建议使用与表图相同的比例 (1:1)",
    "card2-title": "2. 生成设置",
    "label-aspect": "图片比例",
    "desc-aspect": "设置输出图像的宽高比。不同比例会对应进行裁切。",
    "label-pattern": "交错掩码图案",
    "option-tetromino": "4x4 T-Tetromino (抗摩尔纹, 推荐)",
    "option-checkerboard": "2x2 Checkerboard (经典棋盘格)",
    "desc-pattern": "T-Tetromino 能够以无规则感拼接，在缩小时能极大减少摩尔纹干扰。",
    "label-resolution": "目标分辨率",
    "desc-resolution": "分辨率需足够大以触发推特 timeline 强行 Nearest-Neighbor 降采样机制。",
    "label-compression": "PNG 压缩方式",
    "option-lossless": "无损 (最高画质)",
    "option-q256": "256 色 (体积较小 / 推荐)",
    "option-q128": "128 色 (体积更小)",
    "option-q64": "64 色 (体积最小)",
    "option-q32": "32 色 (极限压缩)",
    "option-q16": "16 色 (最大压缩)",
    "desc-compression": "无损模式保留全部画质。量化色彩选项能显著缩小文件，色彩精度会降低，但点开变图效果依然有效。",
    "btn-generate": "生成 Tap Me 图片",
    "btn-download": "下载 PNG",
    "card3-title": "3. 推特渲染模拟器",
    "timeline-title": "移动端 Timeline 预览",
    "timeline-hint": "每2x2像素降采样为1个像素 (Offset 0,1)",
    "timeline-desc": "在推特时间线浏览时，算法仅采纳表图像素点，里图完全隐藏。",
    "click-title": "点击大图预览",
    "click-hint": "每2x2像素降采样为1个像素 (Offset 1,1)",
    "click-desc": "用户点击或查看大图时，算法采样偏置切换，里图内容显露。",
    "inspect-title": "1:1 输出像素微观预览",
    "inspect-overlay": "像素级放大",
    "status-label": "状态:",
    "status-idle": "等待输入...",
    "status-processing": "图像处理中...",
    "status-compressing": "正在压缩 PNG...",
    "status-success": "生成成功！",
    "alert-thumb": "请先上传表图！",
    "alert-full": "请先上传里图！",
    "error-text": "错误: ",
    "inspect-hint": "生成的图片包含高频像素网络。放大后可看见交错分布的凸字形像素。",
    "label-force-transparent": "强制左上角首个像素半透明 (90% Alpha)",
    "desc-force-transparent": "将左上角首个像素 (1x1) 设为 90% 不透明度的半透明。这可以欺骗推特 (Twitter) 强制保留无损 PNG 格式，防止其被优化转换为 JPEG 导致双层图失效。",
    "warning-size": "⚠️ 警告：文件大小超过 1.46 MB，上传推特可能会被强行压缩为 JPEG 导致双层图失效！建议在“PNG 压缩方式”中选择 256 色，或调小目标分辨率。",
    "suffix-recommend": " (2x 缩放, 推荐)",
    "suffix-hd": " (3x 缩放, 高清)",
    "suffix-4x": " (4x 缩放)"
  },
  en: {
    "subtitle": "Twitter Click-to-Reveal Double-Layer Image Generator",
    "card1-title": "1. Configure Input Images",
    "card1-desc": "💡 Best effect is achieved when the cover image is a part of the hidden image and their positions align perfectly.",
    "label-thumb": "Cover Image (Visible on timeline thumbnail)",
    "upload-thumb-text": "Click or drag to upload cover image",
    "upload-thumb-hint": "Recommended 1:1 ratio, simple color image",
    "label-full": "Hidden Image (Visible when expanded or tapped)",
    "upload-full-text": "Click or drag to upload hidden image",
    "upload-full-hint": "Recommended same 1:1 ratio as cover image",
    "card2-title": "2. Generation Settings",
    "label-aspect": "Image Ratio",
    "desc-aspect": "Set the aspect ratio of the output image. Different ratios will be cropped accordingly.",
    "label-pattern": "Interlocking Pattern",
    "option-tetromino": "4x4 T-Tetromino (Anti-moire, Recommended)",
    "option-checkerboard": "2x2 Checkerboard (Classic Checkerboard)",
    "desc-pattern": "T-Tetromino tiling provides organic patterns, greatly reducing moiré artifacts when scaled.",
    "label-resolution": "Target Resolution",
    "desc-resolution": "Resolution must be large enough to trigger Twitter timeline Nearest Neighbor downsampling.",
    "label-compression": "PNG Compression",
    "option-lossless": "Lossless (Max Quality)",
    "option-q256": "256 Colors (Smaller / Recommended)",
    "option-q128": "128 Colors (Even Smaller)",
    "option-q64": "64 Colors (Smallest)",
    "option-q32": "32 Colors (Extreme)",
    "option-q16": "16 Colors (Maximum)",
    "desc-compression": "Lossless keeps full quality. Color-quantized options produce smaller files with reduced color fidelity; the tap-me effect still works.",
    "btn-generate": "Generate Tap Me Image",
    "btn-download": "Download PNG",
    "card3-title": "3. Twitter Render Simulator",
    "timeline-title": "Mobile Timeline Preview",
    "timeline-hint": "Downsampled 2x2 pixels to 1 pixel (Offset 0,1)",
    "timeline-desc": "When browsing on the timeline, the algorithm only selects cover pixels; the hidden image is completely concealed.",
    "click-title": "Click to Expand Preview",
    "click-hint": "Downsampled 2x2 pixels to 1 pixel (Offset 1,1)",
    "click-desc": "When expanded, the sampling offset shifts, revealing the full hidden image content.",
    "inspect-title": "1:1 Output Pixels Micro-Preview",
    "inspect-overlay": "Pixel-Level Zoom",
    "status-label": "Status:",
    "status-idle": "Waiting for inputs...",
    "status-processing": "Processing image...",
    "status-compressing": "Compressing PNG...",
    "status-success": "Generated successfully!",
    "alert-thumb": "Please upload a cover image first!",
    "alert-full": "Please upload a hidden image first!",
    "error-text": "Error: ",
    "inspect-hint": "The generated image contains a high-frequency grid. Zoom in to see the interlocking tetrominoes.",
    "label-force-transparent": "Force top-left pixel semi-transparent (90% Alpha)",
    "desc-force-transparent": "Forces the top-left pixel (1x1) to be semi-transparent (90% alpha). This forces Twitter to keep the lossless PNG format and prevents conversion to JPEG.",
    "warning-size": "⚠️ Warning: File size exceeds 1.46 MB. Uploading to Twitter/X may trigger force-compression to JPEG, breaking the effect! Recommend selecting 256 Colors or lowering target resolution.",
    "suffix-recommend": " (2x scale, Recommended)",
    "suffix-hd": " (3x scale, HD)",
    "suffix-4x": " (4x scale)"
  },
  ja: {
    "subtitle": "Twitter新版「クリックで画像変化」ダブルレイヤー画像作成器",
    "card1-title": "1. 入力画像の設定",
    "card1-desc": "💡 表画像が裏画像の一部であり、位置が完全に一致している場合に最高の効果が得られます。",
    "label-thumb": "表画像 (タイムラインのサムネイルで表示される画像)",
    "upload-thumb-text": "クリックまたはドラッグで表画像をアップロード",
    "upload-thumb-hint": "アスペクト比 1:1、シンプルな配色の画像を推奨",
    "label-full": "裏画像 (クリックして拡大したときに表示される画像)",
    "upload-full-text": "クリックまたはドラッグで裏画像をアップロード",
    "upload-full-hint": "表画像と同じアスペクト比 (1:1) を推奨",
    "card2-title": "2. 生成设置",
    "label-aspect": "画像比率",
    "desc-aspect": "出力画像のアスペクト比を設定します。比率に合わせてクロップされます。",
    "label-pattern": "インターロックパターン",
    "option-tetromino": "4x4 T-Tetromino (モアレ防止、推奨)",
    "option-checkerboard": "2x2 Checkerboard (クラシックチェッカーボード)",
    "desc-pattern": "T-Tetrominoは不規則感のあるタイリングにより、縮小時のモアレ干渉を大幅に低減します。",
    "label-resolution": "ターゲット解像度",
    "desc-resolution": "解像度はTwitter의 타임라인でNearest Neighborダウンサンプリングをトリガーするのに十分な大きさである必要があります。",
    "label-compression": "PNG 圧縮方式",
    "option-lossless": "ロスレス (最高品質)",
    "option-q256": "256色 (小サイズ / 推奨)",
    "option-q128": "128色 (さらに小さい)",
    "option-q64": "64色 (最小サイズ)",
    "option-q32": "32色 (極限圧縮)",
    "option-q16": "16色 (最大圧縮)",
    "desc-compression": "ロスレスは画質をそのまま保持します。色数を減らすオプションはファイルサイズを大幅に削減しますが、色の精度が低下します。Tap Me 効果自体は問題なく機能します。",
    "btn-generate": "Tap Me 画像を生成",
    "btn-download": "PNG をダウンロード",
    "card3-title": "3. Twitterレンダリングシミュレーター",
    "timeline-title": "モバイル版タイムラインのプレビュー",
    "timeline-hint": "2x2ピクセルを1ピクセルにダウンサンプリング (オフセット 0,1)",
    "timeline-desc": "タイムライン閲覧時は、アルゴリズムが表画像のピクセルのみをサンプリングするため、裏画像は完全に隠されます。",
    "click-title": "クリック拡大のプレビュー",
    "click-hint": "2x2ピクセルを1ピクセルにダウンサンプリング (オフセット 1,1)",
    "click-desc": "ユーザーがクリックして拡大表示すると、サンプリングのオフセットが切り替わり、裏画像の内容が現れます。",
    "inspect-title": "1:1 出力ピクセルのミクロプレビュー",
    "inspect-overlay": "ピクセルレベル拡大",
    "status-label": "ステータス:",
    "status-idle": "入力待ち...",
    "status-processing": "画像処理中...",
    "status-compressing": "PNG を圧縮中...",
    "status-success": "生成完了！",
    "alert-thumb": "先に表画像をアップロードしてください！",
    "alert-full": "先に裏画像をアップロードしてください！",
    "error-text": "エラー: ",
    "inspect-hint": "生成された画像には高周波ピクセルグリッドが含まれています。拡大するとインターロックされたTテトロミノピクセルが確認できます。",
    "label-force-transparent": "左上の最初の1ピクセルを強制的に半透明にする (90% Alpha)",
    "desc-force-transparent": "左上の最初の1ピクセル (1x1) を強制的に半透明 (90%の不透明度) に設定します。これにより、TwitterがロスレスPNG形式を維持し、JPEGへの変換を防ぎます。",
    "warning-size": "⚠️ 警告：ファイルサイズが 1.46 MB を超えています。TwitterにアップロードするとJPEGに強制変換され、効果が失われる可能性があります！256色圧縮を選択するか、解像度を下げてください。",
    "suffix-recommend": " (2xスケール, 推奨)",
    "suffix-hd": " (3xスケール, 高画質)",
    "suffix-4x": " (4xスケール)"
  },
  ko: {
    "subtitle": "트위터 신버전 \"클릭하면 바뀌는 이미지\" 더블 레이어 이미지 생성기",
    "card1-title": "1. 입력 이미지 설정",
    "card1-desc": "💡 겉 이미지가 속 이미지의 일부이고 위치가 일치할 때 가장 완벽한 효과를 낼 수 있습니다.",
    "label-thumb": "겉 이미지 (타임라인 썸네일에서 보이는 이미지)",
    "upload-thumb-text": "클릭 또는 드래그하여 겉 이미지 업로드",
    "upload-thumb-hint": "1:1 비율 및 색상이 단순한 이미지 권장",
    "label-full": "속 이미지 (클릭하여 확대했을 때 보이는 이미지)",
    "upload-full-text": "클릭 또는 드래그하여 속 이미지 업로드",
    "upload-full-hint": "겉 이미지와 동일한 비율 (1:1) 권장",
    "card2-title": "2. 생성 설정",
    "label-aspect": "이미지 비율",
    "desc-aspect": "출력 이미지의 가로세로 비율을 설정합니다. 비율에 따라 이미지가 크롭됩니다.",
    "label-pattern": "교차 마스크 패턴",
    "option-tetromino": "4x4 T-Tetromino (모아레 현상 방지, 권장)",
    "option-checkerboard": "2x2 Checkerboard (클래식 체크판)",
    "desc-pattern": "T-Tetromino는 불규칙하게 배열되어 축소 시 모아레 현상의 간섭을 크게 줄여줍니다.",
    "label-resolution": "대상 해상도",
    "desc-resolution": "트위터 타임라인에서 Nearest Neighbor 다운샘플링 메커니즘을 유도하기 위해 해상도가 충분히 커야 합니다.",
    "label-compression": "PNG 압축 방식",
    "option-lossless": "무손실 (최고 품질)",
    "option-q256": "256색 (작은 크기 / 권장)",
    "option-q128": "128색 (더 작은 크기)",
    "option-q64": "64색 (최소 파일 크기)",
    "option-q32": "32색 (최대 압축)",
    "option-q16": "16색 (극한 압축)",
    "desc-compression": "무손실 모드는 원본 품질을 그대로 유지합니다. 색상 양자화 옵션은 파일 크기를 크게 줄이지만 색상 정확도가 낮아집니다. 탭미 효과는 여전히 정상 작동합니다.",
    "btn-generate": "Tap Me 이미지 생성",
    "btn-download": "PNG 다운로드",
    "card3-title": "3. 트위터 렌더링 시뮬레이터",
    "timeline-title": "모바일 타임라인 미리보기",
    "timeline-hint": "2x2 픽셀당 1픽셀로 다운샘플링 (오프셋 0,1)",
    "timeline-desc": "트위터 타임라인에서 볼 때는 알고리즘이 겉 이미지의 픽셀만 채택하여 속 이미지는 완전히 숨겨집니다.",
    "click-title": "클릭 확대 미리보기",
    "click-hint": "2x2 픽셀당 1픽셀로 다운샘플링 (오프셋 1,1)",
    "click-desc": "사용자가 클릭하여 확대할 때 샘플링 오프셋이 전환되면서 속 이미지의 내용이 드러납니다.",
    "inspect-title": "1:1 출력 픽셀 미세 미리보기",
    "inspect-overlay": "픽셀 레벨 확대",
    "status-label": "상태:",
    "status-idle": "입력 대기 중...",
    "status-processing": "이미지 처리 중...",
    "status-compressing": "PNG 압축 중...",
    "status-success": "생성 완료!",
    "alert-thumb": "먼저 겉 이미지를 업로드해 주세요!",
    "alert-full": "먼저 속 이미지를 업로드해 주세요!",
    "error-text": "오류: ",
    "inspect-hint": "생성된 이미지에는 고주파 픽셀 그리드가 포함되어 있습니다. 확대하면 교차 배열된 T-태트로미노 픽셀을 볼 수 있습니다.",
    "label-force-transparent": "왼쪽 상단 첫 픽셀을 강제로 반투명하게 설정 (90% Alpha)",
    "desc-force-transparent": "왼쪽 상단의 첫 픽셀 (1x1)을 강제로 반투명(90% 불투명도)으로 만듭니다. 이렇게 하면 트위터가 무손실 PNG 형식을 강제로 유지하여 JPEG로 변환되는 것을 방지합니다.",
    "warning-size": "⚠️ 경고: 파일 크기가 1.46 MB를 초과했습니다. 트위터에 업로드할 때 JPEG로 강제 압축되어 효과가 손상될 수 있습니다! 256색 압축을 선택하거나 해상도를 낮추는 것을 권장합니다.",
    "suffix-recommend": " (2x 배율, 권장)",
    "suffix-hd": " (3x 배율, 고화질)",
    "suffix-4x": " (4x 배율)"
  }
};

// DOM Elements
const thumbUploadBox = document.getElementById('thumb-upload-box') as HTMLDivElement;
const thumbFileInput = document.getElementById('thumb-file-input') as HTMLInputElement;
const thumbImagePreview = document.getElementById('thumb-image-preview') as HTMLDivElement;
const btnRemoveThumb = document.getElementById('btn-remove-thumb') as HTMLButtonElement;

const fullUploadBox = document.getElementById('full-upload-box') as HTMLDivElement;
const fullFileInput = document.getElementById('full-file-input') as HTMLInputElement;
const fullImagePreview = document.getElementById('full-image-preview') as HTMLDivElement;
const btnRemoveFull = document.getElementById('btn-remove-full') as HTMLButtonElement;

const selectResolution = document.getElementById('select-resolution') as HTMLSelectElement;
const selectLang = document.getElementById('select-lang') as HTMLSelectElement;
const chkForceTransparent = document.getElementById('chk-force-transparent') as HTMLInputElement;

const btnGenerate = document.getElementById('btn-generate') as HTMLButtonElement;
const btnDownload = document.getElementById('btn-download') as HTMLButtonElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;

// Simulator Canvases
const canvasSimThumb = document.getElementById('canvas-sim-thumb') as HTMLCanvasElement;
const canvasSimFull = document.getElementById('canvas-sim-full') as HTMLCanvasElement;
const canvasSimInspect = document.getElementById('canvas-sim-inspect') as HTMLCanvasElement;

// Background frames (for dynamic aspect ratio sizing)
const simFrames = document.querySelectorAll('.sim-frame') as NodeListOf<HTMLDivElement>;

// Internal Source Canvases
const canvasSourceThumb = document.getElementById('canvas-source-thumb') as HTMLCanvasElement;
const canvasSourceFull = document.getElementById('canvas-source-full') as HTMLCanvasElement;
const canvasOutput = document.getElementById('canvas-output') as HTMLCanvasElement;

// Initialize
function init() {
  setupEventListeners();
  setupLanguageSupport();
  updateResolutionOptions();
  updateSimulatorAspect();
}

// Language and Translation Helper Functions
function setupLanguageSupport() {
  // Detect language: LocalStorage -> Browser Language -> Fallback 'en'
  const savedLang = localStorage.getItem('tapme-lang');
  let defaultLang: 'zh' | 'en' | 'ja' | 'ko' = 'en';

  if (savedLang && ['zh', 'en', 'ja', 'ko'].includes(savedLang)) {
    defaultLang = savedLang as any;
  } else {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) defaultLang = 'zh';
    else if (browserLang.startsWith('ja')) defaultLang = 'ja';
    else if (browserLang.startsWith('ko')) defaultLang = 'ko';
  }

  selectLang.value = defaultLang;
  applyTranslations(defaultLang);

  selectLang.addEventListener('change', () => {
    const chosenLang = selectLang.value as any;
    localStorage.setItem('tapme-lang', chosenLang);
    applyTranslations(chosenLang);
  });
}

function applyTranslations(lang: 'zh' | 'en' | 'ja' | 'ko') {
  state.currentLang = lang;

  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;

    const dict = translations[lang];
    const translation = dict[key as keyof typeof dict];
    if (translation) {
      el.textContent = translation;
    }
  });

  // Keep dynamic status text and resolution dropdowns updated
  updateStatusDisplay();
  updateResolutionOptions();
}

function updateStatusDisplay() {
  if (statusText.classList.contains('status-idle')) {
    statusText.textContent = translations[state.currentLang]['status-idle'];
    statusText.parentElement?.querySelector('.size-warning')?.remove();
  } else if (statusText.classList.contains('status-processing')) {
    statusText.textContent = translations[state.currentLang]['status-processing'];
    statusText.parentElement?.querySelector('.size-warning')?.remove();
  } else if (statusText.classList.contains('status-success')) {
    const prevText = statusText.textContent || '';
    if (prevText.includes('MB)')) {
      // Keep it as sizeMsg is already attached
    } else {
      statusText.textContent = translations[state.currentLang]['status-success'];
    }
  } else if (statusText.classList.contains('status-error')) {
    statusText.textContent = translations[state.currentLang]['error-text'] + (statusText.dataset.error || '');
    statusText.parentElement?.querySelector('.size-warning')?.remove();
  }
}

// Dynamically populate resolution select options based on aspect ratio
function updateResolutionOptions() {
  const activeRatioChip = document.querySelector('#aspect-ratio-chips .chip-btn.active') as HTMLButtonElement;
  const aspect = activeRatioChip ? activeRatioChip.dataset.value : '2:3';

  let ratioW = 1;
  let ratioH = 1;
  const parts = aspect ? aspect.split(':') : [];
  if (parts.length === 2) {
    ratioW = parseInt(parts[0] || '1', 10);
    ratioH = parseInt(parts[1] || '1', 10);
  }

  const currentSelectedValue = selectResolution.value || '1400';
  selectResolution.innerHTML = '';

  const dict = translations[state.currentLang];
  // baseWidths are multiples of 700/704 pixels to fit the timeline container perfectly
  const baseWidths = [1400, 2112, 2800];
  baseWidths.forEach(wSize => {
    let w = wSize;
    let h = Math.round(wSize * (ratioH / ratioW));

    // Nearest Neighbor grid alignment requires multiples of 2
    w = Math.floor(w / 2) * 2;
    h = Math.floor(h / 2) * 2;

    const option = document.createElement('option');
    option.value = w.toString();
    
    let labelSuffix = '';
    if (wSize === 1400) labelSuffix = dict['suffix-recommend'] || '';
    else if (wSize === 2112) labelSuffix = dict['suffix-hd'] || '';
    else if (wSize === 2800) labelSuffix = dict['suffix-4x'] || '';
    
    option.textContent = `${w} x ${h}${labelSuffix}`;

    if (w.toString() === currentSelectedValue) {
      option.selected = true;
    } else if (!currentSelectedValue && wSize === 1400) {
      option.selected = true;
    }

    selectResolution.appendChild(option);
  });
}

// Update aspect ratio of simulator preview frames in real-time
function updateSimulatorAspect() {
  const activeRatioChip = document.querySelector('#aspect-ratio-chips .chip-btn.active') as HTMLButtonElement;
  const aspect = activeRatioChip ? activeRatioChip.dataset.value : '1:1';
  if (!aspect) return;

  const aspectValue = aspect.replace(':', ' / ');
  simFrames.forEach((frame: HTMLDivElement) => {
    frame.style.aspectRatio = aspectValue;
  });
}

// Read the currently selected PNG compression level from the active chip (0=lossless, 256, 64)
function getCompressionCnum(): number {
  const active = document.querySelector('#compression-chips .chip-btn.active') as HTMLButtonElement | null;
  return active ? parseInt(active.dataset.value || '0', 10) : 0;
}

// Event Listeners
function setupEventListeners() {
  // Upload Box drag & drop
  setupDragAndDrop(thumbUploadBox, thumbFileInput, handleThumbSelect);
  setupDragAndDrop(fullUploadBox, fullFileInput, handleFullSelect);

  thumbFileInput.addEventListener('change', (e: Event) => handleFileChange(e, handleThumbSelect));
  fullFileInput.addEventListener('change', (e: Event) => handleFileChange(e, handleFullSelect));

  btnRemoveThumb.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    state.thumbImage = null;
    thumbImagePreview.classList.add('hidden');
    thumbFileInput.value = '';
    statusText.parentElement?.querySelector('.size-warning')?.remove();
  });

  btnRemoveFull.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    state.fullImage = null;
    fullImagePreview.classList.add('hidden');
    fullFileInput.value = '';
    statusText.parentElement?.querySelector('.size-warning')?.remove();
  });

  // Ratio Chips
  const ratioChips = document.querySelectorAll('#aspect-ratio-chips .chip-btn') as NodeListOf<HTMLButtonElement>;
  ratioChips.forEach(btn => {
    btn.addEventListener('click', () => {
      ratioChips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateResolutionOptions();
      updateSimulatorAspect();
    });
  });

  // Compression Chips
  const compressionChips = document.querySelectorAll('#compression-chips .chip-btn') as NodeListOf<HTMLButtonElement>;
  compressionChips.forEach(btn => {
    btn.addEventListener('click', () => {
      compressionChips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Action Buttons
  btnGenerate.addEventListener('click', generateTapMeImage);
  btnDownload.addEventListener('click', downloadOutputImage);
}

function setupDragAndDrop(box: HTMLDivElement, input: HTMLInputElement, callback: (file: File) => void) {
  box.addEventListener('dragover', (e: DragEvent) => {
    e.preventDefault();
    box.style.borderColor = 'var(--accent-green)';
    box.style.background = 'rgba(185, 99, 71, 0.04)';
  });

  box.addEventListener('dragleave', () => {
    box.style.borderColor = '';
    box.style.background = '';
  });

  box.addEventListener('drop', (e: DragEvent) => {
    e.preventDefault();
    box.style.borderColor = '';
    box.style.background = '';

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) callback(file);
    }
  });

  // Stop propagation on input click to prevent bubbling that triggers box click again
  input.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  box.addEventListener('click', () => {
    input.click();
  });
}

function handleFileChange(e: Event, callback: (file: File) => void) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (file) callback(file);
  }
}

function handleThumbSelect(file: File) {
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const img = new Image();
    img.onload = () => {
      state.thumbImage = img;
      const previewImg = thumbImagePreview.querySelector('img') as HTMLImageElement;
      previewImg.src = img.src;
      thumbImagePreview.classList.remove('hidden');
    };
    if (e.target?.result) {
      img.src = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
}

function handleFullSelect(file: File) {
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const img = new Image();
    img.onload = () => {
      state.fullImage = img;
      const previewImg = fullImagePreview.querySelector('img') as HTMLImageElement;
      previewImg.src = img.src;
      fullImagePreview.classList.remove('hidden');
    };
    if (e.target?.result) {
      img.src = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
}

// Main Image Generation function
async function generateTapMeImage() {
  if (state.isProcessing) return;

  const dict = translations[state.currentLang];

  // Validation
  if (!state.thumbImage) {
    alert(dict['alert-thumb']);
    return;
  }
  if (!state.fullImage) {
    alert(dict['alert-full']);
    return;
  }

  state.isProcessing = true;
  statusText.textContent = dict['status-processing'];
  statusText.className = 'status-processing';
  setButtonsDisabled(true);

  // Remove old size warning
  const oldWarning = statusText.parentElement?.querySelector('.size-warning');
  if (oldWarning) oldWarning.remove();

  try {
    const targetWidthInput = parseInt(selectResolution.value, 10);
    const pattern = 'checkerboard';
    const activeRatioChip = document.querySelector('#aspect-ratio-chips .chip-btn.active') as HTMLButtonElement;
    const aspect = activeRatioChip ? activeRatioChip.dataset.value : '2:3';

    // Parse aspect ratios dynamically
    let ratioW = 1;
    let ratioH = 1;
    const parts = aspect ? aspect.split(':') : [];
    if (parts.length === 2) {
      ratioW = parseInt(parts[0] || '1', 10);
      ratioH = parseInt(parts[1] || '1', 10);
    }

    // Fixed width based, calculate height
    let targetWidth = targetWidthInput;
    let targetHeight = Math.round(targetWidth * (ratioH / ratioW));

    // Force dimensions to be multiples of 2 for Nearest Neighbor grid safety
    targetWidth = Math.floor(targetWidth / 2) * 2;
    targetHeight = Math.floor(targetHeight / 2) * 2;

    // Setup source canvases
    canvasSourceThumb.width = targetWidth;
    canvasSourceThumb.height = targetHeight;
    const ctxThumb = canvasSourceThumb.getContext('2d')!;
    drawCroppedImage(ctxThumb, state.thumbImage, targetWidth, targetHeight);

    canvasSourceFull.width = targetWidth;
    canvasSourceFull.height = targetHeight;
    const ctxFull = canvasSourceFull.getContext('2d')!;
    drawCroppedImage(ctxFull, state.fullImage, targetWidth, targetHeight);

    // Get ImageData
    const thumbData = ctxThumb.getImageData(0, 0, targetWidth, targetHeight);
    const fullData = ctxFull.getImageData(0, 0, targetWidth, targetHeight);

    // Slice buffers to ensure a clean Transferable ArrayBuffer copy (avoiding browser/canvas restrictions)
    const thumbBuffer = thumbData.data.buffer.slice(0);
    const fullBuffer = fullData.data.buffer.slice(0);

    const cnum = getCompressionCnum();
    const worker = getImageWorker();

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data;
      if (data.type === 'status') {
        if (data.status === 'compressing') {
          statusText.textContent = dict['status-compressing'];
          statusText.className = 'status-processing';
        }
      } else if (data.type === 'done') {
        const { outBuffer, compressed } = data;

        canvasOutput.width = targetWidth;
        canvasOutput.height = targetHeight;
        const ctxOutput = canvasOutput.getContext('2d')!;
        const outputData = new ImageData(new Uint8ClampedArray(outBuffer), targetWidth, targetHeight);
        ctxOutput.putImageData(outputData, 0, 0);

        // Simulate Twitter Downsampling Previews
        simulatePreviews(outputData, targetWidth, targetHeight);

        state.compressedOutput = new Uint8Array(compressed);

        const mbSize = (state.compressedOutput.length / (1024 * 1024)).toFixed(2);
        const sizeMsg = ` (${mbSize} MB)`;

        statusText.textContent = dict['status-success'] + sizeMsg;
        statusText.className = 'status-success';

        // Check file size warning
        if (state.compressedOutput.length > 1.46 * 1024 * 1024) {
          const warningEl = document.createElement('div');
          warningEl.className = 'size-warning';
          warningEl.style.color = '#ff6b6b';
          warningEl.style.marginTop = '8px';
          warningEl.style.fontSize = '0.9rem';
          warningEl.style.lineHeight = '1.4';
          warningEl.style.fontWeight = '500';
          warningEl.textContent = dict['warning-size'];
          
          const oldWarning = statusText.parentElement?.querySelector('.size-warning');
          if (oldWarning) oldWarning.remove();
          statusText.parentElement?.appendChild(warningEl);
        } else {
          const oldWarning = statusText.parentElement?.querySelector('.size-warning');
          if (oldWarning) oldWarning.remove();
        }

        state.isProcessing = false;
        setButtonsDisabled(false);
      } else if (data.type === 'error') {
        statusText.dataset.error = data.message;
        statusText.className = 'status-error';
        statusText.textContent = dict['error-text'] + data.message;
        state.isProcessing = false;
        setButtonsDisabled(false);
      }
    };

    worker.onerror = (err) => {
      console.error(err);
      statusText.dataset.error = err.message;
      statusText.className = 'status-error';
      statusText.textContent = dict['error-text'] + err.message;
      state.isProcessing = false;
      setButtonsDisabled(false);
    };

    // Send arrays and transfer buffers to worker
    worker.postMessage({
      thumbBuffer,
      fullBuffer,
      targetWidth,
      targetHeight,
      pattern,
      cnum,
      forceTransparent: chkForceTransparent.checked
    }, [thumbBuffer, fullBuffer]);

  } catch (err: any) {
    console.error(err);
    statusText.dataset.error = err.message;
    statusText.className = 'status-error';
    statusText.textContent = dict['error-text'] + err.message;
    state.isProcessing = false;
    setButtonsDisabled(false);
  }
}

// Toggle both action buttons' disabled state (keeps them visible while processing)
function setButtonsDisabled(disabled: boolean) {
  btnGenerate.disabled = disabled;
  // Download button is only meaningful once an image has been generated
  btnDownload.disabled = disabled || !canvasOutput.width || !canvasOutput.height;
}

// Utility to crop & draw images fitted to custom aspect ratio
function drawCroppedImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, targetW: number, targetH: number) {
  const w = img.width;
  const h = img.height;
  const targetRatio = targetW / targetH;
  const imgRatio = w / h;

  let sx = 0, sy = 0, sw = w, sh = h;

  if (imgRatio > targetRatio) {
    // Image is wider than target ratio: crop horizontally
    sw = h * targetRatio;
    sx = (w - sw) / 2;
  } else {
    // Image is taller than target ratio: crop vertically
    sh = w / targetRatio;
    sy = (h - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
}

// Simulate previews using accurate Nearest Neighbor offset extraction
function simulatePreviews(outputData: ImageData, width: number, height: number) {
  const simLongEdge = 400; // Longest edge of simulator canvases
  let simWidth = simLongEdge;
  let simHeight = simLongEdge;

  if (width > height) {
    simHeight = Math.round(simLongEdge * (height / width));
  } else if (height > width) {
    simWidth = Math.round(simLongEdge * (width / height));
  }

  // Force even dimensions
  simWidth = Math.floor(simWidth / 2) * 2;
  simHeight = Math.floor(simHeight / 2) * 2;

  // Set aspect ratio in CSS on simulator frames
  const aspectValue = `${width} / ${height}`;
  simFrames.forEach((frame: HTMLDivElement) => {
    frame.style.aspectRatio = aspectValue;
  });

  // Set canvas dimensions
  canvasSimThumb.width = simWidth;
  canvasSimThumb.height = simHeight;
  canvasSimFull.width = simWidth;
  canvasSimFull.height = simHeight;

  const ctxThumb = canvasSimThumb.getContext('2d')!;
  const ctxFull = canvasSimFull.getContext('2d')!;

  const thumbImgData = ctxThumb.createImageData(simWidth, simHeight);
  const fullImgData = ctxFull.createImageData(simWidth, simHeight);

  const srcPixels = outputData.data;
  const tPixels = thumbImgData.data;
  const fPixels = fullImgData.data;

  // Downsample simulation using Nearest Neighbor sampling offsets
  for (let y = 0; y < simHeight; y++) {
    for (let x = 0; x < simWidth; x++) {
      // Map simulator pixel coordinate (x,y) to source coordinate (srcX, srcY)
      const srcX = Math.floor(x * (width / simWidth));
      const srcY = Math.floor(y * (height / simHeight));

      // 2x2 grid cell base coordinates
      const baseCol = Math.floor(srcX / 2) * 2;
      const baseRow = Math.floor(srcY / 2) * 2;

      // Extract offsets:
      // Cover (ImgA) downsamples using Offset (0,1) -> Top-Right
      const tx = baseCol + 1;
      const ty = baseRow;

      // Hidden (ImgB) downsamples using Offset (1,1) -> Bottom-Right
      const fx = baseCol + 1;
      const fy = baseRow + 1;

      // Map back to 1D index
      const tIdx = (ty * width + tx) * 4;
      const fIdx = (fy * width + fx) * 4;

      const idx = (y * simWidth + x) * 4;

      // Write pixels
      tPixels[idx] = srcPixels[tIdx] ?? 0;
      tPixels[idx + 1] = srcPixels[tIdx + 1] ?? 0;
      tPixels[idx + 2] = srcPixels[tIdx + 2] ?? 0;
      tPixels[idx + 3] = srcPixels[tIdx + 3] ?? 255;

      fPixels[idx] = srcPixels[fIdx] ?? 0;
      fPixels[idx + 1] = srcPixels[fIdx + 1] ?? 0;
      fPixels[idx + 2] = srcPixels[fIdx + 2] ?? 0;
      fPixels[idx + 3] = srcPixels[fIdx + 3] ?? 255;
    }
  }

  ctxThumb.putImageData(thumbImgData, 0, 0);
  ctxFull.putImageData(fullImgData, 0, 0);

  // Zoom Inspect Simulator (Takes a 16x16 slice from center of original output and scales up)
  const inspectSize = 200;
  canvasSimInspect.width = inspectSize;
  canvasSimInspect.height = inspectSize;
  const ctxInspect = canvasSimInspect.getContext('2d')!;
  ctxInspect.imageSmoothingEnabled = false;

  const inspectSliceSize = 16;
  const sx = (width / 2) - (inspectSliceSize / 2);
  const sy = (height / 2) - (inspectSliceSize / 2);

  ctxInspect.drawImage(
    canvasOutput,
    sx, sy, inspectSliceSize, inspectSliceSize,
    0, 0, inspectSize, inspectSize
  );
}

// Download the already-compressed PNG stored in state
function downloadOutputImage() {
  if (state.isProcessing || !state.compressedOutput) return;

  const blob = new Blob([state.compressedOutput.buffer as ArrayBuffer], { type: 'image/png' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timestamp = `${year}${month}${day}_${hours}${minutes}`;

  link.download = `tapme_${timestamp}.png`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Run on load
window.addEventListener('DOMContentLoaded', init);
