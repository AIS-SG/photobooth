// ResponsivePhotoQuad.tsx
import React, { useMemo } from "react";
import { getSelectedFrame } from "../lib/selectFrame";

type Rect = { x: number; y: number; w: number; h: number };

type Props = {
  /** 프레임 설계 폭/높이(좌표계). 기본: 1000×1500 */
  design?: { w: number; h: number };
  /** 기준 슬롯(1번 이미지). 기본: { x:50, y:220, w:410, h:600 } */
  base?: Rect;
  /** 가터 간격. 기본: gapX=70, gapY=45 */
  gap?: { x: number; y: number };
  /** 렌더할 이미지들 (최대 4장). 미지정 시 ../img/photos 에서 자동 로드 */
  images?: string[];
  /** 1~4장까지 사용. 기본 4 */
  count?: 1 | 2 | 3 | 4;
  /**
   * 크기 맞춤 모드
   * - "viewport": 화면 안에 스크롤 없이 꽉 맞게(가로 = min(100vw, (2/3)*(100dvh-offset)))
   * - "container": 부모 width에 맞춰 비율 유지
   */
  fit?: "viewport" | "container";
  /** fit="viewport"일 때 상단 헤더 등 높이 보정(px). 기본 0 */
  headerOffsetPx?: number;
  /** container 모드에서 최대 폭 제한(px). 기본 720 */
  maxWidthPx?: number;
  /** 추가 className */
  className?: string;
};

export default function ResponsivePhotoQuad({
  design = { w: 1000, h: 1500 },
  base = { x: 50, y: 220, w: 410, h: 600 },
  gap = { x: 70, y: 45 },
  images,
  count = 4,
  fit = "container",
  headerOffsetPx = 0,
  maxWidthPx = 720,
  className,
}: Props) {
  const FRAME_W = design.w;
  const FRAME_H = design.h;
  const frameImg = getSelectedFrame() ?? "";

  // 이미지 로딩 (미지정 시 자동)
  const autoImgs = useMemo(() => {
    if (images && images.length) return images;
    const photos = import.meta.glob("../img/photos/*.{png,jpg,jpeg}", { eager: true });
    const sorted = Object.entries(photos)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, mod]) => (mod as { default: string }).default);
    return sorted;
  }, [images]);

  const imgs = autoImgs.slice(0, count);

  // 배치 규칙 (2번은 1번 오른쪽+gapX, 3번은 1번 아래+gapY, 4번은 2번 아래+gapY)
  const rects: Rect[] = useMemo(() => {
    const r1 = { ...base };
    const r2 = { x: base.x + base.w + gap.x, y: base.y, w: base.w, h: base.h };
    const r3 = { x: base.x, y: base.y + base.h + gap.y, w: base.w, h: base.h };
    const r4 = { x: r2.x, y: r2.y + r2.h + gap.y, w: base.w, h: base.h };
    return [r1, r2, r3, r4].slice(0, count);
  }, [base, gap, count]);

  // px → % 변환
  const toPct = {
    x: (px: number) => (px / FRAME_W) * 100,
    y: (px: number) => (px / FRAME_H) * 100,
    w: (px: number) => (px / FRAME_W) * 100,
    h: (px: number) => (px / FRAME_H) * 100,
  };

  // 공통 프레임 배경 스타일
  const frameBg: React.CSSProperties = {
    backgroundImage: `url(${frameImg})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "100% 100%",
  };

  // 컨테이너(모드별) 스타일
  const containerStyle: React.CSSProperties =
    fit === "viewport"
      ? {
          // 세로 스크롤 없이 뷰포트에 맞추기
          width: `min(100vw, calc((2 / 3) * (100dvh - ${headerOffsetPx}px)))`,
        }
      : {
          // 부모 폭 기준, 최대 폭 제한
          maxWidth: maxWidthPx,
          width: "100%",
        };

  // 컨테이너 공통 클래스
  const containerClass =
    fit === "viewport"
      ? `relative aspect-[2/3] overflow-hidden rounded border border-neutral-300 ${className ?? ""}`
      : `relative aspect-[2/3] overflow-hidden rounded border border-neutral-300 ${className ?? ""}`;

  return (
    // fit="viewport"일 때 가운데 정렬해서 보여주기 좋도록 래퍼 제공
    <div
      className={fit === "viewport" ? "w-screen h-screen overflow-hidden grid place-items-center" : ""}
    >
      <div className={containerClass} style={{ ...containerStyle, ...frameBg }}>
        {imgs.map((src, i) => {
          const r = rects[i];
          return (
            <img
              key={i}
              src={src}
              alt={`사진 ${i + 1}`}
              className="absolute object-cover"
              style={{
                left: `${toPct.x(r.x)}%`,
                top: `${toPct.y(r.y)}%`,
                width: `${toPct.w(r.w)}%`,
                height: `${toPct.h(r.h)}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
