import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import { CountdownOverlay } from "../components/CountdownOverlay";

export default function Photostart() {
  const navigate = useNavigate();
  const { sec } = useCountdown({
        seconds: 60,
        autostart: true,
        onExpire: () => navigate("/Phototime", { replace: true }),
    });

  return (
    <main className="w-screen h-screen bg-[#CFAB8D] flex flex-col">
      {/* 가운데: 제목/부제 */}
      <section className="flex-1 flex flex-col items-center justify-center gap-10 px-6 text-center">
        <h1 className="font-['Hi_Melody'] text-white leading-none
                       text-6xl md:text-8xl xl:text-[140px]">
          촬영 시작
        </h1>

        <p className="font-['Hi_Melody'] text-white
                     text-lg md:text-2xl">
          촬영이 시작됩니다. 준비해주시길 바랍니다.
        </p>

        <button
          type="button"
          onClick={() => navigate("/Phototime")}
          aria-label="촬영 시작하기"
          className="font-['Hi_Melody'] px-10 py-5 rounded-xl border border-black
                     bg-white text-black text-2xl md:text-4xl
                     hover:bg-neutral-50 active:scale-[0.98] transition"
        >
          START
        </button>
        <CountdownOverlay remainingSec={sec} totalSec={60} label="자동으로 촬영 화면으로 넘어갑니다." />
      </section>
    </main>
  );
}
