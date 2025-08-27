const KEY = "selectedFrame";
let mem: string | null | undefined = undefined;

/** 내부: storage에서 읽기 */
function readFromStorage(): string | null {
  try {
    const v = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
    return v && v !== "null" ? v : null;
  } catch {
    return null;
  }
}

/** 현재 선택된 프레임 가져오기 */
export function getSelectedFrame(): string | null {
  if (mem !== undefined) return mem;
  mem = readFromStorage();
  return mem;
}

/**
 * 프레임 선택값 저장
 * @param value string | null
 * @param persist 'session' | 'local' (기본은 session)
 */
export function setSelectedFrame(
  value: string | null,
  persist: "session" | "local" = "session"
) {
  mem = value;

  try {
    // 이전 저장소 모두 비움
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);

    if (value) {
      const store = persist === "local" ? localStorage : sessionStorage;
      store.setItem(KEY, value);
    }
  } catch {
    // storage 사용 불가 환경에서는 무시
  }
}

/** 프레임 값 초기화 */
export function clearSelectedFrame() {
  mem = null;
  try {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  } catch {}
}