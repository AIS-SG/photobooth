// src/pages/Qrcode.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePhotoStore } from "../stores/photoStore";
import { useCountdown } from "../hooks/useCountdown";
import {CountdownOverlay} from "../components/CountdownOverlay"

export default function Qrcode() {
  const navigate = useNavigate();
  const { sec } = useCountdown({
      seconds: 30,
      autostart: true,
      onExpire: () => navigate("/Finish", { replace: true }),
    });

  const recordedVideo = usePhotoStore((s) => s.recordedVideo);
  const buildRecordedVideoURL = usePhotoStore((s) => s.buildRecordedVideoURL);
  const clearRecordedVideoURL = usePhotoStore((s) => s.clearRecordedVideoURL);

  const [videoURL, setVideoURL] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const location = useLocation();
  const {qrCodeDataUrl} = location.state || {};
  
  // 타임랩스 재생 속도 (원하면 4~12 사이로 바꿔도 됨)
  const SPEED = 6;

  // Blob -> ObjectURL
  useEffect(() => {
    if (!recordedVideo) return;
    const url = buildRecordedVideoURL();
    setVideoURL(url);
    return () => {
      clearRecordedVideoURL();
      setVideoURL(null);
    };
  }, [recordedVideo, buildRecordedVideoURL, clearRecordedVideoURL]);

  // 자동재생 + 타임랩스 속도 적용
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const applyPlayback = () => {
      // iOS/Safari에서 타임랩스 느낌을 위해 피치 보정 끄기
      // @ts-expect-error - vendor prefixed
      if (typeof v.webkitPreservesPitch === "boolean") v.webkitPreservesPitch = false;
      // // @ts-expect-error - 일부 브라우저에 존재
      if (typeof (v as any).preservesPitch === "boolean") (v as any).preservesPitch = false;

      v.muted = true;                 // 자동재생 정책 충족
      v.defaultPlaybackRate = SPEED;  // 기본 속도
      v.playbackRate = SPEED;         // 즉시 반영
    };

    const tryPlay = async () => {
      applyPlayback();
      try {
        // 일부 브라우저는 loadedmetadata 이후에만 play 허용
        await v.play();
        // 재생 시작 후에도 속도가 초기화되는 브라우저가 있어 한 번 더 적용
        v.playbackRate = SPEED;
      } catch (err) {
        // 자동재생이 막힌 경우(이론상 muted면 대부분 허용), 조용히 무시
        void err;
      }
    };

    if (v.readyState >= 1) {
      tryPlay();
    } else {
      v.addEventListener("loadedmetadata", tryPlay, { once: true });
    }
    return () => v.removeEventListener("loadedmetadata", tryPlay);
  }, [videoURL]);

  return (
    <main className="relative w-screen h-screen bg-[#CFAB8D]">
      <section className="absolute inset-[5%] rounded-2xl border border-neutral-200 shadow-sm bg-white flex flex-col overflow-hidden">
        <div className="flex-1 p-6 md:p-8 flex gap-8">

          {/* ⬅️ 좌측: 촬영 영상 (타임랩스 자동 재생) */}
          <div className="flex flex-col flex-[2] gap-4">
            <h1 className="font-['Hi-Melody'] text-black text-2xl md:text-4xl">
              촬영 영상 (타임랩스)
            </h1>
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-[#d9d9d9] border border-black rounded-sm w-full max-h-[420px] max-w-[560px] aspect-[4/3] flex items-center justify-center">
                {videoURL ? (
                  <video
                    ref={videoRef}
                    src={videoURL}
                    // 자동재생/반복/모바일 인라인 재생
                    autoPlay
                    loop
                    muted
                    playsInline
                    // 화면 맞춤
                    className="w-full h-full object-contain rounded-[4px]"
                  />
                ) : (
                  <div
                    className="bg-[#b9b9b9] w-full h-full aspect-[4/3] rounded-[4px]"
                    role="img"
                    aria-label="촬영 영상 플레이스홀더"
                  />
                )}
              </div>
            </div>
          </div>

            {/* ➡️ 우측: QR 코드 */}
            <div className="flex flex-col flex-1 gap-4">
              <h2 className="font-['Hi-Melody'] text-black text-2xl md:text-4xl">QR 코드</h2>
              <div className="flex-1 flex items-center justify-center">
                <div className="bg-[#d9d9d9]/50 p-6 flex items-center justify-center w-full max-w-[400px] aspect-square"
                style={{ backgroundImage: `url(${qrCodeDataUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                >   
              </div>
            </div>
          </div>
          <CountdownOverlay
                  remainingSec={sec}
                  totalSec={30}
                  label="다음 화면으로 넘어갑니다."
                />
        </div>
      </section>
    </main>
  );
}
