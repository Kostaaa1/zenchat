import { nanoid } from "nanoid"

export const renameFile = (fileImage: File, chatroom_id?: string, cb?: (file: File) => void): File => {
  const uniquePrefix = nanoid()
  const chatroomPrefix = chatroom_id?.split("-")[0] || null
  const filename = [chatroomPrefix, uniquePrefix, fileImage.name].filter(Boolean).join("-")

  const newFile = new File([fileImage], filename, { type: fileImage.type })
  if (cb) cb(newFile)
  return newFile
}

export const playSound = (data: { id: string; path: string; start?: number; volume?: number }) => {
  const { id, path, start, volume } = data
  const el = document.getElementById(id) as HTMLAudioElement
  if (el) {
    el.src = path
    el.volume = volume || 0.05
    if (start) el.currentTime = start
    el.play()
  }
}

export const stopSound = (id: string) => {
  const el = document.getElementById(id) as HTMLAudioElement
  if (el) {
    el.pause()
  }
}
