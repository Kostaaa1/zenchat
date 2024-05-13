function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  const millisecond = String(now.getMilliseconds()).padStart(3, "0");
  const timezoneOffset = now.getTimezoneOffset();

  const offsetHours = Math.abs(Math.floor(timezoneOffset / 60));
  const offsetMinutes = Math.abs(timezoneOffset % 60);
  const offsetSign = timezoneOffset < 0 ? "+" : "-";

  const string = `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}${offsetSign}${String(
    offsetHours,
  ).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;

  return string;
}
export default getCurrentDate;
