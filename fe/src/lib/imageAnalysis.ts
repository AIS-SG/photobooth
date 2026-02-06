import type { PhotoCorrections } from "../stores/photoStore";

/**
 * Canvas에서 이미지 데이터를 분석하여 최적의 보정값을 계산합니다.
 */
export function analyzeImageAndGetCorrections(
  canvas: HTMLCanvasElement
): PhotoCorrections {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { brightness: 1, contrast: 1, saturation: 1 };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let totalBrightness = 0;
  let rMin = 255, rMax = 0;
  let gMin = 255, gMax = 0;
  let bMin = 255, bMax = 0;
  let totalSaturation = 0;
  let pixelCount = 0;

  // 픽셀 데이터 분석 (4개씩: R, G, B, A)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 밝기 계산 (YUV 표준)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    totalBrightness += brightness;

    // 명암 계산용 Min/Max 추적
    rMin = Math.min(rMin, r);
    rMax = Math.max(rMax, r);
    gMin = Math.min(gMin, g);
    gMax = Math.max(gMax, g);
    bMin = Math.min(bMin, b);
    bMax = Math.max(bMax, b);

    // 채도 계산 (HSV 기반)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    totalSaturation += saturation;

    pixelCount++;
  }

  const avgBrightness = totalBrightness / pixelCount;
  const avgSaturation = totalSaturation / pixelCount;

  // 1️⃣ 밝기 보정 (더 강한 범위)
  // 목표: 평균 밝기를 130 (중간값) 근처로 조정
  const targetBrightness = 130;
  let brightnessCorrection = 1;
  if (avgBrightness < 60) {
    brightnessCorrection = Math.min(2.5, targetBrightness / (avgBrightness + 5));
  } else if (avgBrightness > 190) {
    brightnessCorrection = Math.max(0.6, targetBrightness / (avgBrightness - 10));
  } else if (avgBrightness > 150) {
    brightnessCorrection = 0.95;
  }

  // 2️⃣ 명암 보정 (더 강한 범위)
  // 목표: 픽셀 값의 분포를 확대 (히스토그램 확대)
  const rContrast = rMax - rMin;
  const gContrast = gMax - gMin;
  const bContrast = bMax - bMin;
  const avgContrast = (rContrast + gContrast + bContrast) / 3;

  let contrastCorrection = 1;
  if (avgContrast < 40) {
    contrastCorrection = Math.min(2.2, 180 / (avgContrast + 5));
  } else if (avgContrast < 80) {
    contrastCorrection = Math.min(1.8, 150 / (avgContrast + 5));
  } else if (avgContrast > 200) {
    contrastCorrection = 0.85;
  }

  // 3️⃣ 채도 보정 (더 강한 범위)
  // 목표: 채도를 적절한 수준으로 조정
  let saturationCorrection = 1;
  if (avgSaturation < 0.25) {
    saturationCorrection = Math.min(2.0, 0.6 / (avgSaturation + 0.05));
  } else if (avgSaturation < 0.35) {
    saturationCorrection = Math.min(1.6, 0.5 / (avgSaturation + 0.05));
  } else if (avgSaturation > 0.85) {
    saturationCorrection = 0.9;
  }

  console.log("[imageAnalysis]", {
    avgBrightness: avgBrightness.toFixed(2),
    avgContrast: avgContrast.toFixed(2),
    avgSaturation: avgSaturation.toFixed(3),
    brightness: brightnessCorrection.toFixed(2),
    contrast: contrastCorrection.toFixed(2),
    saturation: saturationCorrection.toFixed(2),
  });

  return {
    brightness: Math.max(0.6, Math.min(2.5, brightnessCorrection)),
    contrast: Math.max(0.7, Math.min(2.2, contrastCorrection)),
    saturation: Math.max(0.8, Math.min(2.0, saturationCorrection)),
  };
}
