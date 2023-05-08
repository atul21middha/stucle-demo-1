import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ParticipantContext,
  ParticipantTile,
  TrackToggle,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useContext, useEffect, useState } from "react";
import { useUserContext } from "../../../utils/UserContext";

const Participant = ({ onRemovePeer, startHuddleCall, onUnpublishTrack }) => {
  const participant = useContext(ParticipantContext);
  const { user } = useUserContext();
  const [showButtons, setShowButtons] = useState(false);

  const handleShowButtons = () => setShowButtons((old) => !old);

  const isAudioTrackPublished = participant.audioTracks.size !== 0;

  const isParticipantConnected =
    user.huddle?.peer === participant.identity &&
    user.huddle?.status === "connected";

  const getBgColor = () => {
    if (isParticipantConnected) {
      return "green";
    } else if (isAudioTrackPublished) {
      return "orange";
    } else {
      return "yellow";
    }
  };

  const onClickHuddleButton = () => {
    if (isParticipantConnected) {
      onUnpublishTrack();
    } else {
      startHuddleCall(participant);
    }
  };

  useEffect(() => {
    const indicator = document.getElementsByClassName(
      "lk-track-muted-indicator-microphone"
    );
    if (indicator?.[0]) {
      indicator[0].setAttribute("class", "hide");
    }
  });

  const isHuddleButtonDeactivated =
    !isParticipantConnected && (!!user.huddle || isAudioTrackPublished);

  return (
    <div
      className="participantRoot"
      onMouseEnter={handleShowButtons}
      onMouseLeave={handleShowButtons}
    >
      <div
        className="participantTile"
        style={{
          borderColor: getBgColor(),
        }}
      >
        <ParticipantTile
          participant={participant}
          className="participantVideo"
          disableSpeakingIndicator
        />
      </div>
      {showButtons && (
        <div className="buttons">
          <div
            className={`iconButton ${
              isHuddleButtonDeactivated ? "disabled" : ""
            }`}
            style={{
              backgroundColor: isParticipantConnected
                ? "red"
                : isHuddleButtonDeactivated
                ? "#888888"
                : "#0D6EFD",
            }}
            onClick={() => {
              if (!isHuddleButtonDeactivated) onClickHuddleButton();
            }}
            disabled={isHuddleButtonDeactivated}
          >
            <FontAwesomeIcon icon="fa-solid fa-phone" />
          </div>
          {!isParticipantConnected && (
            <div
              className="iconButton"
              style={{
                backgroundColor: "red",
              }}
              onClick={() => onRemovePeer(participant.identity)}
              disabled={isHuddleButtonDeactivated}
            >
              <FontAwesomeIcon icon="fa-solid fa-user-xmark" />
            </div>
          )}
          {isParticipantConnected ? (
            <TrackToggle
              source={Track.Source.Microphone}
              style={{ height: 30 }}
            ></TrackToggle>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Participant;
