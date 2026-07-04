// src/pages/Phototime.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import { useCamera } from "../hooks/useCamera";
import { usePhotoStore } from "../stores/photoStore";

export default function Phototime() {
  const navigate = useNavigate();

  const totalPhotos = 8;
  const [currentPhoto, setCurrentPhoto] = useState(1);

  // 전역 스토어
  const clearStore = usePhotoStore((s) => s.clear);
  const setRecordedVideo = usePhotoStore((s) => s.setRecordedVideo);

  // 현재 컷 ref (타이머 콜백에서 최신값 보장)
  const currentRef = useRef(currentPhoto);
  useEffect(() => {
    currentRef.current = currentPhoto;
  }, [currentPhoto]);

  // 카메라 훅 (+ 녹화 제어)
  const {
    videoRef,
    streamReady,
    errorMsg,
    startPreview,
    stopPreview,
    captureFrame,
    // 🔴 MediaRecorder 제어용
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useCamera();

  // 🔸 촬영 직후 인터미션: 비디오 프레임을 그대로 멈춰 보여주기
  const [isIntermission, setIsIntermission] = useState(false);
  const INTERMISSION_MS = 1200;

  // 타임아웃/네비게이션 1회성 제어
  const intermissionTid = useRef<number | null>(null);
  const navigatedRef = useRef(false);

  // 자동 startPreview는 하지 않고, 최종 언마운트에서만 정리
  useEffect(() => {
    const init = async () => {
    clearStore(); // 기존 스토어 초기화
    try {
        await startPreview();           // 페이지 진입 시 바로 카메라 켬
        startRecording?.();             // 녹화 시작
        reset(8);                       // 타이머 초기화
        start(8);                        // 카운트다운 시작
      } catch (e) {
        console.error("카메라 초기화 실패:", e);
      }
    };

    init();
    return () => {
      if (intermissionTid.current) {
        clearTimeout(intermissionTid.current);
        intermissionTid.current = null;
      }
      // 녹화가 진행 중이었다면 안전하게 종료 시도 (스토어 저장은 여기선 하지 않음)
      try { stopRecording?.(); } catch {}
      stopPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearStore, stopPreview, stopRecording]);

  // 카운트다운
  const { sec, start, reset, pause, resume } = useCountdown({
    seconds: 8,
    autostart: false,
    onExpire: async () => {
      // 1) 사진 캡쳐(2:3 리사이즈)
      try {
        await captureFrame({
          cutNumber: currentRef.current,
          outW: 1200, // 결과: 1200x1800 (2:3)
        });
      } catch (e) {
        console.error("캡쳐 실패:", e);
      }

      // 2) 인터미션 시작: 비디오 pause + 🔴 녹화 pause
      setIsIntermission(true);
      const v = videoRef.current;
      if (v && !v.paused) {
        try { v.pause(); } catch {}
      }
      try { pauseRecording(); } catch {}

      // 3) 다음 컷 분기
      if (currentRef.current < totalPhotos) {
        if (intermissionTid.current) {
          clearTimeout(intermissionTid.current);
          intermissionTid.current = null;
        }
        intermissionTid.current = window.setTimeout(async () => {
          // 인터미션 종료: 비디오 재생 재개 + 🔴 녹화 resume
          const vv = videoRef.current;
          if (vv && vv.paused) {
            try { await vv.play(); } catch {}
          }
          try { resumeRecording(); } catch {}
          setIsIntermission(false);

          setCurrentPhoto((p) => p + 1);
          reset(8);
          start(8);

          intermissionTid.current = null;
        }, INTERMISSION_MS);
      } else {
        // 마지막 컷: 잠깐 보여주고 다음 페이지로
        if (intermissionTid.current) {
          clearTimeout(intermissionTid.current);
          intermissionTid.current = null;
        }
        intermissionTid.current = window.setTimeout(async () => {
          if (!navigatedRef.current) {
            // 🔴 녹화 종료 → Blob 전역 스토어 저장
            try {
              const blob = await stopRecording();
              setRecordedVideo(blob ?? null);
            } catch (e) {
              console.error("녹화 종료 실패:", e);
              setRecordedVideo(null);
            }
            navigatedRef.current = true;
            navigate("/Frameselect", { replace: true });
          }
          intermissionTid.current = null;
        }, INTERMISSION_MS);
      }
    },
  });

  // 스트림 준비되면 타이머 시작 (한 번만) + 🔴 녹화 시작 (한 번만)
  const countdownStartedRef = useRef(false);
  const recordingStartedRef = useRef(false);
  useEffect(() => {
    if (streamReady && !countdownStartedRef.current) {
      countdownStartedRef.current = true;
      reset(8);
      start(8);

      if (!recordingStartedRef.current) {
        try {
          startRecording();
          recordingStartedRef.current = true;
        } catch (e) {
          console.error("녹화 시작 실패:", e);
        }
      }
    }
  }, [streamReady, start, reset, startRecording]);

  // 탭 비가시 상태에서는 타이머/녹화 일시정지, 복귀 시 재개
  useEffect(() => {
    const onVis = async () => {
      if (document.hidden) {
        pause();
        try { pauseRecording(); } catch {}
      } else {
        resume();
        try { resumeRecording(); } catch {}
        try { await videoRef.current?.play(); } catch {}
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pause, resume, pauseRecording, resumeRecording]);

  return (
    <div className="relative w-screen h-screen bg-[#CFAB8D]">
      <div className="absolute inset-0 grid grid-cols-[1fr_260px]">
        {/* 좌측: 카메라 프리뷰 (인터미션 동안은 pause로 정지된 화면 표시) */}
        <div className="relative">
          <div className="absolute inset-[48px] rounded-sm shadow-inner bg-black overflow-hidden">
            <div className="relative w-full h-full grid place-items-center">
              <div className="relative aspect-[4/3] mx-auto h-full max-h-full overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  style={{ transform: 'scaleX(-1)' }}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* 2:3 가이드 프레임 */}
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
                {/* 인터미션 오버레이(선택) */}
                {isIntermission && (
                  <div className="absolute inset-0 bg-black/20 grid place-items-center">
                    <span className="text-white text-lg">촬영됨</span>
                  </div>
                )}
              </div>
            </div>

            {/* 오버레이: 사용자 제스처로 카메라 시작 (iOS/Safari 호환성 ↑) */}
            {!streamReady && !isIntermission && (
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
  ); /*Test*/
}
