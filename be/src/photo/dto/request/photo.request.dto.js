export const submitRequestDto = (body, photoFile, timelapseFile) => {
  return {
    photo: photoFile,
    timelapse: timelapseFile || null,
    number: parseInt(body.number) || 1,
  };
}

export const downloadRequestDto = (query) => {
  return {
    name : query.name,
  }
}
 