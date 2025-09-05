import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import { CountdownOverlay } from "../components/CountdownOverlay";
import {getSelectedFrame, setSelectedFrame} from "../lib/selectFrame";
import basic1 from "../img/frame/basic-1.png";
import basic2 from "../img/frame/basic-2.png";
import basic3 from "../img/frame/basic-3.png";
import event1 from "../img/frame/event-1.png";
import event2 from "../img/frame/event-2.png";
import event3 from "../img/frame/event-3.png";
import pre_basic1 from "../img/preview_frame/basic-1.png";
import pre_basic2 from "../img/preview_frame/basic-2.png";
import pre_basic3 from "../img/preview_frame/basic-3.png";
import pre_event1 from "../img/preview_frame/event-1.png"
import pre_event2 from "../img/preview_frame/event-2.png";
import pre_event3 from "../img/preview_frame/event-3.png";


// 메인과 프리뷰 이미지를 함께 관리하는 객체
export const frames = [
  { id: "basic-1", main: basic1, preview: pre_basic1, label: "기본-1", type: "basic" },
  { id: "basic-2", main: basic2, preview:pre_basic2, label: "기본-2", type: "basic" },
  { id: "basic-3", main: basic3, preview:pre_basic3, label: "기본-3", type: "basic" },
  { id: "event-1", main: event1, preview: pre_event1, label: "이벤트-1", type: "event" },
  { id: "event-2", main: event2, preview: pre_event2, label: "이벤트-2", type: "event" },
  { id: "event-3", main: event3, preview: pre_event3, label: "이벤트-3", type: "event" },
];

export default function Frameselect() {
  const navigate = useNavigate();

  // 상태는 이미지 경로가 아닌 프레임의 고유 ID로 관리
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(getSelectedFrame());

  // 선택된 ID를 기반으로 해당 프레임 객체 찾기
  const selectedFrame = frames.find((f) => f.id === selectedFrameId);

  useEffect(() => {
    setSelectedFrame(selectedFrameId);
  }, [selectedFrameId]);

  const { sec } = useCountdown({
    seconds: 100,
    autostart: true,
    onExpire: () => {
      navigate("/Loading", { replace: true });
    },
  });

  // 프레임 타입을 묶어서 렌더링하기 위한 로직
  const groupedFrames = frames.reduce((acc, frame) => {
    (acc[frame.type] = acc[frame.type] || []).push(frame);
    return acc;
  }, {} as Record<string, typeof frames>);

  return (
    <div className="min-h-screen w-screen bg-[#CFAB8D] grid place-items-center">
      <section
        className="relative bg-white border-4 border-black rounded-2xl w-[min(90vw,1400px)] h-[min(90vh,900px)] p-[clamp(16px,2.5vw,32px)] flex flex-col"
      >
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

        <main className="flex-1 min-h-0 mt-[clamp(12px,1.5vw,20px)] grid grid-cols-2">
          {/* ⬅️ 왼쪽: 프리뷰 */}
          <section className="flex justify-center items-center">
            <div className="relative aspect-[2/3] w-[clamp(200px,25vw,380px)] rounded-md border border-neutral-300 bg-[#d9d9d9] overflow-hidden">
                <img
                  // 선택된 프레임의 main 이미지를 사용
                  src={selectedFrame?.main}
                  alt="프레임 미리보기"
                  className="block h-full w-full object-contain"
                  draggable={false}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
            </div>
          </section>

          {/* ➡️ 오른쪽: 옵션 */}
          <aside className="flex justify-center items-center">
            <div className="w-full max-w-[680px] px-[clamp(8px,1.5vw,24px)] space-y-[clamp(16px,3vw,32px)]">
              {Object.entries(groupedFrames).map(([type, options]) => (
                <div key={type} className="flex flex-col gap-[clamp(8px,1.5vw,16px)]">
                  <h2 className='font-["Hi_Melody"] text-[clamp(18px,2.5vw,28px)]'>
                    {type === "basic" ? "기본" : "이벤트"}
                  </h2>
                  <div className="flex gap-[clamp(12px,2vw,24px)]">
                    {options.map((opt) => {
                      const isSelected = selectedFrameId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedFrameId(opt.id)}
                          className={[
                            "rounded-full border-4 transition-all size-[clamp(64px,8vw,120px)]",
                            isSelected
                              ? "bg-[#b9b9b9] border-blue-500 shadow-[0_0_0_6px_rgba(79,140,255,0.25)]"
                              : "border-2 border-gray-300 hover:border-gray-400",
                          ].join(" ")}
                          // 버튼 배경은 main 이미지를 사용
                          style={{ backgroundImage: `url(${opt.preview})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </main>
        
        <footer className="mt-auto flex justify-end">
          <button
            onClick={() => selectedFrameId && navigate("/Loading")}
            disabled={!selectedFrameId}
            className='font-["Hi_Melody"] whitespace-nowrap px-[clamp(16px,2.8vw,28px)] h-[clamp(44px,6vh,56px)] rounded-xl border border-black bg-[#cfab8d] text-[clamp(18px,2.2vw,24px)] text-black hover:brightness-95 disabled:opacity-50 transition'
          >
            Next
          </button>
        </footer>
      </section>
      <CountdownOverlay remainingSec={sec} totalSec={10} label="자동으로 선택되고 넘어갑니다." />
    </div>
  );
}