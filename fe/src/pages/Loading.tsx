import { useNavigate } from "react-router-dom";
import { usePhotoStore } from "../stores/photoStore";
import { useEffect } from "react";
import type { CapturedPhoto } from "../stores/photoStore";

// ✅ 백엔드 API와 연동될 processPhoto 함수를 가져옵니다.
// 이 함수는 photoItem 전체를 인자로 받습니다.
import { processPhoto } from "../lib/processPhoto";

export default function Loading() {
    const navigate = useNavigate();
    // ✅ 스토어에서 모든 사진 정보(items)와 업데이트 액션을 가져옵니다.
    const items = usePhotoStore(s => s.items);
    const updatePhoto = usePhotoStore(s => s.updatePhoto);

    useEffect(() => {
        const processAndSavePhotos = async () => {
            // ✅ items 배열이 비어있는 경우, 촬영 페이지로 이동합니다.
            if (items.length === 0) {
                navigate("/Phototime", { replace: true });
                return;
            }

            // ✅ 모든 사진 보정 작업을 병렬로 실행합니다.
            const updatedItems: (CapturedPhoto)[] = await Promise.all(
                items.map(async (item) => {
                    // ✅ photoItem 전체를 processPhoto 함수에 전달합니다.
                    const updatedItem = await processPhoto(item);
                    // Ensure createdAt is preserved in the returned object
                    return { ...updatedItem, createdAt: item.createdAt };
                })
            );

            // ✅ 보정된 사진 정보로 스토어를 업데이트합니다.
            updatedItems.forEach(item => updatePhoto(item));

            // ✅ 모든 작업이 완료되면 다음 페이지로 이동합니다.
            navigate("/Photoselect", { replace: true });
        };
        
        // 컴포넌트가 마운트될 때 한 번만 보정 작업을 시작합니다.
        processAndSavePhotos();
    }, [items, navigate, updatePhoto]);
    
    return (
        <main className="min-h-screen w-screen bg-[#cfab8d] flex flex-col items-center justify-center">
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