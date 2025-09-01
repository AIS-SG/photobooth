import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import { useCamera } from "../hooks/useCamera";
import { usePhotoStore } from "../stores/photoStore";

export default function Phototime() {
  const navigate = useNavigate();

  const totalPhotos = 8;
  const [currentPhoto, setCurrentPhoto] = useState(1);

  // 전역 스토어: 새 세션 느낌으로 초기화(원치 않으면 주석)
  const clearStore = usePhotoStore((s) => s.clear);

  // 현재 컷 ref (타이머 콜백에서 최신값 보장)
  const currentRef = useRef(currentPhoto);
  useEffect(() => {
    currentRef.current = currentPhoto;
  }, [currentPhoto]);

  // 카메라 훅
  const { videoRef, streamReady, errorMsg, startPreview, stopPreview, captureFrame } = useCamera();

  // ✅ 개발 모드 StrictMode에서 자동 시작/정지의 깜빡임 방지:
  //  - 자동 시작은 제거하고, 버튼 클릭으로만 시작.
  //  - 최종 언마운트에서만 stopPreview 실행.
  useEffect(() => {
    clearStore();
    return () => {
      // 최종 언마운트에서만 스트림 정리
      stopPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearStore]); // startPreview 호출 삭제

  // 카운트다운
  const { sec, start, reset, pause, resume } = useCountdown({
    seconds: 2,
    autostart: false,
    onExpire: async () => {
      try {
        // 현재 컷 캡쳐 → 전역 스토어에 자동 저장 (useCamera 기본 동작)
        const { filename } = await captureFrame({
          cutNumber: currentRef.current,
          outW: 1200, // 1200x1800(2:3)
        });
        console.log("저장된 파일명:", filename);
      } catch (e) {
        console.error("캡쳐 실패:", e);
      }

      // 다음 컷으로 진행 or 완료
      if (currentRef.current < totalPhotos) {
        setTimeout(() => {
          setCurrentPhoto((p) => p + 1);
          reset(2);
          start(2);
        }, 800); // 쉬는 텀
      } else {
        navigate("/Frameselect", { replace: true });
      }
    },
  });

  // 스트림 준비되면 타이머 시작 (한 번만)
  const countdownStartedRef = useRef(false);
  useEffect(() => {
    if (streamReady && !countdownStartedRef.current) {
      countdownStartedRef.current = true;
      reset(10);
      start(10);
    }
  }, [streamReady, start, reset]);

  // (선택) 탭/앱 비가시 상태이면 타이머 일시중지
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) pause();
      else resume();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pause, resume]);

  return (
    <div className="relative w-screen h-screen bg-[#CFAB8D]">
      <div className="absolute inset-0 grid grid-cols-[1fr_260px]">
        {/* 좌측: 카메라 프리뷰 (표시도 2:3, 좌우 크롭) */}
        <div className="relative">
          <div className="absolute inset-[48px] rounded-sm shadow-inner bg-black overflow-hidden">
            {/* 2:3 비율 프레임 래퍼 */}
            <div className="relative w-full h-full grid place-items-center">
              <div className="relative aspect-[4/3] mx-auto h-full max-h-full overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* 2:3 가이드 박스 */}
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

            {/* 오버레이: 사용자 제스처로 시작 (iOS/Safari 호환성↑, Strict flicker↓) */}
            {!streamReady && (
              <div className="absolute inset-0 grid place-items-center gap-3 bg-black/40 text-white">
                <div>{errorMsg ?? "카메라 대기중…"}</div>
                <button
                  onClick={async () => {
                    try {
                      await startPreview();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
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
