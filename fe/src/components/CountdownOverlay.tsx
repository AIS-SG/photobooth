export function CountdownOverlay({
  remainingSec,
  totalSec,
  label,
  opacity = 1, // ✅ 기본 투명도 (1 = 불투명)
}: { 
  remainingSec: number; 
  totalSec: number; 
  label?: string; 
  opacity?: number; // 0.0 ~ 1.0
}) {
  const pct = 100 - Math.floor((remainingSec / totalSec) * 100);

  return (
    <div
      className="fixed left-0 right-0 bottom-0 p-4 pointer-events-none"
      style={{ opacity }} // ✅ 투명도 적용
    >
      <div className="mx-auto w-full max-w-xl rounded-2xl shadow p-4 border bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{label ?? "남은 시간"}</span>
          <span className="text-xl font-bold">{remainingSec}s</span>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-2 rounded bg-black"
            style={{ width: `${pct}%`, transition: "width 1s linear" }}
          />
        </div>
      </div>
    </div>
  );
}
