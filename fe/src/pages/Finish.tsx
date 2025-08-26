import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import { CountdownOverlay } from "../components/CountdownOverlay";

export default function Finish(){
    const navigate = useNavigate();
    const { sec } = useCountdown({
        seconds: 10,
        autostart: true,
        onExpire: () => navigate("/", { replace: true }),
    });
    return (
        <main className="w-screen min-h-screen bg-[#cfab8d] grid place-items-center" onClick={() => navigate("/")}>
            {/* 프레임 */}
            <div className="w-full max-w-[1440px] min-h-[720px] bg-[#cfab8d] flex flex-col items-center justify-center px-6 py-10">
                {/* 타이틀 */}
                <h1 className="font-['Hi_Melody'] text-white font-normal text-center leading-tight
                            text-[clamp(5rem,12vw,12rem)]">See you next time
                </h1>
            </div>
            <CountdownOverlay remainingSec={sec} totalSec={10} label="자동으로 처음 화면으로 돌아갑니다" />
        </main>
    );
}