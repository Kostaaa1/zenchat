import { forwardRef } from "react"
import useGeneralStore from "../stores/generalStore"

type VideoProps = {
  media_url: string
  type?: string
  autoPlay?: boolean
  poster?: string | null
  controls?: boolean
  className?: string
}

const Video = forwardRef<HTMLVideoElement, VideoProps>(
  ({ media_url, type, poster, autoPlay = true, controls = true, className }, ref) => {
    const volume = useGeneralStore((state) => state.volume)
    const { setVolume } = useGeneralStore((state) => state.actions)
    return (
      <video
        ref={ref}
        loop
        key={media_url}
        className={className}
        poster={poster ?? ""}
        autoPlay={autoPlay}
        controls={controls}
        onLoadStart={(e) => (e.currentTarget.volume = volume)}
        onVolumeChangeCapture={(e) => setVolume(e.currentTarget.volume)}
        onLoadedData={(e) => {
          if (autoPlay) e.currentTarget.play()
        }}
      >
        <source src={media_url} type={type ?? "video/mp4"} />
      </video>
    )
  }
)

export default Video
