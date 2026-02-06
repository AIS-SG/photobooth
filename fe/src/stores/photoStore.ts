import { create } from "zustand";

export type CapturedPhoto = {
  id: string;
  filename: string;
  url: string;
  blob: Blob;
  width: number;
  height: number;
  createdAt: number;
};

export type PhotoCorrections = {
  brightness: number;
  contrast: number;
  saturation: number;
};

type PhotoState = {
  // 📷 사진 관련
  items: CapturedPhoto[];
  add: (p: Omit<CapturedPhoto, "id" | "createdAt">) => string;
  setMany: (arr: Omit<CapturedPhoto, "id" | "createdAt">[]) => void;
  clear: () => void;
  remove: (id: string) => void;

  // 🎨 사진 보정
  corrections: PhotoCorrections;
  setCorrections: (corrections: Partial<PhotoCorrections>) => void;
  resetCorrections: () => void;

  // 🎥 녹화 영상 관련
  recordedVideo: Blob | null;
  recordedVideoURL: string | null;
  setRecordedVideo: (blob: Blob | null) => void;
  buildRecordedVideoURL: () => string | null;
  clearRecordedVideoURL: () => void;
};

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function revokeURL(url?: string | null) {
  if (url) URL.revokeObjectURL(url);
}

export const usePhotoStore = create<PhotoState>((set, get) => ({
  // ----------------
  // 📷 사진 관련
  // ----------------
  items: [],
  add: (p) => {
    const id = genId();
    const createdAt = Date.now();
    set((s) => ({ items: [...s.items, { ...p, id, createdAt }] }));
    return id;
  },
  setMany: (arr) => {
    get().items.forEach((it) => URL.revokeObjectURL(it.url));
    const createdAt = Date.now();
    set({
      items: arr.map((p) => ({ ...p, id: genId(), createdAt })),
    });
  },
  clear: () => {
    get().items.forEach((it) => URL.revokeObjectURL(it.url));
    // 🎥 영상 URL도 정리
    revokeURL(get().recordedVideoURL);
    set({ items: [], recordedVideo: null, recordedVideoURL: null, corrections: { brightness: 1, contrast: 1, saturation: 1 } });
  },
  remove: (id) => {
    const it = get().items.find((x) => x.id === id);
    if (it) URL.revokeObjectURL(it.url);
    set((s) => ({ items: s.items.filter((x) => x.id !== id) }));
  },

  // ----------------
  // 🎨 사진 보정
  // ----------------
  corrections: { brightness: 1, contrast: 1, saturation: 1 },
  setCorrections: (partialCorrections) => {
    set((s) => ({
      corrections: { ...s.corrections, ...partialCorrections },
    }));
  },
  resetCorrections: () => {
    set({ corrections: { brightness: 1, contrast: 1, saturation: 1 } });
  },

  // ----------------
  // 🎥 녹화 영상 관련
  // ----------------
  recordedVideo: null,
  recordedVideoURL: null,

  setRecordedVideo: (blob) => {
    // 기존 URL revoke
    revokeURL(get().recordedVideoURL);
    set({ recordedVideo: blob, recordedVideoURL: null });
  },

  buildRecordedVideoURL: () => {
    const st = get();
    if (!st.recordedVideo) return null;
    if (st.recordedVideoURL) return st.recordedVideoURL;
    const url = URL.createObjectURL(st.recordedVideo);
    set({ recordedVideoURL: url });
    return url;
  },

  clearRecordedVideoURL: () => {
    revokeURL(get().recordedVideoURL);
    set({ recordedVideoURL: null });
  },
}));
