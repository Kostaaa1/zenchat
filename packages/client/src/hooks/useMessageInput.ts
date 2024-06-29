import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react"
import { renameFile } from "../utils/file"
import useChatMapStore from "../stores/chatMapStore"
import useUser from "./useUser"
import { trpc } from "../lib/trpcClient"
import useChatCache from "./useChatCache"
import { v4 as uuidv4 } from "uuid"
import { S3UploadResponse, TChatroom, TMessage } from "../../../server/src/types/types"
import { getCurrentDate } from "../utils/date"
import axios from "axios"
import { Skin } from "@emoji-mart/data"
import { serverURL } from "../lib/socket"

const useMessageInput = (chatroom: TChatroom) => {
  const { addNewMessageToChatCache } = useChatCache()
  const [formData, setFormdata] = useState<FormData>(new FormData())
  const sendMessageMutation = trpc.chat.messages.send.useMutation()
  const [trackFiles, setTrackFiles] = useState<File[]>([])
  const { sessionToken, user } = useUser()
  const { addChatInputImage, clearMessageInput, removeChatInputImage, clearImagesInput, addChatInputMessage } =
    useChatMapStore((state) => state.actions)
  const [imageInputs, setImageInputs] = useState<string[]>([])
  const [messageInput, setMessageInput] = useState<string>("")
  const { inputImages, inputMessages } = useChatMapStore((state) => ({
    inputImages: state.inputImages,
    inputMessages: state.inputMessages
  }))

  useEffect(() => {
    const a = inputImages.get(chatroom.chatroom_id) ?? []
    const b = inputMessages.get(chatroom.chatroom_id) ?? ""
    setImageInputs(a)
    setMessageInput(b)
  }, [chatroom, inputImages, inputMessages])

  const addFile = useCallback(
    (newFile: File) => {
      formData.append("images", newFile)
      setFormdata(formData)
      addChatInputImage(chatroom.chatroom_id, URL.createObjectURL(newFile))
      setTrackFiles([...trackFiles, newFile])
    },
    [addChatInputImage, chatroom, formData, trackFiles]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e?.target?.files?.[0]
      if (file) renameFile(file, chatroom?.chatroom_id, addFile)
      e.target.value = ""
    },
    [addFile, chatroom]
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (chatroom) {
        const { value } = e.target
        addChatInputMessage(chatroom.chatroom_id, value)
      }
    },
    [chatroom, addChatInputMessage]
  )

  const removeFileFromStack = useCallback(
    (id: number) => {
      if (chatroom) {
        const chatroomID = chatroom.chatroom_id
        removeChatInputImage(chatroomID, id)
        setTrackFiles((state) => state.filter((_, index) => index !== id))
        const newFormData = new FormData()
        formData.forEach((value) => {
          if (value instanceof File && value.name !== trackFiles[id].name) {
            newFormData.append("images", value)
          }
        })
        setFormdata(newFormData)
      }
    },
    [chatroom, formData, removeChatInputImage, trackFiles]
  )

  const createNewMessage = useCallback(
    (data: { content: string; chatroom_id: string; is_image: boolean; id?: string }): TMessage => {
      const { content, id, chatroom_id, is_image } = data
      return {
        id: id ?? uuidv4(),
        sender_id: user!.id,
        sender_username: user!.username,
        created_at: getCurrentDate(),
        is_image,
        chatroom_id,
        content
      }
    },
    [user]
  )

  const sendTextMessage = useCallback(
    async (input_message: string, chatroom_id: string) => {
      clearMessageInput(chatroom_id)
      const newMessage = createNewMessage({
        content: input_message,
        is_image: false,
        chatroom_id
      })
      addNewMessageToChatCache(newMessage)
      if (newMessage) await sendMessageMutation.mutateAsync(newMessage)
    },
    [addNewMessageToChatCache, clearMessageInput, sendMessageMutation, createNewMessage]
  )

  const sendImageMessage = useCallback(
    async (chatroomId: string) => {
      const input_images = inputImages.get(chatroomId)
      if (!input_images) return
      const newMessagesStack: TMessage[] = []
      clearImagesInput(chatroomId)

      for (const fileUrl of input_images) {
        const id = uuidv4()
        const newMsg = createNewMessage({
          id,
          chatroom_id: chatroomId,
          content: "",
          is_image: true
        })
        newMsg.content = fileUrl
        newMessagesStack.push(newMsg)
        addNewMessageToChatCache(newMsg)
      }

      const { data } = await axios.post(`${serverURL}/api/upload/message`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${sessionToken}`
        }
      })

      const newUrls = data.urls as S3UploadResponse[]
      await Promise.all(
        newUrls.map(async (_, id) => {
          const message = newMessagesStack[id]
          message.content = newUrls[id].key
          await sendMessageMutation.mutateAsync(message)
        })
      )
      formData.delete("images")
      setTrackFiles([])
    },
    [
      inputImages,
      clearImagesInput,
      createNewMessage,
      addNewMessageToChatCache,
      formData,
      sessionToken,
      sendMessageMutation
    ]
  )

  const sendMessage = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (chatroom && user) {
        const { chatroom_id } = chatroom
        const message = inputMessages.get(chatroom_id)
        const images = inputImages.get(chatroom_id)
        if (message) {
          await sendTextMessage(message, chatroom_id)
        }
        if (images && images.length > 0) {
          await sendImageMessage(chatroom_id)
        }
      }
    },
    [inputImages, user, sendImageMessage, inputMessages, sendTextMessage, chatroom]
  )

  const selectEmoji = (e: Skin) => {
    if (chatroom) {
      const { chatroom_id } = chatroom
      const input_message = inputMessages.get(chatroom_id)
      addChatInputMessage(chatroom_id, `${input_message}${e.native}`)
    }
  }

  return {
    sendMessage,
    imageInputs,
    removeFileFromStack,
    handleFileChange,
    messageInput,
    handleInputChange,
    selectEmoji
  }
}

export default useMessageInput
