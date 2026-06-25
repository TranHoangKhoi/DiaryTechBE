declare module 'xlsx-template' {
  export default class XlsxTemplate {
    constructor(data?: Buffer);
    substitute(sheetName: string | number, substitutions: Record<string, any>): void;
    generate(options?: { type: 'base64' | 'uint8array' | 'arraybuffer' | 'blob' | 'nodebuffer' }): any;
  }
}
