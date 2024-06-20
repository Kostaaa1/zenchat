import { nanoid } from "nanoid"

export const renameFile = (fileImage: File, chatroom_id?: string, cb?: (file: File) => void): File => {
  const uniquePrefix = nanoid()
  const chatroomPrefix = chatroom_id?.split("-")[0] || null
  const filename = [chatroomPrefix, uniquePrefix, fileImage.name].filter(Boolean).join("-")

  const newFile = new File([fileImage], filename, { type: fileImage.type })
  if (cb) cb(newFile)
  return newFile
}

export const playSound = (id: string, path: string, volume?: number) => {
  const el = document.getElementById(id) as HTMLAudioElement
  if (el) {
    el.src = path
    el.volume = volume || 0.05
    el.play()
  }
}

export const stopSound = (id: string) => {
  const el = document.getElementById(id) as HTMLAudioElement
  if (el) {
    el.pause()
  }
}
