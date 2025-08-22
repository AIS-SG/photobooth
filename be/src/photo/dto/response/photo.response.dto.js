export const submitResponseDto = (data) => {
  return {
    downloadUrl: data.downloadUrl,
    qrCodeDataUrl: data.qrCodeDataUrl,
  }
}
export const verifyResponseDto = (data) => {
  return null;
}
