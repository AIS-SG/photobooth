import { useNavigate } from "react-router-dom";

export default function Qrcode() {
  const navigate = useNavigate();

  return (
    <main className="relative w-screen h-screen bg-[#CFAB8D]">
      {/* 화면 90% 캔버스 */}
      <section
        className="absolute inset-[5%] rounded-2xl border border-neutral-200 shadow-sm
                   bg-white flex flex-col overflow-hidden"
      >
        <div className="flex-1 p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* 제목 */}
          <h1 className="md:col-span-8 font-['Hi-Melody'] text-black text-2xl md:text-4xl">
            촬영 영상
          </h1>
          <h2 className="md:col-span-4 font-['Hi-Melody'] text-black text-2xl md:text-4xl">
            QR 코드
          </h2>

          {/* 좌측: 촬영 영상 */}
          <div className="md:col-span-8 flex items-center justify-center">
            <div
              className="bg-[#d9d9d9] border border-black rounded-sm 
                         w-full h-full max-h-[400px] flex items-center justify-center"
            >
              {/* 안의 미디어: 부모 안에서만 줄어듦 */}
              <div
                className="bg-[#b9b9b9] w-full h-full max-w-full max-h-full aspect-[4/3]"
                role="img"
                aria-label="촬영 영상 플레이스홀더"
              />
            </div>
          </div>

          {/* 우측: QR 코드 */}
          <div className="md:col-span-4 flex items-center justify-center">
            <div
              className="bg-[#d9d9d9]/50 p-6 w-full h-full max-h-[400px] flex items-center justify-center"
            >
              <div
                className="bg-[#d9d9d9] border border-black rounded-sm 
                           w-full h-full max-w-full max-h-full aspect-square cursor-pointer"
                onClick={() => navigate("/Finish")}
                role="img"
                aria-label="QR 코드 플레이스홀더"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
