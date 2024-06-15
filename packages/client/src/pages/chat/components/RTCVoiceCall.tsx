import Button from "../../../components/Button";
import { socket } from "../../../lib/socket";
import { useParams } from "react-router-dom";
import { trpc } from "../../../lib/trpcClient";
import useUser from "../../../hooks/useUser";
import Avatar from "../../../components/avatar/Avatar";
import usePeerConnection from "../../../stores/peerConnection";

const RTCVoiceCall = () => {
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const { setPeerConnection } = usePeerConnection((state) => state.actions);
  const { userData } = useUser();
  const { data: chatroomUsers, isLoading } =
    trpc.chat.get.chatroom_users.useQuery(chatroomId!, {
      enabled: !!chatroomId,
      refetchOnMount: true,
    });

  const makeCall = async () => {
    if (!chatroomId || !userData || !chatroomUsers) return;
    const receivers = chatroomUsers.map((x) => x.user_id);

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun1.l.google.com:19302",
        },
      ],
    });
    setPeerConnection(peerConnection);

    ////////////
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    localStream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, localStream));
    const audioElement = document.getElementById("local");
    if (audioElement) {
      const el = audioElement as HTMLAudioElement;
      el.srcObject = localStream;
    }
    ////////////////

    peerConnection.onicecandidate = (ev) => {
      if (ev.candidate) {
        console.log("Received candidate should send via socket", ev);
        socket.emit("ice", {
          caller: userData.id,
          candidate: ev.candidate,
          receivers,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log("received remote track: ", event.streams);
      const remoteAudio = document.getElementById("remote");
      if (remoteAudio) {
        const el = remoteAudio as HTMLAudioElement;
        el.srcObject = event.streams[0];
      }
    };

    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    });
    await peerConnection.setLocalDescription(offer);

    socket.emit("offer", {
      chatroomId,
      offer,
      caller: userData.id,
      receivers,
    });
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      {isLoading || !userData ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col items-center space-x-2 space-y-2">
          {chatroomUsers?.map((user) => (
            <div key={user.user_id}>
              {user.user_id !== userData.id && (
                <Avatar image_url={user.image_url} className="mb-4 h-20 w-20" />
              )}
            </div>
          ))}
          <p>Ready to call?</p>
          <Button buttonColor="blue" onClick={makeCall}>
            Call
          </Button>
        </div>
      )}
    </div>
  );
};

export default RTCVoiceCall;
