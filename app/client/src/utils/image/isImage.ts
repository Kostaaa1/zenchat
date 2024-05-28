export const isImage = (type: string) => {
  return type.split("/")[0] === "image";
};
