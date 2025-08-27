import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import { CountdownOverlay } from "../components/CountdownOverlay";
import { getSelectedFrame } from "../lib/selectFrame";

export default function Photoselect() {
  const { sec } = useCountdown({
        seconds: 10000,
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
      <section className="absolute inset-[5%] bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col p-8 overflow-auto md:overflow-visible">

        {/* 상단 타이틀 + 카운터 */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[35px] leading-none font-['Hi_Melody'] text-black">사진을 선택해주세요.</p>
            <p className="text-[20px] leading-none font-['Hi_Melody'] text-black">( Please select a photo. )</p>
          </div>
          <p className="text-xl font-semibold">{slots.filter(Boolean).length}/{MAX} 선택</p>
        </div>

        {/* 본문: 좌측 그리드 + 우측 선택결과 패널 */}
        <div className="flex-1 mt-8 flex gap-12 min-h-0 min-w-0 items-start overflow-auto">
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
                    className="relative w-full h-full rounded overflow-hidden group"
                    aria-pressed={selectedIndex !== -1}
                    aria-label={`사진 ${id} ${selectedIndex !== -1 ? "해제" : "선택"}`}
                  >
                    {/* 2:3 고정 박스 — 여기의 실제 너비를 측정 */}
                    <div
                      ref={idx === 0 ? firstTileRef : undefined}
                      className="relative w-full aspect-[2/3] rounded border border-black bg-[#d9d9d9] overflow-hidden"
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
          
<aside className="flex-[1] min-w-0">
  {/* ✅ 2:3 비율 고정 박스 */}
  <div
    className="relative aspect-[2/3] shrink-0 overflow-hidden rounded-xl mx-auto"
    style={{ width: frameW || 340, height: frameH || Math.round((340) * 1.5) }}
  >

    {/* ✅ 프레임 이미지 */}<div
      className="absolute inset-0 bg-center bg-no-repeat bg-contain z-0"
      style={{ backgroundImage: `url(${frameImg})` }}
      aria-hidden
    />
    {/* ✅ 프레임 위에 2×2 슬롯 격자 오버레이 */}
    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-4 p-6">
      {slots.map((maybeId, slotIdx) => {
        const src = typeof maybeId === "number" ? sortedPhotos[maybeId - 1] : null;
        return (
          <div key={slotIdx} className="relative w-full h-full bg-[#d9d9d9]/80 border border-black/30 rounded overflow-hidden">
            {/* 슬롯 라벨 */}
            <span className="absolute top-2 left-2 text-xs font-bold bg-black/70 text-white rounded px-1.5 py-0.5">
              {slotIdx + 1}
            </span>

            {src ? (
              < >
                <img src={src} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeId(maybeId!)}
                  className="absolute top-2 right-2 w-6 h-6 grid place-items-center rounded-full border border-white/70 bg-black/70 text-white text-xs hover:bg-black"
                  aria-label={`${slotIdx + 1}번 슬롯에서 사진 제거`}
                  title="제거"
                >
                  ×
                </button>
              </>
            ) : (
              <div className="w-full h-full grid place-items-center text-neutral-600 text-sm">
                빈 슬롯
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
</aside>

        </div>

        {/* 하단: Next (정확히 4장일 때만 활성화) */}
        <div className="mt-8 flex justify-end  relative z-10">
          <button
            onClick={() => isExactFour && navigate("/Qrcode", { state: { selectedOrder: slots }, replace: true })}
            disabled={!isExactFour}
            className="px-8 h-14 rounded-xl border border-black bg-[#cfab8d]
                       text-[32px] font-['Hi_Melody'] text-black
                       hover:brightness-95 disabled:opacity-50 transition"
            aria-label="다음 단계로 이동"
          >
            Next
          </button>
        </div>
        <CountdownOverlay remainSec={sec} totalSec={10} label="자동으로 선택되고 넘어갑니다."/>
      </section>
    </div>
  );
}
