import { useNavigate } from "react-router-dom";

export default function Finish(){
    const navigate = useNavigate();

    return (
        <main className="w-screen min-h-screen bg-[#cfab8d] grid place-items-center" onClick={() => navigate("/")}>
            {/* 프레임 */}
            <div className="w-full max-w-[1440px] min-h-[720px] bg-[#cfab8d] flex flex-col items-center justify-center px-6 py-10">
                {/* 타이틀 */}
                <h1 className="font-['Hi_Melody'] text-white font-normal text-center leading-tight
                            text-[clamp(5rem,12vw,12rem)]">See you next time
                </h1>
            </div>
        </main>
    );
}