// Recorte de producto en el navegador: si la foto tiene fondo claro y parejo (foto de estudio),
// se rellena desde los bordes todo lo parecido al fondo y se vuelve transparente, con borde suave.
// El relleno parte del borde, así los blancos internos (queso, cebolla, lactonesa) no se agujerean.
// Fotos con fondo oscuro o cargado se devuelven tal cual.

const cache = new Map<string, Promise<string>>();

export function cutout(src: string): Promise<string> {
  if (!cache.has(src)) cache.set(src, make(src).catch(() => src));
  return cache.get(src)!;
}

/** Puro, para poder testearlo: devuelve false si el fondo no es claro (no recorta). */
export function knockOut(d: Uint8ClampedArray, w: number, h: number, near = 14, far = 46): boolean {
  let r = 0, g = 0, b = 0, n = 0;
  const border: number[] = [];
  for (let x = 0; x < w; x++) border.push(x, (h - 1) * w + x);
  for (let y = 1; y < h - 1; y++) border.push(y * w, y * w + w - 1);
  for (const p of border) {
    r += d[p * 4];
    g += d[p * 4 + 1];
    b += d[p * 4 + 2];
    n++;
  }
  r /= n;
  g /= n;
  b /= n;
  if ((r + g + b) / 3 < 190) return false;

  const dist = (p: number) => Math.hypot(d[p * 4] - r, d[p * 4 + 1] - g, d[p * 4 + 2] - b);
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  for (const p of border) {
    if (!seen[p] && dist(p) < far) {
      seen[p] = 1;
      stack.push(p);
    }
  }
  while (stack.length) {
    const p = stack.pop()!;
    // Alfa proporcional a cuánto se aleja del fondo: borde suave y las sombras quedan semitransparentes.
    d[p * 4 + 3] = Math.round(Math.min(1, Math.max(0, (dist(p) - near) / (far - near))) * 255);
    const x = p % w;
    for (const q of [p - w, p + w, x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1]) {
      if (q >= 0 && q < w * h && !seen[q] && dist(q) < far) {
        seen[q] = 1;
        stack.push(q);
      }
    }
  }
  return true;
}

async function make(src: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (!knockOut(data.data, canvas.width, canvas.height)) return src;
  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL("image/png");
}
