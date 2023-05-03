import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ParticipantPlaceholder from "../../../Components/Placeholder";

const LoggedOffPeer = ({ peer, onRemovePeer }) => {
  return (
    <div className="participantRoot">
      <div className="loggedOffUser">
        <ParticipantPlaceholder />
      </div>
      <div className="loggedOffUserName">
        <h6>{peer}</h6>
      </div>

      <div className="removeButton">
        <div
          className="iconButton"
          style={{
            backgroundColor: "red",
          }}
          onClick={() => onRemovePeer(peer)}
        >
          <FontAwesomeIcon icon="fa-solid fa-user-xmark" />
        </div>
      </div>
    </div>
  );
};

export default LoggedOffPeer;
