// ResponsivePhotoQuad.tsx
import React, { useMemo } from "react";
import { getSelectedFrame } from "../lib/selectFrame";
import {frames} from "../pages/Frameselect"

type Rect = { x: number; y: number; w: number; h: number };

type Props = {
  design?: { w: number; h: number };
  base?: Rect;
  gap?: { x: number; y: number };
  /** 슬롯 개수 (최대 4) */
  count?: 1 | 2 | 3 | 4;

  /** 사진 인덱스 배열: 각 슬롯에 들어간 사진 id (없으면 null) */
  slots: (number | null)[];
  /** 사진 경로 배열: sortedPhotos (id는 1부터 시작한다고 가정) */
  photos: string[];

  /** 뷰포트/컨테이너 맞춤 */
  fit?: "viewport" | "container";
  headerOffsetPx?: number;
  maxWidthPx?: number;
  className?: string;

  /** 빈 슬롯 플레이스홀더 보이기 (기본 true) */
  showEmptyGuide?: boolean;
  /** 슬롯 번호 라벨 보이기 (기본 true) */
  showSlotLabel?: boolean;
  /** 채워진 슬롯에서 제거 버튼 보이기 (기본 true) */
  showRemoveButton?: boolean;
  /** 제거 버튼 핸들러: (slotIdx, photoId) */
  onRemove?: (slotIndex: number, photoId: number) => void;
};

export function ResponsivePhotoQuad({
  design = { w: 1000, h: 1500 },
  base = { x: 100, y: 240, w: 370, h: 555 },
  gap = { x: 60, y: 61 },
  count = 4,

  slots,
  photos,

  fit = "container",
  headerOffsetPx = 0,
  maxWidthPx = 720,
  className = "",

  showEmptyGuide = true,
  showSlotLabel = true,
  showRemoveButton = true,
  onRemove,
}: Props) {
  const FRAME_W = design.w;
  const FRAME_H = design.h;
  
  const selectedFrameId = getSelectedFrame();
  const selectedFrame = frames.find(f=>f.id === selectedFrameId);
  const frameImg = selectedFrame?.main?? "";

  // 슬롯 배치 (2x2)
  const rects: Rect[] = useMemo(() => {
    const r1 = { ...base };
    const r2 = { x: base.x + base.w + gap.x, y: base.y, w: base.w, h: base.h };
    const r3 = { x: base.x, y: base.y + base.h + gap.y, w: base.w, h: base.h };
    const r4 = { x: r2.x, y: r2.y + r2.h + gap.y, w: base.w, h: base.h };
    return [r1, r2, r3, r4].slice(0, count);
  }, [base, gap, count]);

  // px → %
  const toPct = {
    x: (px: number) => (px / FRAME_W) * 100,
    y: (px: number) => (px / FRAME_H) * 100,
    w: (px: number) => (px / FRAME_W) * 100,
    h: (px: number) => (px / FRAME_H) * 100,
  };

  // 프레임 배경
  const frameBg: React.CSSProperties = {
    backgroundImage: `url(${frameImg})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "100% 100%",
  };

  // 컨테이너 스타일
  const containerStyle: React.CSSProperties =
    fit === "viewport"
      ? { width: `min(100vw, calc((2 / 3) * (100dvh - ${headerOffsetPx}px)))` }
      : { maxWidth: maxWidthPx, width: "100%" };

  const containerClass = `relative aspect-[2/3] overflow-hidden  border border-neutral-300 ${className}`;

  return (
    <div className={fit === "viewport" ? "w-screen h-screen overflow-hidden grid place-items-center" : ""}>
      <div className={containerClass} style={{ ...containerStyle, ...frameBg }}>
        {rects.map((r, slotIdx) => {
          const maybeId = slots[slotIdx];
          const src = typeof maybeId === "number" ? photos[maybeId - 1] : null;

          const slotStyle: React.CSSProperties = {
            position: "absolute",
            left: `${toPct.x(r.x)}%`,
            top: `${toPct.y(r.y)}%`,
            width: `${toPct.w(r.w)}%`,
            height: `${toPct.h(r.h)}%`,
            overflow: "hidden",
          };

          return (
            <div
              key={slotIdx}
              style={slotStyle}
              className={`relative ${src ? "" : "bg-[#d9d9d9]/80 border border-black/30"} `}
            >
              {/* 슬롯 라벨 */}
              {showSlotLabel && (
                <span className="absolute top-2 left-2 text-xs font-bold bg-black/70 text-white  px-1.5 py-0.5">
                  {slotIdx + 1}
                </span>
              )}

              {src ? (
                <>
                  <img src={src} className="w-full h-full object-cover select-none" alt={`slot-${slotIdx + 1}`} />
                  {showRemoveButton && typeof maybeId === "number" && (
                    <button
                      onClick={() => onRemove?.(slotIdx, maybeId)}
                      className="absolute top-2 right-2 w-6 h-6 grid place-items-center  border border-white/70 bg-black/70 text-white text-xs hover:bg-black"
                      aria-label={`${slotIdx + 1}번 슬롯에서 사진 제거`}
                      title="제거"
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </>
              ) : (
                showEmptyGuide && (
                  <div className="w-full h-full grid place-items-center text-neutral-600 text-sm select-none">
                    빈 슬롯
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
