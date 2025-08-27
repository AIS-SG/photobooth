import { useNavigate } from "react-router-dom";

export default function Qrcode() {
  const navigate = useNavigate();

  return (
    <main className="relative w-screen h-screen bg-[#CFAB8D]">
      <section className="absolute inset-[5%] rounded-2xl border border-neutral-200 shadow-sm bg-white flex flex-col overflow-hidden">
        {/* ✅ flex로 좌/우 배치 */}
        <div className="flex-1 p-6 md:p-8 flex gap-8">
          
          {/* ⬅️ 좌측: 촬영 영상 */}
          <div className="flex flex-col flex-[2] gap-4">
            <h1 className="font-['Hi-Melody'] text-black text-2xl md:text-4xl">
              촬영 영상
            </h1>
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-[#d9d9d9] border border-black rounded-sm  w-full h-full max-h-[420px] flex items-center justify-center">
                <div
                  className="bg-[#b9b9b9] w-full h-full aspect-[4/3] rounded-[4px]"
                  role="img"
                  aria-label="촬영 영상 플레이스홀더"
                />
              </div>
            </div>
          </div>

          {/* ➡️ 우측: QR 코드 */}
          <div className="flex flex-col flex-1 gap-4">
          <h2 className="font-['Hi-Melody'] text-black text-2xl md:text-4xl">
            QR 코드
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-[#d9d9d9]/50 p-6 flex items-center justify-center 
                            w-full max-w-[400px] aspect-square">
              <div
                className="bg-[#d9d9d9] border border-black rounded-sm p-4 
                          w-full h-full cursor-pointer"
                onClick={() => navigate("/Finish")}
                role="img"
                aria-label="QR 코드 플레이스홀더"
              >
                <div className="w-full h-full bg-[#e1e1e1] rounded-[4px]" />
              </div>
            </div>
          </div>
        </div>

        </div>
      </section>
    </main>
  );
}
