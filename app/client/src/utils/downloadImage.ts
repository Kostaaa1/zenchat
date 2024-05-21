import axios from "axios";

export const downloadImage = async (imgUrl: string) => {
  const { data } = await axios.get(imgUrl);
  console.log("Data", data);
  //   axios({ url: imgUrl, method: "GET", responseType: "blob" })
  //     .then((res) => {
  //       console.log("res", res);
  //       const url = window.URL.createObjectURL(new Blob([res.data]));
  //       const link = document.createElement("a");
  //       link.href = url;
  //       const newImgName = imgUrl.split(import.meta.env.VITE_S3_URL)[1];
  //       link.setAttribute("download", newImgName);
  //       document.body.appendChild(link);
  //       link.click();
  //       window.URL.revokeObjectURL(url);
  //     })
  //     .catch((err) => {
  //       console.error("Error downloading Image: ", err);
  //     });
};
