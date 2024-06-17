import Button from "../../../components/Button";
import { useParams } from "react-router-dom";
import { trpc } from "../../../lib/trpcClient";
import useUser from "../../../hooks/useUser";
import Avatar from "../../../components/avatar/Avatar";
import usePeerConnection from "../../../stores/peerConnection";
import { useEffect } from "react";
import useWebRTC from "../../../hooks/useWebRTC";

const RTCVoiceCall = () => {
  const { userData } = useUser();
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const { startCall, createOfferAndListenICE, cleanUp, peerConnection } =
    useWebRTC();
  const { isCalling, isCallAccepted } = usePeerConnection((state) => ({
    isCalling: state.isCalling,
    // peerConnection: state.peerConnection,
    isCallAccepted: state.isCallAccepted,
  }));

  const { data: chatroomUsers, isLoading } =
    trpc.chat.get.chatroom_users.useQuery(chatroomId!, {
      enabled: !!chatroomId,
      refetchOnMount: true,
    });

  useEffect(() => {
    if (isCalling && isCallAccepted && chatroomUsers && chatroomId) {
      const receivers = chatroomUsers.map((x) => x.user_id);
      createOfferAndListenICE(receivers, chatroomId);
    }
  }, [isCalling, isCallAccepted, chatroomUsers, chatroomId]);

  useEffect(() => {
    return () => {
      console.log("You left the CALL page. Cleaning up...");
      cleanUp();
    };
  }, [cleanUp]);

  return (
    <div className="flex h-[100svh] w-screen flex-col items-center justify-center">
      {isLoading || !userData || !chatroomId || !chatroomUsers ? (
        <div>Loading...</div>
      ) : (
        <>
          {!peerConnection && !isCallAccepted && (
            <div className="flex flex-col items-center space-x-2 space-y-2">
              {chatroomUsers?.map((user) => (
                <div key={user.user_id}>
                  {user.user_id !== userData.id && (
                    <Avatar
                      image_url={user.image_url}
                      className="mb-4 h-20 w-20"
                    />
                  )}
                </div>
              ))}
              <p>{isCalling ? "Calling..." : "Ready to call?"}</p>
              {!isCallAccepted && !isCalling && (
                <Button
                  buttonColor="blue"
                  onClick={() =>
                    startCall({
                      chatroomId,
                      receivers: chatroomUsers.map((user) => user.user_id),
                    })
                  }
                >
                  Start Call
                </Button>
              )}
            </div>
          )}
        </>
      )}
      {peerConnection && (
        <div className="outline">
          <div className="space-y-2">
            <video id="local" autoPlay muted width={250} height={250} />
            <video id="remote" autoPlay width={250} height={250} />
          </div>
          <div>
            <Button buttonColor="danger" onClick={cleanUp}>
              Hang up
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RTCVoiceCall;
