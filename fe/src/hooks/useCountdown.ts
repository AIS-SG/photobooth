// /fe/src/hooks/useCountdown.ts
import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  seconds: number;
  autostart?: boolean;
  onExpire?: () => void;
  onTick?: (sec: number) => void;
};

export function useCountdown({ seconds, autostart = true, onExpire, onTick }: Options) {
  const [sec, setSec] = useState<number>(seconds);
  const timerRef = useRef<number | null>(null);
  const endAtRef = useRef<number | null>(null);

  // ✅ 콜백을 ref에 저장해서 의존성에서 제거
  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  const remainingTimeRef = useRef(0);
  const clear = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback((s?: number) => {
    const init = s ?? seconds;
    clear();
    endAtRef.current = Date.now() + init * 1000;
    setSec(init);

    timerRef.current = window.setInterval(() => {
      if (endAtRef.current == null) return;
      const leftMs  = Math.max(0, endAtRef.current - Date.now());
      const leftSec = Math.max(0, Math.ceil(leftMs / 1000));

      // 디버깅: 틱 값
      // console.log("[useCountdown] tick leftSec =", leftSec);

      setSec(prev => (prev !== leftSec ? leftSec : prev));
      onTickRef.current?.(leftSec);

      if (leftSec <= 0) {
        clear();
        onExpireRef.current?.();
      }
    }, 250);
  }, [seconds]); // ✅ seconds만 의존

  const pause = useCallback(() => {
    if (timerRef.current != null) {
      clear();
      remainingTimeRef.current = sec; // 남은 시간 저장
    }
  }, [sec]);

  const resume = useCallback(() => {
    if (remainingTimeRef.current > 0) {
      start(remainingTimeRef.current); // 저장된 시간으로 다시 시작
      remainingTimeRef.current = 0; // 초기화
    }
  }, [start]);

  const reset = useCallback((s?: number) => {
    clear();
    setSec(s ?? seconds);
    endAtRef.current = null;
  }, [seconds]);

  useEffect(() => {
    if (autostart) start(seconds);
    return clear;
    // ✅ start를 의존성에서 빼야 재시작 루프가 안 생김
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart, seconds]);

  // 디버깅: 렌더된 sec 값
  // useEffect(() => { console.log("[useCountdown] sec ->", sec); }, [sec]);

  return { sec, start, reset, pause, resume };
}
