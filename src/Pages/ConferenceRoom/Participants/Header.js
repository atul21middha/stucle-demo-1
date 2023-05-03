import { TrackToggle, useRoomContext } from "@livekit/components-react";
import { useParticipant, VideoRenderer } from "@livekit/react-components";
import { Track } from "livekit-client";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { useUserContext } from "../../../utils/UserContext";
import AddPeersModal from "../AddPeersModal";

const Header = () => {
  const [showPeersModal, setShowPeersModal] = useState(false);
  const room = useRoomContext();
  const { user, setUser, setToken } = useUserContext();
  const { localParticipant } = room;
  const { isLocal, cameraPublication } = useParticipant(localParticipant);

  const togglePeersModal = () => setShowPeersModal((old) => !old);

  const onDisconnect = () => {
    room.disconnect();
    setUser(null);
    setToken(null);
  };

  return (
    <div className="header">
      <div>
        <h3>Welcome {user.name}</h3>
        <h5>
          Start or stop your video streaming from the button below your video.
        </h5>
      </div>
      <div className="rightToolbar">
        <div>
          <Button onClick={togglePeersModal}>Add Peers</Button>
        </div>
        <div>
          <Button onClick={onDisconnect} variant="danger">
            Disconnect
          </Button>
        </div>
        {cameraPublication ? (
          cameraPublication?.isMuted ? (
            <div>
              <TrackToggle source={Track.Source.Camera}>
                Resume Streaming
              </TrackToggle>
            </div>
          ) : (
            <div class="selfVideo">
              <VideoRenderer
                track={cameraPublication?.track}
                isLocal={isLocal}
                width={150}
                height={90}
              />
              <TrackToggle source={Track.Source.Camera} style={{ height: 30 }}>
                Camera
              </TrackToggle>
            </div>
          )
        ) : null}
      </div>
      {showPeersModal && (
        <AddPeersModal show={showPeersModal} handleModal={togglePeersModal} />
      )}
    </div>
  );
};

export default Header;
