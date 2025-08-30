// src/hooks/useCamera.ts
import { useCallback, useEffect, useRef, useState } from "react";

function makeFilename(cut: number) {
  const now = new Date();
  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${YYYY}${MM}${DD}_${hh}${mm}${ss}_${String(cut).padStart(2, "0")}.jpg`;
}

function isStreamLive(s?: MediaStream | null) {
  return !!s && s.getVideoTracks().some((t) => t.readyState === "live");
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef(false);

  /** 카메라 프리뷰 시작 (중복 호출 방지 포함) */
  const startPreview = useCallback(async () => {
    if (startingRef.current) return;
    if (isStreamLive(streamRef.current)) {
      if (!streamReady) setStreamReady(true);
      return;
    }
    startingRef.current = true;
    try {
      setErrorMsg(null);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      const preferred = cams.find((d) =>
        /cam link|elgato|capture|hdmi|eos webcam|sony|nikon|canon/i.test(d.label)
      );

      const constraints: MediaStreamConstraints = {
        video: preferred
          ? { deviceId: { exact: preferred.deviceId } }
          : { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        try { await v.play(); } catch { /* iOS 자동재생 거부 가능 */ }
      }
      setStreamReady(true);
    } catch (e: any) {
      setErrorMsg(e?.message ?? String(e));
      setStreamReady(false);
    } finally {
      startingRef.current = false;
    }
  }, [streamReady]);

  const stopPreview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreamReady(false);
  }, []);

  useEffect(() => () => stopPreview(), [stopPreview]);

  /**
   * 현재 프레임을 2:3 중앙 크롭해서 저장/반환
   * @param cutNumber 파일명 컷번호
   * @param outW 출력 가로 해상도 (기본 800 → 800x1200 저장)
   */
  async function captureFrame(cutNumber: number, outW = 800) {
    const v = videoRef.current;
    if (!v) throw new Error("videoRef가 아직 연결되지 않았습니다.");
    if (!streamRef.current) throw new Error("카메라 스트림이 없습니다.");

    const filename = makeFilename(cutNumber);

    // 원본 해상도
    const srcW = v.videoWidth || 1920;
    const srcH = v.videoHeight || 1080;
    const srcAR = srcW / srcH; // 보통 4/3 또는 16/9
    const targetAR = 2 / 3;

    // 중앙 크롭 영역 계산
    let sx = 0, sy = 0, sw = srcW, sh = srcH;
    if (srcAR > targetAR) {
      // 가로가 더 넓음 → 좌우 크롭
      const wantW = Math.round(srcH * targetAR); // 2/3 * H
      sx = Math.floor((srcW - wantW) / 2);
      sw = wantW;
    } else if (srcAR < targetAR) {
      // 세로가 더 큼 → 상하 크롭 (드묾)
      const wantH = Math.round(srcW / targetAR);
      sy = Math.floor((srcH - wantH) / 2);
      sh = wantH;
    }

    // 출력 캔버스는 정확히 2:3
    const outH = Math.round(outW * 3 / 2);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, outW, outH);

    const blob = await new Promise<Blob>((r) =>
      canvas.toBlob((b) => r(b!), "image/jpeg", 0.95)
    );

    // 브라우저 다운로드 (경로 지정 불가, 파일명은 지정)
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    return { blob, filename, objectUrl: url, width: outW, height: outH };
  }

  return { videoRef, streamReady, errorMsg, startPreview, stopPreview, captureFrame };
}
