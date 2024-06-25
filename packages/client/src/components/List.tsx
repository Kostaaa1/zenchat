import { cn } from "../utils/utils"
import { cva, VariantProps } from "class-variance-authority"
import { FC, ReactElement, ReactNode, useState } from "react"
import RenderAvatar from "./avatar/RenderAvatar"
import { motion } from "framer-motion"
import useGeneralStore from "../stores/generalStore"

export const listVariants = cva(
  "flex cursor-pointer w-full py-2 justify-between items-center overflow-hidden whitespace-nowrap",
  {
    variants: {
      hover: {
        darker: "transition-colors duration-200 hover:bg-white hover:bg-opacity-5",
        blank: ""
      },
      padding: {
        sm: "px-2",
        md: "px-4",
        lg: "px-6"
      }
    },
    defaultVariants: {
      hover: "darker"
    }
  }
)

export interface ListProps extends VariantProps<typeof listVariants> {
  children?: ReactElement
  title?: string
  subtitle?: string | null
  image_url?: (string | null | undefined)[]
  className?: string
  onClick?: () => void
  isHoverDisabled?: boolean
  icon?: ReactNode
  isRead?: boolean
  isLoading?: boolean
  avatarSize?: "sm" | "md" | "lg" | "xl"
  isOnline?: boolean
  onIconClick?: () => void
}

const List: FC<ListProps> = ({
  onClick,
  onIconClick,
  title,
  subtitle,
  image_url,
  hover,
  className,
  children,
  padding,
  isHoverDisabled,
  icon,
  avatarSize,
  isOnline,
  isRead = true,
  isLoading = false,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const isMobile = useGeneralStore((state) => state.isMobile)
  const handleHoverList = () => {
    if (isHoverDisabled) return
    setIsHovered(!isHovered)
  }

  return (
    <>
      {!isLoading ? (
        <li
          onMouseEnter={handleHoverList}
          onMouseLeave={handleHoverList}
          className={cn(
            icon ? "relative" : null,
            listVariants({ className, hover, padding }),
            !padding ? (isMobile ? "px-4" : "px-6") : padding
          )}
          {...props}
        >
          <div className={cn("flex w-full items-center space-x-2")} onClick={onClick}>
            {children}
            {avatarSize && (
              <RenderAvatar
                avatarSize={avatarSize}
                isOnline={isOnline}
                image_urls={{
                  image_url_1: image_url?.[0],
                  image_url_2: image_url?.[1]
                }}
              />
            )}
            <div className="flex w-full flex-col text-start">
              <h3> {title} </h3>
              <p
                className={cn(
                  "w-full max-w-[256px] overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-semibold",
                  isRead ? "text-neutral-400" : "text-white"
                )}
              >
                {subtitle}
              </p>
            </div>
          </div>
          {!isMobile && icon ? (
            <motion.div
              initial={{ opacity: 0, x: 20, y: "50%" }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
              onClick={onIconClick}
              className="absolute bottom-1/2 right-6 flex translate-y-1/2 items-center rounded-full text-zinc-500"
            >
              {icon}
            </motion.div>
          ) : null}
        </li>
      ) : (
        <div className={cn(listVariants({ padding }))}>
          <div className="flex h-14 w-full animate-pulse items-center space-x-2">
            <div className="h-full w-14 overflow-hidden rounded-full bg-neutral-800"></div>
            <div className="flex h-full w-1/3 flex-col justify-center">
              <div className="mb-2 h-4 w-full rounded-lg bg-neutral-800"></div>
              <div className="h-4 w-64 rounded-lg bg-neutral-800"></div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default List
