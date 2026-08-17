export type Rgb = [number, number, number];

export const toRgb = (value: string): Rgb | null => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);

  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
};

const channel = (value: number): number => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

export const luminance = ([r, g, b]: Rgb): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

export const contrast = (a: Rgb, b: Rgb): number => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/* APCA 0.1.9, the perceptual measure behind the WCAG 3 draft. Unlike the WCAG
   2.1 ratio it is polarity-aware, so light-on-dark and dark-on-light with the
   same ratio do not score the same. Returned unsigned: the sign only restates
   the polarity, which the swatch beside it already shows. */
const screenY = ([r, g, b]: Rgb): number =>
  0.2126729 * Math.pow(r / 255, 2.4) +
  0.7151522 * Math.pow(g / 255, 2.4) +
  0.072175 * Math.pow(b / 255, 2.4);

const clampBlack = (y: number): number =>
  y < 0.022 ? y + Math.pow(0.022 - y, 1.414) : y;

export const lightnessContrast = (text: Rgb, background: Rgb): number => {
  const textY = clampBlack(screenY(text));
  const backgroundY = clampBlack(screenY(background));

  if (Math.abs(backgroundY - textY) < 0.0005) return 0;

  if (backgroundY > textY) {
    const sapc = (Math.pow(backgroundY, 0.56) - Math.pow(textY, 0.57)) * 1.14;
    return sapc < 0.1 ? 0 : (sapc - 0.027) * 100;
  }

  const sapc = (Math.pow(backgroundY, 0.65) - Math.pow(textY, 0.62)) * 1.14;
  return sapc > -0.1 ? 0 : Math.abs((sapc + 0.027) * 100);
};

export const hex = ([r, g, b]: Rgb): string =>
  "#" +
  [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
