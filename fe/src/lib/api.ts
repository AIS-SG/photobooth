import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/",
  withCredentials: true,
});


export const uploadPhoto = async(file: File, timelapse?: File) => {
  const formData = new FormData();
  formData.append("photo", file);
  if (timelapse) formData.append("timelapse", timelapse);

  try{
    const response = await api.post("/photo/submit", formData, {headers: {"Content-Type" : "multipart/form-data",},});
    return response.data;
  }catch(error){
    if(axios.isAxiosError(error)){
      throw new Error(error.response?.data?.message || "File upload failed.");
    }
    throw new Error("An unexpected error occurred.");
  }
};

export const downloadPhoto = async (fileName: string) => {
  try {
    const response = await api.get("/photo/download", {
      params: {
        name: fileName,
      },
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "File download failed.");
    }
    throw new Error("An unexpected error occurred.");
  }
};