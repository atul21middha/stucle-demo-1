import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useUserContext } from "../../utils/UserContext";
import { dummyData } from "../../utils/dummyData";

const AddPeersModal = ({ show, handleModal }) => {
  const { user, setUser } = useUserContext();
  const peerOptions = dummyData.filter((item) => item.id !== user.id);
  const [selected, setSelected] = useState([]);

  const onChange = (e) => {
    const { checked, value } = e?.target;
    if (checked) {
      setSelected((old) => [...old, value]);
    } else {
      setSelected((old) => old.filter((item) => item !== value));
    }
  };

  const onSubmit = () => {
    setUser((old) => ({ ...old, peers: [...old.peers, ...selected] }));
    handleModal();
  };

  return (
    <>
      <Modal show={show} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Peers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {peerOptions.map((peer) => (
              <div className="p-2 peerOptions" key={peer.id}>
                <input
                  type="checkbox"
                  id={peer.id}
                  name="peer"
                  value={peer.id}
                  checked={!!selected.find((item) => item === peer.id)}
                  onChange={onChange}
                  disabled={user.peers.includes(peer.id)}
                  className="checkBox"
                />
                <label htmlFor="peer">{peer.name}</label>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={!selected.length}
          >
            Add Peers
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddPeersModal;
