import { Button, Modal } from "react-bootstrap";
import { useEffect, useRef } from "react";
import { STATUSES } from "../../utils/constants";

const IncomingCallModal = ({
  show,
  handleModal,
  onAccept,
  incomingCallFrom,
  sendMessageToParticipant,
  notifyUsers,
}) => {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current.play();
  }, []);

  useEffect(() => {
    let timer = setTimeout(() => {
      sendMessageToParticipant(incomingCallFrom, STATUSES.NO_RESPONSE);
      handleModal();
    }, 20000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const onReject = () => {
    sendMessageToParticipant(incomingCallFrom, STATUSES.REJECTED);
    handleModal();
    notifyUsers(STATUSES.AVAILABLE);
  };

  return (
    <>
      <Modal show={show} onHide={handleModal}>
        <Modal.Header>
          <Modal.Title>
            Incoming Call from {incomingCallFrom.identity}
          </Modal.Title>
        </Modal.Header>

        <audio ref={audioRef} autoPlay>
          <source
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            type="audio/mp3"
          />
        </audio>

        <Modal.Footer>
          <Button variant="secondary" onClick={onReject}>
            Reject
          </Button>
          <Button variant="primary" onClick={onAccept}>
            Accept
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default IncomingCallModal;
