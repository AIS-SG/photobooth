import { useNavigate } from "react-router-dom";

export default function Loading() {
    const navigate = useNavigate();
    return (
        <main className="min-h-screen w-screen bg-[#cfab8d] flex flex-col items-center justify-center"
            onClick={() => {navigate("/Photoselect")} }>
            <h1 className="text-white text-[clamp(7rem,14vw,10rem)] font-normal font-['Hi_Melody']"
                aria-label="로딩중" >
                로딩중
            </h1>
            <p className="mt-6 text-white text-[clamp(1rem,3vw,2rem)] font-['Hi_Melody']"
                role="status"
                aria-live="polite" >
                잠시만 기다려주시길 바랍니다.
            </p>
            
        </main>
    );
}