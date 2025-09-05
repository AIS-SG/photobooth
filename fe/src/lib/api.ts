import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || " https://27435039af45.ngrok-free.app",
  withCredentials: true,
});


export const uploadPhoto = async(file: File, printCount: number) => {
  const formData = new FormData();
  formData.append("photo", file);
  formData.append("printCount", String(printCount));
  console.log(`printCount ${printCount}`);

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