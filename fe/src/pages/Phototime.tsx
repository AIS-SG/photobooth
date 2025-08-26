import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";

export default function Phototime() {
    const navigate = useNavigate();
    const currentPhoto = 1; // 현재 촬영한 사진 번호
    const totalPhotos = 8;  // 총 촬영할 사진 수
    const { sec } = useCountdown({
            seconds: 10,
            autostart: true,
            onExpire: () => navigate("/Phototime", { replace: true }),
        });
    
    return (
        <div className="relative w-screen h-screen bg-[#CFAB8D]">
            {/* 전체를 좌측 큰 영역 / 우측 표시 영역으로 나눈다 */}
            <div className="absolute inset-0 grid grid-cols-[1fr_260px]" onClick={() => navigate("/Frameselect")} >
                {/* 좌측: 카메라(지금은 흰 박스) */}
                <div className="relative">
                {/* 상하좌우 여백을 같은 값으로 주고 박스를 채운다 */}
                <div className="absolute inset-[48px] bg-white rounded-sm shadow-inner" />
                {/* 나중에 카메라 붙일 때는 위 div 대신 아래 코드를 사용:
                    <video ref={videoRef} autoPlay muted playsInline className="absolute inset-[48px] w-[calc(100%-96px)] h-[calc(100%-96px)] object-cover rounded-sm" />
                */}
                </div>

                {/* 우측: 진행 정보 */}
                <aside className="relative flex flex-col items-center pt-20 pr-10">
                <div className="text-white text-[96px] leading-none font-['Hi_Melody']">
                    {currentPhoto} / {totalPhotos}
                </div>
                <div className="mt-12 text-white text-[96px] leading-none font-['Hi_Melody']">
                    {sec}초
                </div>
                {/*<div className="mt-12 text-white text-[96px] leading-none font-['Hi_Melody']">
                    {time}초
                </div>*/}

                {/* (선택) 뒤로가기/다음 같은 컨트롤이 필요하면 아래에 배치 */}
                {/* <button onClick={()=>navigate(-1)} className="mt-auto mb-10 self-end rounded-md bg-white/20 text-white px-4 py-2">Back</button> */}
                </aside>
            </div>
        </div>
    );
}
