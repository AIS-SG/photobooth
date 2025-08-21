import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Frameselect() {
  const navigate = useNavigate();
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);

  const frameTypes = [
    { id: "basic", label: "기본", options: ["basic-1", "basic-2"] },
    { id: "event", label: "이벤트", options: ["event-1", "event-2"] },
  ];

  return (
    <div className="min-h-screen w-screen bg-[#CFAB8D] grid place-items-center">
      {/* 흰 캔버스 */}
      <section
        className="
          relative bg-white border-4 border-black rounded-2xl
          w-[min(90vw,1400px)] h-[min(90vh,900px)]
          p-[clamp(16px,2.5vw,32px)] flex flex-col
          overflow-hidden 
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
          <h1 className='font-["Hi_Melody"] text-black leading-none
                         text-[clamp(24px,3.2vw,40px)]'>
            프레임 선택
          </h1>
        </header>

        {/* 본문 */}
        <main
          className="
            flex-1 grid gap-[clamp(16px,2vw,32px)] mt-[clamp(12px,1.5vw,20px)]
            grid-cols-1 lg:grid-cols-[2fr_1fr]
            min-h-0   
          "
        >
          {/* ⬅️ 왼쪽: 프리뷰 */}
          <div className="min-h-0 flex items-center justify-center">
            <div
              className="
                relative w-full max-w-[500px]   /* 가로는 부모 안에서만 */
                /* 세로 비율은 상황에 맞게 골라주세요: 세로형이면 9/16, 가로형이면 4/3 */
              "
            >
              <div
                className="
                  bg-[#d9d9d9] rounded-md border border-neutral-300
                  w-full max-h-[calc(100vh)]  /* 화면 높이 넘지 않게 안전장치 */
                  aspect-[4/3]                /* ✅ 가로형 예시 (원하면 9/16로 변경) */
                "
                role="img"
                aria-label="프레임 미리보기"
              />
            </div>
          </div>

          {/* ➡️ 오른쪽: 옵션 */}
          <aside className="min-h-0 flex flex-col justify-center gap-[clamp(16px,3vw,32px)]">
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
                        onClick={() => setSelectedFrame(opt)}
                        aria-pressed={selected}
                        aria-label={`${t.label} ${opt}`}
                        className={`
                          rounded-full border-4 transition-all
                          size-[clamp(64px,8vw,120px)]
                          ${selected
                            ? "bg-[#b9b9b9] border-blue-500 shadow-[0_0_0_6px_rgba(79,140,255,0.25)]"
                            : "bg-[#d9d9d9] border-transparent hover:bg-[#c9c9c9]"}
                        `}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
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
