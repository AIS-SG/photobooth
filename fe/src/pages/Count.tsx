import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCountdown } from "../hooks/useCountdown";
import { CountdownOverlay } from "../components/CountdownOverlay";


export default function Count() {
    const navigate = useNavigate();
    const MIN = 1;
    const MAX = 8; // 최대 수량을 8로 설정

    const [quantity, setQuantity] = useState<number>(4);

    const handleDecrease = () => setQuantity((v) => Math.max(MIN, v - 1));
    const handleIncrease = () => setQuantity((v) => Math.min(MAX, v + 1));

    const handleBack = () => navigate(-1);

    const { sec } = useCountdown({
        seconds: 30,
        autostart: true,
        onExpire: () => navigate("/", { replace: true }),
    });

    return (
        <main className="relative w-screen h-screen bg-[#CFAB8D]">
            {/* 화면의 5%를 상하좌우 여백으로 두고 나머지(=90%)를 차지 */}
            <section className="absolute inset-[5%] rounded-2xl border border-neutral-200 shadow-sm bg-white flex flex-col">
            {/* 헤더 */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-neutral-100">
                <button
                onClick={handleBack}
                aria-label="이전 페이지로 돌아가기"
                className="text-neutral-400 hover:text-neutral-700 transition"
                >
                <span className="text-3xl leading-none">&larr;</span>
                </button>
                <h1 className="text-3xl font-semibold font-[Hi_Melody] text-neutral-900">수량 선택</h1>
                <div className="w-8" />
            </header>

            {/* 본문 */}
            <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8">
            {/* - 5 + */}
            <div className="flex items-center gap-12">
            <button
                type="button"
                onClick={handleDecrease}
                disabled={quantity <= MIN}
                aria-label="수량 감소"
                className="size-24 rounded-xl border border-neutral-300 bg-neutral-50
                        hover:bg-neutral-100 disabled:opacity-40 text-4xl font-[Hi_Melody] transition"
            >
                -
            </button>

            <div
                aria-live="polite"
                className="min-w-32 text-center text-8xl font-light font-[Hi_Melody] text-neutral-900 select-none"
            >
                {quantity}
            </div>

            <button
                type="button"
                onClick={handleIncrease}
                aria-label="수량 증가"
                className="size-24 rounded-xl border border-neutral-300 bg-neutral-50
                        hover:bg-neutral-100 disabled:opacity-40 text-4xl font-[Hi_Melody] transition"
            >
                +
            </button>
            </div>
            </div>

        {/* 하단 Next 버튼 */}
            <div className="flex justify-end px-8 py-6">
                <button
                type="button"
                onClick={() => navigate("/photostart")}
                className="px-12 h-18 rounded-xl border border-neutral-800 bg-[#cfab8d]
                            hover:brightness-95 active:scale-[0.98]
                            text-neutral-900 text-xl font-medium font-[Hi_Melody] transition"
                >
                Next
                </button>
            </div>
            <CountdownOverlay remainingSec={sec} totalSec={30} label="자동으로 처음 화면으로 돌아갑니다" />
            </section>
        </main>
    );

}
