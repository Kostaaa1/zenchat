import { trpc } from "../lib/trpcClient"
import useGeneralStore from "../stores/generalStore"
import { useEffect, useState } from "react"
import { useAuth } from "@clerk/clerk-react"

const useUser = () => {
  const username = useGeneralStore((state) => state.username)
  const { getToken } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const utils = trpc.useUtils()

  const userData = utils.user.get.getData({
    data: username!,
    type: "username"
  })

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getToken()
      setToken(fetchedToken)
    }
    fetchToken()
  }, [])

  const updateUser = ({ username, newFields }: { username: string; newFields: Partial<typeof userData> }) => {
    utils.user.get.setData({ data: username, type: "username" }, (state) => {
      return state ? { ...state, ...newFields } : state
    })
  }

  return {
    userData,
    token,
    updateUser
  }
}

export default useUser
