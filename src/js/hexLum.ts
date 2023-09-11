export default function hexLum(H: any) {
  H = JSON.stringify(H).replaceAll('"', '');
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (H.length === 4) {
    r = parseInt("0x" + H[1] + H[1]);
    g = parseInt("0x" + H[2] + H[2]);
    b = parseInt("0x" + H[3] + H[3]);
  } else if (H.length === 7) {
    r = parseInt("0x" + H[1] + H[2]);
    g = parseInt("0x" + H[3] + H[4]);
    b = parseInt("0x" + H[5] + H[6]);
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b)
  let cmax = Math.max(r, g, b)
  let l = (cmax + cmin) / 2;
  l = +(l * 100).toFixed(1);

  return l >= 70;
}