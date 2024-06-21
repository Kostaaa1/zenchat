import { create } from "zustand"
import { TMessage, TPost } from "../../../server/src/types/types"
import { SocketCallPayload } from "../../../server/src/types/sockets"

type TModalOptions = {
  id: number
  child: JSX.Element
  condition: boolean
  onClick?: () => void | Promise<void>
  className?: string
}

type Modals =
  | "image"
  | "editprofile"
  | "newmessage"
  | "deletechat"
  | "uploadpost"
  | "unsendmessage"
  | "post"
  | "voiceCall"
  | "options"
  | null

type Store = {
  isModalOpen: boolean
  imageSource: string | null
  activeMessage: TMessage | null
  modalPostData: TPost | null
  isMessageDropdownActive: boolean
  isAvatarUpdating: boolean
  activeModal: Modals
  options: TModalOptions[]
  actions: {
    setOptions: (opt: TModalOptions[]) => void
    openModal: (activeModal: Modals) => void
    closeModal: () => void
    setImageSource: (src: string) => void
    setModalPostData: (s: TPost | null) => void
    setActiveMessage: (data: TMessage | null) => void
    setIsMessageDropdownActive: (isOpen: boolean) => void
    setIsAvatarUpdating: (isUpdating: boolean) => void
  }
}

const useModalStore = create<Store>(
  (set): Store => ({
    isModalOpen: false,
    activeModal: null,
    isAvatarUpdating: false,
    activeMessage: null,
    isMessageDropdownActive: false,
    imageSource: null,
    modalPostData: null,
    options: [],
    actions: {
      setOptions: (opts: TModalOptions[]) => set({ options: opts, isModalOpen: true }),
      openModal: (activeModal: Modals) => set({ isModalOpen: true, activeModal }),
      closeModal: () =>
        set((state) => {
          if (state.options.length > 0) {
            return { ...state, options: [] }
          } else {
            return {
              ...state,
              imageSource: null,
              modalPostData: null,
              isMessageDropdownActive: false,
              isAvatarUpdating: false,
              isModalOpen: false,
              activeModal: null,
              callerInfo: null,
              activeMessage: null,
              isModalOptionsOpen: false,
              options: []
            }
          }
        }),
      setImageSource: (imageSource: string) => set({ imageSource }),
      setModalPostData: (modalPostData: TPost | null) => set({ modalPostData }),
      setIsAvatarUpdating: (isUpdaing: boolean) => set({ isAvatarUpdating: isUpdaing }),
      setActiveMessage: (data: TMessage | null) => set({ activeMessage: data }),
      setIsMessageDropdownActive: (isOpen: boolean) => set({ isMessageDropdownActive: isOpen })
    }
  })
)

export default useModalStore
