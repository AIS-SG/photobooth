// src/lib/processPhoto.ts
import type { CapturedPhoto } from "../stores/photoStore";

export const processPhoto = async (
  photoItem: CapturedPhoto
): Promise<Omit<CapturedPhoto, 'id' | 'createdAt'> & { id: string; }> => {
  console.log(`[API 호출] ${photoItem.filename} 보정 요청...`);

  try {
    const formData = new FormData();
    // ✅ photoItem 객체에서 blob과 filename을 직접 가져와서 사용
    formData.append("image", photoItem.blob, photoItem.filename);

    // ✅ 올바른 Gradio API 엔드포인트 URL로 수정 (예시)
    // 실제 Gradio 앱의 API 문서에서 정확한 경로를 확인해야 합니다.
    const response = await fetch("https://0365bd405c5d76b7de.gradio.live/api/predict", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("서버에서 이미지 보정 실패");
    }

    const newBlob = await response.blob();
    const newUrl = URL.createObjectURL(newBlob);

    // ✅ 백틱(``)을 사용해 문자열 보간법 수정
    console.log(`[API 호출] ${photoItem.filename} 보정 완료`);

    return {
      id: photoItem.id,
      filename: photoItem.filename,
      url: newUrl,
      blob: newBlob,
      width: photoItem.width,
      height: photoItem.height,
      createdAt: photoItem.createdAt
    };
  } catch (error) {
    // ✅ 백틱(``)을 사용해 문자열 보간법 수정
    console.error(`이미지 보정 중 오류 발생: ${error}`);
    // 오류 발생 시 원본 데이터를 그대로 반환합니다.
    return photoItem;
  }
};