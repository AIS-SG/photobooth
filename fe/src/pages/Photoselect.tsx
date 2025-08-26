import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import { CountdownOverlay } from "../components/CountdownOverlay";


export default function Photoselect() {
  const { sec } = useCountdown({
        seconds: 10000,
        autostart: true,
        onExpire: () => navigate("/Qrcode", { replace: true }),
    });

  const navigate = useNavigate();
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const mainIds = [1,2,3,4,5,6,7,8];   // 좌측 4×2
  const sideIds = [9,10,11,12];        // 우측 2×2

  return (
    <div className="relative w-screen h-screen bg-[#CFAB8D]">
      {/* 흰색 인셋 박스 (상하좌우 5% 여백) */}
      <section className="absolute inset-[5%] bg-white rounded-2xl shadow-sm border border-neutral-200
                          flex flex-col p-8">
        {/* 상단 타이틀 */}
        <h1 className="text-[42px] leading-none font-['Hi_Melody'] text-black">
          사진 선택
        </h1>

        {/* 본문: 좌측(큰 그리드) + 우측(미니 그리드 패널) */}
        <div className="flex-1 mt-8 flex gap-12 min-h-0">
          {/* 좌측: 회색 프레임 안에 4×2 그리드 */}
          <div className="flex-[2] bg-[#e5e5e5] rounded-md p-6">
            <div className="grid grid-cols-4 grid-rows-2 gap-4 h-full">
              {mainIds.map(id => (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className={`w-full h-full bg-[#d9d9d9] border border-black
                              hover:bg-[#cfcfcf] transition-colors
                              ${selectedPhotos.has(id) ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-[#e5e5e5]" : ""}`}
                  aria-pressed={selectedPhotos.has(id)}
                  aria-label={`사진 ${id} ${selectedPhotos.has(id) ? "해제" : "선택"}`}
                />
              ))}
            </div>
          </div>

          {/* 우측: 미니 프리뷰 패널(연회색 박스 안에 2×2) */}
          <aside className="flex-[1] bg-[#e5e5e5] rounded-md p-6">
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
              {sideIds.map(id => (
                <img
                  key={id}
                  
                  className={`w-full h-full bg-[#d9d9d9] border border-black
                               transition-colors
                              ${selectedPhotos.has(id) ? "ring-4 ring-blue-500 ring-offset-2 ring-offset-[#e5e5e5]" : ""}`}
                  aria-pressed={selectedPhotos.has(id)}
                  aria-label={`사진 ${id} ${selectedPhotos.has(id) ? "해제" : "선택"}`}
                />
              ))}
            </div>
          </aside>
        </div>

        {/* 하단: Next (오른쪽 정렬) */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => selectedPhotos.size > 0 && navigate("/Qrcode")}
            disabled={selectedPhotos.size === 0}
            className="px-8 h-14 rounded-xl border border-black bg-[#cfab8d]
                       text-[32px] font-['Hi_Melody'] text-black
                       hover:brightness-95 disabled:opacity-50 transition"
            aria-label="다음 단계로 이동"
          >
            Next
          </button>
        </div>
        <CountdownOverlay remainingSec={sec} totalSec={120} label="자동으로 사진이 선택된 후, 인쇄됩니다." />
      </section>
    </div>
  );
}
