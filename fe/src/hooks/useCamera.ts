// src/hooks/useCamera.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { usePhotoStore } from "../stores/photoStore";
import { analyzeImageAndGetCorrections } from "../lib/imageAnalysis";

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

export type CaptureOptions = {
  cutNumber: number;
  /** 출력 가로 해상도 (기본 800 → 800x1200 저장) */
  outW?: number;
  /** 전역 스토어에 저장 여부 (기본 true) */
  saveToStore?: boolean;
};

/** 브라우저가 지원하는 가장 적절한 녹화 MIME 타입 선택 */
function pickSupportedMimeType() {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=h264,aac",
    "video/mp4",
  ];
  const MR: any = typeof window !== "undefined" ? (window as any).MediaRecorder : undefined;
  for (const t of candidates) {
    if (MR?.isTypeSupported?.(t)) return t;
  }
  return ""; // 브라우저가 결정하도록
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 좌우 반전 상태
  const [mirrored, setMirrored] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef(false);

  // 녹화 관련
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>(pickSupportedMimeType());

  const addPhoto = usePhotoStore((s) => s.add);

  /** 카메라 프리뷰 시작 (중복 호출 방지 포함) */
  const startPreview = useCallback(
    async (opts?: { audio?: boolean }) => {
      const wantAudio = opts?.audio ?? false; // 기본 false: 타임랩스는 오디오 없이 녹화
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
          audio: wantAudio, // 🔴 오디오 옵션화
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          try {
            await v.play();
          } catch (err) {
            // iOS 자동재생 거부 가능
            void err;
          }
        }
        setStreamReady(true);
      } catch (e: any) {
        setErrorMsg(e?.message ?? String(e));
        setStreamReady(false);
      } finally {
        startingRef.current = false;
      }
    },
    [streamReady]
  );

  const stopPreview = useCallback(() => {
    // 녹화 중이면 안전하게 끊기
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch (err) {
      void err;
    } finally {
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreamReady(false);
  }, []);

  useEffect(() => () => stopPreview(), [stopPreview]);

  /**
   * 현재 프레임을 2:3 중앙 크롭해서 Blob/URL 반환.
   * 기본적으로 전역 스토어에 저장(saveToStore=true).
   */
  async function captureFrame(opts: CaptureOptions) {
    const { cutNumber, outW = 800, saveToStore = true } = opts;

    const v = videoRef.current;
    if (!v) throw new Error("videoRef가 아직 연결되지 않았습니다.");
    if (!streamRef.current) throw new Error("카메라 스트림이 없습니다.");

    const filename = makeFilename(cutNumber);

    // 원본 해상도
    const srcW = v.videoWidth || 1920;
    const srcH = v.videoHeight || 1080;
    const srcAR = srcW / srcH;
    const targetAR = 2 / 3;

    // 중앙 크롭 영역 계산
    let sx = 0,
      sy = 0,
      sw = srcW,
      sh = srcH;
    if (srcAR > targetAR) {
      // 좌우 크롭
      const wantW = Math.round(srcH * targetAR);
      sx = Math.floor((srcW - wantW) / 2);
      sw = wantW;
    } else if (srcAR < targetAR) {
      // 상하 크롭
      const wantH = Math.round(srcW / targetAR);
      sy = Math.floor((srcH - wantH) / 2);
      sh = wantH;
    }

    // 출력 캔버스는 정확히 2:3
    const outH = Math.round((outW * 3) / 2);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";

    // 좌우 반전 옵션이 활성화되면 캔버스에 반전 적용 후 그리기
    if (mirrored) {
      ctx.save();
      ctx.translate(outW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(v, sx, sy, sw, sh, 0, 0, outW, outH);
      ctx.restore();
    } else {
      ctx.drawImage(v, sx, sy, sw, sh, 0, 0, outW, outH);
    }

    // 🎨 보정값 자동 분석 (Canvas 이미지 분석 기반)
    const autoCorrections = analyzeImageAndGetCorrections(canvas);
    usePhotoStore.getState().setCorrections(autoCorrections);

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95)
    );

    const url = URL.createObjectURL(blob);

    if (saveToStore) {
      addPhoto({ filename, url, blob, width: outW, height: outH });
    }

    return { blob, filename, objectUrl: url, width: outW, height: outH };
  }

  // -----------------------
  // 🔴 녹화 제어 API (MediaRecorder)
  // -----------------------
  const startRecording = useCallback(() => {
    if (!streamRef.current) throw new Error("스트림이 없습니다. 먼저 startPreview()를 호출하세요.");
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") return;

    recordedChunksRef.current = [];
    const mr = new MediaRecorder(
      streamRef.current,
      mimeTypeRef.current ? { mimeType: mimeTypeRef.current } : undefined
    );

    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    mr.start(); // timeslice 없이 한 파일로 쌓기
    mediaRecorderRef.current = mr;
  }, []);

  const pauseRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === "recording") mr.pause();
  }, []);

  const resumeRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === "paused") mr.resume();
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const mr = mediaRecorderRef.current;
    if (!mr) return null;

    // inactive면 이미 완료된 상태: 누적 청크로 Blob 만들기
    if (mr.state === "inactive") {
      mediaRecorderRef.current = null;
      return new Blob(recordedChunksRef.current, {
        type: mimeTypeRef.current || "video/webm",
      });
    }

    const done = new Promise<Blob>((resolve) => {
      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: mimeTypeRef.current || "video/webm",
        });
        resolve(blob);
      };
    });
    mr.stop();
    mediaRecorderRef.current = null;
    return await done;
  }, []);

  const toggleMirror = () => setMirrored((v) => !v);

  return {
    videoRef,
    streamReady,
    errorMsg,
    startPreview,
    stopPreview,
    captureFrame,
    // mirror
    mirrored,
    toggleMirror,
    // 🔴 추가: 녹화 제어
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
}
