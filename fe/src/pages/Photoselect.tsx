import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import { CountdownOverlay } from "../components/CountdownOverlay";
import { getSelectedFrame } from "../lib/selectFrame";
import { ResponsivePhotoQuad} from "../components/ResponsivePhotoQuad";
import { saveComposedQuadAsFile } from "../lib/composePhotoQuad";

export default function Photoselect() {
  const { sec } = useCountdown({
        seconds: 100,
        autostart: true,
        onExpire: () => navigate("/Qrcode", { replace: true }),
    });

  const photos = import.meta.glob("../img/photos/*.{png,jpg,jpeg}", { eager: true });
  const sortedPhotos = useMemo(
    () =>
      Object.entries(photos)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([_, mod]) => (mod as any).default as string),
    []
  );
  const MAX = 4;
  const mainIds = [1,2,3,4,5,6,7,8];   // 좌측 4×2
  const sideIds = [9,10,11,12];        // 우측 2×2
  
  const navigate = useNavigate();
  const [slots, setSlots] = useState<(number | null)[]>(Array(MAX).fill(null));

  const selectedSet = useMemo(() => new Set(slots.filter((v): v is number => v !== null)), [slots]);
  const isExactFour = slots.every((v) => v !== null);

  const insertId = (id: number) => {
    setSlots((prev) => {
      if (prev.includes(id)) return prev; // 이미 선택되어 있으면 무시
      const i = prev.indexOf(null);
      if (i === -1) return prev; // 빈 슬롯 없음
      const next = [...prev];
      next[i] = id;
      return next;
    });
  };

  const removeId = (id: number) => {
    setSlots((prev) => {
      const i = prev.indexOf(id);
      if (i === -1) return prev;
      const next = [...prev];
      next[i] = null; // 빈 칸 유지 (뒤에 있는 항목들을 당기지 않음)
      return next;
    });
  };

  const toggleFromLeftGrid = (id: number) => {
    if (selectedSet.has(id)) removeId(id);
    else insertId(id);
  };

  const selectFrame = getSelectedFrame();
  const frameImg = selectFrame ? selectFrame : "";

  const firstTileRef = useRef<HTMLDivElement | null>(null);
  const [tileW, setTileW] = useState(0); // 왼쪽 한 칸의 실제 너비(px)

  useLayoutEffect(() => {
    if (!firstTileRef.current) return;
    const el = firstTileRef.current;
    const ro = new ResizeObserver(() => {
      const w = Math.round(el.getBoundingClientRect().width);
      setTileW(w);
    });
    ro.observe(el);
    // 초기값
    setTileW(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  // 오른쪽 격자 gap/padding(왼쪽과 시각적으로 맞추기 위해 고정 값 사용)
  const GAP = 16;  // gap-4
  const PAD = 24;  // p-6
  // 프레임(2:3) 컨테이너의 실제 너비/높이
  const frameW = tileW > 0 ? tileW * 2 + GAP + PAD * 2 : 0;
  const frameH = frameW > 0 ? Math.round(frameW * 1.5) : 0;
  return (
    <div className="relative w-screen h-screen bg-[#CFAB8D]">
      {/* 흰색 인셋 박스 */}
      <section className="absolute inset-[5%] bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col p-6 ">

        {/* 상단 타이틀 + 카운터 */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[35px] leading-none font-['Hi_Melody'] text-black">사진을 선택해주세요.</p>
            <p className="text-[20px] leading-none font-['Hi_Melody'] text-black">( Please select a photo. )</p>
          </div>
          <p className="text-xl font-semibold">{slots.filter(Boolean).length}/{MAX} 선택</p>
        </div>

        {/* 본문: 좌측 그리드 + 우측 선택결과 패널 */}
        <div className="shrink-container flex gap-12">
          {/* 좌측: 4×2 - 전체 후보 목록 */}
          <div className="flex-[2] min-w-0">
            <div className="grid grid-cols-4 gap-4">
              {mainIds.map((id, idx) => {
                const src = sortedPhotos[id - 1];
                const selectedIndex = slots.indexOf(id);
                return src ? (
                  <button
                    key={id}
                    onClick={() => toggleFromLeftGrid(id)}
                    className="relative w-full h-full  overflow-hidden group"
                    aria-pressed={selectedIndex !== -1}
                    aria-label={`사진 ${id} ${selectedIndex !== -1 ? "해제" : "선택"}`}
                  >
                    {/* 2:3 고정 박스 — 여기의 실제 너비를 측정 */}
                    <div
                      ref={idx === 0 ? firstTileRef : undefined}
                      className="relative w-full aspect-[2/3] border border-black bg-[#d9d9d9] overflow-hidden"
                    >
                      <img src={src} className="absolute inset-0 w-full h-full object-cover" />
                      {selectedIndex !== -1 && (
                        <>
                          <span className="absolute top-2 left-2 text-sm font-bold bg-black/70 text-white rounded px-2 py-0.5">
                            {selectedIndex + 1}
                          </span>
                          <span className="pointer-events-none absolute inset-0 ring-4 ring-blue-500 ring-offset-2 ring-offset-[#e5e5e5] rounded" />
                        </>
                      )}
                    </div>
                  </button>
                ) : (
                  <div key={id} className="w-full h-full bg-[#d9d9d9] border border-black rounded" />
                );
              })}
            </div>
          </div>

          {/* 우측: ✅ 선택 결과 (슬롯 1~4를 순서대로 표시, 중간 삭제 시 빈 칸 유지) */}
          
        <aside className="flex-[1] min-w-0 flex justify-center items-start">
          {/* ✅ 2:3 비율 고정 박스 */}
          {(() => {
            const previewW = Math.min(frameW || 340, 420); // ← 최대 폭 캡(원하는 값으로 조정)
            return (
              <div
                className="relative aspect-[2/3] overflow-hidden  mx-auto max-w-full"
                style={{ width: previewW }}   
              >
                <ResponsivePhotoQuad
                  count={4}
                  slots={slots}
                  photos={sortedPhotos}
                  fit="container"
                  maxWidthPx={previewW}        
                  showEmptyGuide
                  showSlotLabel
                  showRemoveButton
                  onRemove={(_slotIdx, photoId) => removeId(photoId)}
                />
              </div>
            );
          })()}
        </aside>

      </div>

        {/* 하단: Next (정확히 4장일 때만 활성화) */}
        {isExactFour && (
          <div className="absolute right-8 bottom-8 z-20">
            <button
              type="button"
              onClick={async () => {
                try {
                  const frameImg = getSelectedFrame() ?? "";
                  await saveComposedQuadAsFile(
                    { slots, photos: sortedPhotos, frameImg },              
                    { format: "png", filename: "photocard.png" } 
                  );
                  navigate("/Qrcode", { state: { selectedOrder: slots }, replace: true });
                } catch (e) {
                  console.error(e);
                  // 필요하면 토스트 등으로 오류 표시
                }
              }}
              className="px-8 h-14 rounded-xl border border-black bg-[#cfab8d]
                        text-[32px] font-['Hi_Melody'] text-black
                        hover:brightness-95 transition"
              aria-label="다음 단계로 이동">
                Next</button>
          </div>
        )}
        <CountdownOverlay remainingSec={sec} totalSec={10} label="자동으로 선택되고 넘어갑니다." opacity={0.5}/>
      </section>
    </div>
  );
}
