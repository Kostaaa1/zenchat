const getCurrentDate = () => {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  const miliseconds = String(now.getUTCMilliseconds()).padStart(6, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${miliseconds}+00`;
};

export default getCurrentDate;
