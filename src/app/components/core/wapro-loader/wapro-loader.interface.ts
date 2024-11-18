export class LoaderConfig {
  backgroundColor: string;
  position: string;
  top: number | string;
  left: number | string;
  width: number | string;
  height: number | string;
  maxWidth: number | string;
  maxHeight: number | string;
  innerBgColor: string;
  outerBgColor: string;
  spinnerColor: string;
  border: string;
  logoColor: string;
  constructor(wrapper?: {
    backgroundColor?: string;
    position?: string;
    top?: number | string;
    left?: number | string;
    width?: number | string;
    height?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    innerBgColor?: string;
    outerBgColor?: string;
    spinnerColor?: string;
    logoColor?: string;
    border?: string;
  }) {
    this.backgroundColor = wrapper?.backgroundColor || 'rgba(33, 39, 43, 0.8)';
    this.position = wrapper?.position || 'fixed';
    this.top = wrapper?.top || 0;
    this.left = wrapper?.left || 0;
    this.width = wrapper?.width || '100vw';
    this.height = wrapper?.height || '100vh';
    this.maxWidth = wrapper?.maxWidth || '100%';
    this.maxHeight = wrapper?.maxHeight || '100%';

    this.innerBgColor = wrapper?.innerBgColor || '#DC1E28';
    this.outerBgColor = wrapper?.outerBgColor || '#bc1a22';
    this.spinnerColor = wrapper?.spinnerColor || '#ededed';

    this.logoColor = wrapper?.logoColor || '#fff';
    this.border = wrapper?.border || '3px solid #30393f';
  }
}
