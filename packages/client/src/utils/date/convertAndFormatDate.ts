export function convertAndFormatDate(dateString: string) {
  const date = new Date(dateString)
  const dayOptions = { weekday: "short" }
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: true }
  // @ts-expect-error ???
  const dayOfWeek = date.toLocaleDateString("en-US", dayOptions)
  // @ts-expect-error ???
  const formattedTime = date.toLocaleTimeString("en-US", timeOptions)
  const result = `${dayOfWeek} ${formattedTime}`
  return result
}
