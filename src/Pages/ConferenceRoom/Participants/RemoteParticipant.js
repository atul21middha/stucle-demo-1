import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ParticipantTile, TrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";

const RemoteParticipant = ({
  startHuddleCall,
  onUnpublishTrack,
  remoteParticipant,
}) => {
  const [showButtons, setShowButtons] = useState(false);

  const handleShowButtons = () => setShowButtons((old) => !old);

  const onClickHuddleButton = () => {
    onUnpublishTrack();
  };

  useEffect(() => {
    const indicator = document.getElementsByClassName(
      "lk-track-muted-indicator-microphone"
    );
    if (indicator?.[0]) {
      indicator[0].setAttribute("class", "hide");
    }
  });

  return (
    <div
      className="participantRoot"
      onMouseEnter={handleShowButtons}
      onMouseLeave={handleShowButtons}
    >
      <div
        className="participantTile"
        style={{
          borderColor: "green",
        }}
      >
        <ParticipantTile
          participant={remoteParticipant}
          className="participantVideo"
          disableSpeakingIndicator
        />
      </div>
      {showButtons && (
        <div className="buttons">
          <div
            className={`iconButton`}
            style={{
              backgroundColor: "red",
            }}
            onClick={() => {
              onClickHuddleButton();
            }}
          >
            <FontAwesomeIcon icon="fa-solid fa-phone" />
          </div>

          <TrackToggle
            source={Track.Source.Microphone}
            style={{ height: 30 }}
          ></TrackToggle>
        </div>
      )}
    </div>
  );
};

export default RemoteParticipant;
