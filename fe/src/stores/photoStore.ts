import {create} from "zustand";

export type CapturedPhoto = {
    id: string;
    filename: string;
    url: string;
    blob: Blob;
    width: number;
    height: number;
    createdAt: number;
}

type PhotoState = {
    items: CapturedPhoto[];
    add: (p: Omit<CapturedPhoto, "id" | "createdAt">) => string;
    setMany: (arr: Omit<CapturedPhoto, "id" | "createdAt">[]) => void;
    clear: () => void;
    remove: (id:string) => void;
};

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const usePhotoStore = create<PhotoState>((set, get) => ({
    items: [],
    add: (p) => {
        const id = genId();
        const createdAt = Date.now();
        set((s) => ({items: [...s.items, { ...p, id, createdAt}]}));
        return id;
    },
    setMany: (arr) => {
        get().items.forEach((it)=>URL.revokeObjectURL(it.url));
        const createdAt = Date.now();
        set({
            items: arr.map((p)=> ({...p, id:genId(), createdAt})),
        });
    },
    clear: ()=>{
        get().items.forEach((it) => URL.revokeObjectURL(it.url));
        set({items:[]});
    },
    remove: (id)=>{
        const it = get().items.find((x)=> x.id === id);
        if (it) URL.revokeObjectURL(it.url);
        set((s)=>({items: s.items.filter((x)=>x.id !== id)}));
    },
}));