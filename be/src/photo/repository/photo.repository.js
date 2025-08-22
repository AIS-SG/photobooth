import {prisma} from "../../config/prisma.js"
export const reportPhotoUploadDate = async(fileName) => {
  return prisma.photos.create({
    data:{
      photoName: fileName
    }
  })
}
export const verifyPhotoExpires = async (data) => {
  const photo = await prisma.photos.findFirst({
    where: {
      photoName: data.name
    }
  });
  if (!photo) return false;
  const now = new Date();
  const createdAt = photo.createdAt;
  const timeDiffInMillis = now.getTime() - createdAt.getTime();
  const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
  return timeDiffInMillis <= twentyFourHoursInMillis;
}
