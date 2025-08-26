import { useState } from "react";
import { useNavigate } from "react-router-dom";
import basic1 from "../img/basic-1.png";
import basic2 from "../img/basic-2.png";
import event1 from "../img/event-1.png";
import event2 from "../img/event-2.png";

export default function Frameselect() {
  const navigate = useNavigate();
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);

  const frameTypes = [
    { id: "basic", label: "기본", options: ["basic1", "basic2"] },
    { id: "event", label: "이벤트", options: ["event1", "event2"] },
  ];

  return (
    <div className="min-h-screen w-screen bg-[#CFAB8D] grid place-items-center">
      {/* 흰 캔버스 */}
      <section
        className="
          relative bg-white border-4 border-black rounded-2xl
          w-[min(90vw,1400px)] h-[min(90vh,900px)]
          p-[clamp(16px,2.5vw,32px)] flex flex-col overflow-hidden
        "
      >
        {/* 상단 */}
        <header className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            aria-label="이전 페이지로 돌아가기"
            className="text-neutral-400 hover:text-neutral-700 transition"
          >
            <span className="text-3xl leading-none">&larr;</span>
          </button>
          <h1 className='font-["Hi_Melody"] text-black leading-none text-[clamp(24px,3.2vw,40px)]'>
            프레임 선택
          </h1>
        </header>

        {/* 본문: 항상 2열 유지 (왼쪽 고정폭 + 오른쪽 가변폭) */}
        <main
          className="
            flex-1 min-h-0 mt-[clamp(12px,1.5vw,20px)]
            flex flex-row flex-nowrap
            gap-[clamp(20px,3.5vw,56px)]
          "
        >
          {/* ⬅️ 왼쪽: 프리뷰 (반응형 고정폭 + 왼쪽만 살짝 들여쓰기) */}
          <section className="flex-none w-[clamp(240px,30vw,520px)] pl-[clamp(8px,2vw,20px)]">
            {/* 2:3 비율 고정 박스 */}
            <div className="relative w-full aspect-[2/3] rounded-md border border-neutral-300 bg-[#d9d9d9] overflow-hidden">
              {/* 위/아래 6% 여백 인셋 */}
              <div className="absolute inset-x-0 top-[6%] bottom-[6%]">
                <img
                  src={selectedFrame ? {selectedFrame} : ""}
                  alt="프레임 미리보기"
                  className="block h-full w-full object-contain"
                  draggable={false}
                  // 이미지 없거나 깨질 때 레이아웃 유지
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
              </div>
            </div>
          </section>

          {/* ➡️ 오른쪽: 옵션 (오버플로 방지 + 내부 폭 제한) */}
          <aside className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="w-full max-w-[680px] mx-auto px-[clamp(8px,1.5vw,24px)] space-y-[clamp(16px,3vw,32px)]">
              {frameTypes.map((t) => (
                <div key={t.id} className="flex flex-col gap-[clamp(8px,1.5vw,16px)]">
                  <h2 className='font-["Hi_Melody"] text-[clamp(18px,2.5vw,28px)]'>
                    {t.label}
                  </h2>

                  <div className="flex gap-[clamp(12px,2vw,24px)]">
                    {t.options.map((opt) => {
                      const selected = selectedFrame === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedFrame(opt)}
                          aria-pressed={selected}
                          aria-label={`${t.label} ${opt}`}
                          className={[
                            "rounded-full border-4 transition-all size-[clamp(64px,8vw,120px)]",
                            selected
                              ? "bg-[#b9b9b9] border-blue-500 shadow-[0_0_0_6px_rgba(79,140,255,0.25)]"
                              : "bg-[#d9d9d9] border-transparent hover:bg-[#c9c9c9]",
                          ].join(" ")}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </main>

        {/* 하단 Next: 박스 안 오른쪽 아래 */}
        <footer className="mt-auto flex justify-end">
          <button
            onClick={() => selectedFrame && navigate("/Loading")}
            disabled={!selectedFrame}
            className='font-["Hi_Melody"] whitespace-nowrap
                       px-[clamp(16px,2.8vw,28px)]
                       h-[clamp(44px,6vh,56px)]
                       rounded-xl border border-black bg-[#cfab8d]
                       text-[clamp(18px,2.2vw,24px)] text-black
                       hover:brightness-95 disabled:opacity-50 transition'
          >
            Next
          </button>
        </footer>
      </section>
    </div>
  );
}
