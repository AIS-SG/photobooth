import { useMemo } from "react";
import { getSelectedFrame } from "../lib/selectFrame";

const FRAME_W = 1000;
const FRAME_H = 1500;

const SLOT = { x: 50, y: 220, w: 410, h: 600 };
const GAP_X = 70;
const GAP_Y = 45;

const toPct = {
  x: (px: number) => (px / FRAME_W) * 100,
  y: (px: number) => (px / FRAME_H) * 100,
  w: (px: number) => (px / FRAME_W) * 100,
  h: (px: number) => (px / FRAME_H) * 100,
};

export default function PhotoQuad() {
  const frameImg = getSelectedFrame() ?? "";

  const photos = import.meta.glob("../img/photos/*.{png,jpg,jpeg}", { eager: true });
  const sortedPhotos = useMemo(
    () =>
      Object.entries(photos)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([_, mod]) => (mod as { default: string }).default),
    []
  );
  const imgs = [sortedPhotos[0], sortedPhotos[1], sortedPhotos[2], sortedPhotos[3]].filter(
    Boolean
  ) as string[];

  // 픽셀 좌표 (설계값)
  const r1 = { x: SLOT.x, y: SLOT.y, w: SLOT.w, h: SLOT.h };
  const r2 = { x: SLOT.x + SLOT.w + GAP_X, y: SLOT.y, w: SLOT.w, h: SLOT.h };
  const r3 = { x: SLOT.x, y: SLOT.y + SLOT.h + GAP_Y, w: SLOT.w, h: SLOT.h };
  const r4 = { x: r2.x, y: r2.y + r2.h + GAP_Y, w: SLOT.w, h: SLOT.h };
  const rects = [r1, r2, r3, r4];

  return (
    // 전체 화면에 중앙 정렬 + 스크롤 방지
    <main className="w-screen h-screen overflow-hidden grid place-items-center bg-[#f7f7f7]">
      {/* 가로폭을 뷰포트에 맞춰 동적으로: min(100vw, (2/3)*100dvh) */}
      <div
        className="relative aspect-[2/3] border border-neutral-300 overflow-hidden rounded"
        style={{
          width: "min(100vw, calc((2/3) * 100dvh))", // 세로 기준으로도 축소되어 스크롤 없음
          backgroundImage: `url(${frameImg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "100% 100%",
        }}
      >
        {imgs.slice(0, 4).map((src, i) => {
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
    </main>
  );
}





// {selectedSet}:{selectedSet: any}