// src/pages/Phototime.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import { useCamera } from "../hooks/useCamera";

export default function Phototime() {
  const navigate = useNavigate();
  const totalPhotos = 8;
  const [currentPhoto, setCurrentPhoto] = useState(1);

  // 현재 컷 ref
  const currentRef = useRef(currentPhoto);
  useEffect(() => { currentRef.current = currentPhoto; }, [currentPhoto]);

  // 카메라
  const { videoRef, streamReady, errorMsg, startPreview, captureFrame } = useCamera();

  // 카운트다운: 카메라 준비 뒤 시작
  const { sec, start, reset } = useCountdown({
    seconds: 10,
    autostart: false,
    onExpire: async () => {
      // 1) 현재 컷 캡쳐 (저장도 2:3)
      try {
        const { filename } = await captureFrame(currentRef.current, 1200 /*출력 가로 해상도 예시*/);
        console.log("저장된 파일명:", filename);
      } catch (e) {
        console.error("캡쳐 실패:", e);
      }

      // 2) 다음 진행
      if (currentRef.current < totalPhotos) {
        setTimeout(() => {
          setCurrentPhoto((p) => p + 1);
          reset(10);
          start(10);
        }, 2000);
      } else {
        navigate("/Frameselect", { replace: true });
      }
    },
  });

  // 페이지 진입 시 1회 자동 시작 시도 (실패 시 버튼으로 수동 시작)
  useEffect(() => { void startPreview(); }, []);

  // 카메라 준비되면 타이머 시작 (중복 방지)
  const countdownStartedRef = useRef(false);
  useEffect(() => {
    if (streamReady && !countdownStartedRef.current) {
      countdownStartedRef.current = true;
      reset(10);
      start(10);
    }
  }, [streamReady, start, reset]);

  return (
    <div className="relative w-screen h-screen bg-[#CFAB8D]">
      <div className="absolute inset-0 grid grid-cols-[1fr_260px]">
        {/* 좌측: 카메라 프리뷰 (표시도 2:3, 좌우 크롭) */}
        <div className="relative">
          <div className="absolute inset-[48px] rounded-sm shadow-inner bg-black overflow-hidden">
            {/* 2:3 비율 프레임 래퍼 */}
            <div className="relative w-full h-full grid place-items-center">
              <div className="relative aspect-[4/3] mx-auto h-full max-h-full  overflow-hidden bg-black ">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  // object-cover로 세로를 채우면서 좌우가 잘리도록
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div
          className="
            pointer-events-none
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            aspect-[2/3] h-full w-auto
            rounded-lg
            border-4 border-white/80
            shadow-[0_0_0_2px_rgba(0,0,0,0.6)_inset]
          "
        />
              </div>
            </div>

            {!streamReady && (
              <div className="absolute inset-0 grid place-items-center gap-3 bg-black/40 text-white">
                <div>{errorMsg ?? "카메라 대기중…"}</div>
                <button
                  onClick={startPreview}
                  className="px-5 py-2 rounded-md bg-white/90 text-black font-medium"
                >
                  카메라 시작
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 우측: 진행 정보 */}
        <aside className="relative flex flex-col items-center pt-20 pr-10">
          <div className="text-white text-[96px] leading-none font-['Hi_Melody']">
            {currentPhoto} / {totalPhotos}
          </div>
          <div className="mt-12 text-white text-[96px] leading-none font-['Hi_Melody']">
            {sec}초
          </div>
        </aside>
      </div>
    </div>
  );
}
