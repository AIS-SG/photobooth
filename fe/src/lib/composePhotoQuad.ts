import { uploadPhoto } from "./api";

type Rect = { x: number; y: number; w: number; h: number };

type ComposeOptions = {
  design?: { w: number; h: number };
  base?: Rect;
  gap?: { x: number; y: number };
  count?: 1 | 2 | 3 | 4;
  drawEmptyGuide?: boolean;
  backgroundColor?: string | null;
  format?: "png" | "jpeg";
  quality?: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 외부 도메인만 crossOrigin 시도 (동일출처 번들 자산이면 불필요)
    if (/^https?:\/\//.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Image load failed: ${src}`));
    img.src = src;
  });
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dest: Rect
) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const { w: dw, h: dh } = dest;
  const scale = Math.max(dw / sw, dh / sh);
  const rw = sw * scale;
  const rh = sh * scale;
  const dx = dest.x + (dw - rw) / 2;
  const dy = dest.y + (dh - rh) / 2;
  ctx.drawImage(img, dx, dy, rw, rh);
}

function resolveSlotSrc(
  slot: number | string | null | undefined,
  photos: string[]
): string | null {
  if (slot == null) return null;

  // 문자열이면 URL로 취급
  if (typeof slot === "string") return slot;

  // 숫자면 0/1-based 모두 시도
  const as1 = photos[slot - 1]; // 1-based
  if (as1) return as1;
  const as0 = photos[slot];     // 0-based
  if (as0) return as0;

  return null;
}

export async function composeQuadImage(
  params: {
    // 숫자(0/1-based) 또는 URL 문자열 모두 허용
    slots: (number | string | null)[];
    photos: string[];
    frameImg?: string; // 외부에서 직접 넘기도록 (선호)
  },
  options: ComposeOptions = {}
): Promise<Blob> {
  const {
    design = { w: 1000, h: 1500 },
    base = { x: 100, y: 250, w: 370, h: 555 },
    gap = { x: 60, y: 61 },
    count = 4,
    drawEmptyGuide = true,
    backgroundColor = "#ffffff",
    format = "png",
    quality = 0.92,
  } = options;

  const rects: Rect[] = [
    { ...base },
    { x: base.x + base.w + gap.x, y: base.y, w: base.w, h: base.h },
    { x: base.x, y: base.y + base.h + gap.y, w: base.w, h: base.h },
    { x: base.x + base.w + gap.x, y: base.y + base.h + gap.y, w: base.w, h: base.h },
  ].slice(0, count);

  const canvas = document.createElement("canvas");
  canvas.width = design.w;
  canvas.height = design.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CanvasRenderingContext2D not available");

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, design.w, design.h);
  } else {
    ctx.clearRect(0, 0, design.w, design.h);
  }

  // ▼ 사진 레이어
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    const src = resolveSlotSrc(params.slots[i], params.photos);

    console.debug("[compose] slot", i, "=>", params.slots[i], "->", src);

    if (src) {
      try {
        const img = await loadImage(src);
        drawImageCover(ctx, img, rect);
      } catch (e) {
        console.warn("slot image failed, draw guide:", e);
        if (drawEmptyGuide) {
          ctx.fillStyle = "rgba(0,0,0,0.08)";
          ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 2;
          ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
        }
      }
    } else if (drawEmptyGuide) {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
    }
  }

  // ▲ 프레임(오버레이)
  if (params.frameImg) {
    try {
      const frame = await loadImage(params.frameImg);
      ctx.drawImage(frame, 0, 0, design.w, design.h);
    } catch (e) {
      console.warn("frame load failed:", e);
    }
  }

  const type = format === "png" ? "image/png" : "image/jpeg";
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), type, format === "jpeg" ? quality : undefined)
  );
  return blob;
}

export async function saveComposedQuadAsFile(
  args: Parameters<typeof composeQuadImage>[0],
  options?: ComposeOptions & { filename?: string }
) {
  const filename = options?.filename ?? (options?.format === "jpeg" ? "photocard.jpg" : "photocard.png");
  const blob = await composeQuadImage(args, options);
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement("a");
  // a.href = url;
  // a.download = filename;
  // document.body.appendChild(a);
  // a.click();
  // a.remove();
  // URL.revokeObjectURL(url);

  const file = new File([blob], filename, {type:blob.type});
  const response = await uploadPhoto(file);

  return response;
}
