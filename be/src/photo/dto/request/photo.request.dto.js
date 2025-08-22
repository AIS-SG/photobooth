export const submitRequestDto = (body, file) => {
  return {
    photo : file,
    number : parseInt(body.number) || 1,
  }
}

export const downloadRequestDto = (query) => {
  return {
    name : query.name,
  }
}
