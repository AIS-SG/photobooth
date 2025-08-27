import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import { CountdownOverlay } from "../components/CountdownOverlay";

export default function Finish() {
  const navigate = useNavigate();
  const { sec } = useCountdown({
    seconds: 30,
    autostart: true,
    onExpire: () => navigate("/", { replace: true }),
  });

  return (
    <main
      className="w-screen h-screen bg-[#cfab8d] grid place-items-center"
      onClick={() => navigate("/")}
    >
      <h1
        className="font-['Hi_Melody'] text-white font-normal text-center
                   m-0 leading-none [text-wrap:balance]
                   text-[clamp(5rem,12vw,12rem)]"
      >
        See you next time
      </h1>

      <CountdownOverlay
        remainingSec={sec}
        totalSec={30}
        label="자동으로 처음 화면으로 돌아갑니다"
      />
    </main>
  );
}
