import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { useUserContext } from "../../utils/UserContext";
import Participants from "./Participants";
import "./styles.css";

const ConferenceRoom = () => {
  const { token, user } = useUserContext();
  return (
    <div>
      <LiveKitRoom
        token={token}
        serverUrl={process.env.REACT_APP_SERVER_URL}
        connect={true}
        video={true}
        style={{ height: "100%", minHeight: "100vh" }}
      >
        <Participants />
        {user?.huddle?.status === "connected" && <RoomAudioRenderer />}
      </LiveKitRoom>
    </div>
  );
};

export default ConferenceRoom;
