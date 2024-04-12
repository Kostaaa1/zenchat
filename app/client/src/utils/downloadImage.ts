import axios from "axios";

export const downloadImage = (imgUrl: string) => {
  axios({ url: imgUrl, method: "GET", responseType: "blob" })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;

      const newImgName = imgUrl.split(import.meta.env.VITE_IMAGEKIT_PREFIX)[1];

      link.setAttribute("download", newImgName);

      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
    })
    .catch((err) => {
      console.error("Error downloading Image: ", err);
    });
};
