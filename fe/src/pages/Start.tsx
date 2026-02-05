import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { usePhotoStore } from "../stores/photoStore";

export default function Start() {
  const navigate = useNavigate();
  const clearStore = usePhotoStore((s) => s.clear);
  const setRecordedVideo = usePhotoStore((s) => s.setRecordedVideo);

  // 시작 화면에 진입할 때마다 로컬에 보관된 사진/영상(Blob, ObjectURL 포함)을 정리합니다.
  useEffect(() => {
    clearStore();
    // 추가로 recordedVideo가 Blob으로 남아 있다면 명시적으로 null로 설정
    setRecordedVideo(null);
  }, [clearStore, setRecordedVideo]);

  return (
    <main className="w-screen h-screen bg-white flex" onClick={() => navigate("/count")}>
    {/* 왼쪽 2/3 영역 */}
    <div className="flex flex-col justify-center items-center w-2/3 h-full bg-[#cfab8d]">
        <h1 className="font-normal text-white text-[150px] leading-tight font-[Hi_Melody] text-center">
        꾸중<br />네컷
        </h1>
    </div>

    {/* 오른쪽 1/3 영역 */}
    <div className="flex justify-center items-center w-1/3 h-full">
        <p className="text-[#cfab8d] text-[40px] font-[Hi_Melody] leading-[1.2] tracking-wide text-center  whitespace-pre-line">
        화<br/>면<br />을<br /><br />터<br />치<br />해<br />주<br />세<br/>요
        </p>
    </div>
    </main>

    
  );
  
}
