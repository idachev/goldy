declare module 'hi-base32' {
  export function encode(buffer: Uint8Array | string): string;
  export function decode(str: string): ArrayBuffer;
}