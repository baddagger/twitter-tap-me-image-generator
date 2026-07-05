declare module 'upng-js' {
  const UPNG: {
    encode(imgs: ArrayBuffer[], w: number, h: number, cnum: number, dels: number[]): ArrayBuffer;
    decode(buffer: ArrayBuffer): { width: number; height: number; depth: number; ctype: number; frames: unknown[] };
    toRGBA8(img: ReturnType<typeof UPNG.decode>): ArrayBuffer[];
  };
  export default UPNG;
}
