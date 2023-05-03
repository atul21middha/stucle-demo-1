import {
  ParticipantLoop,
  useRemoteParticipants,
  useRoomContext,
} from "@livekit/components-react";
import {
  createLocalAudioTrack,
  DataPacket_Kind,
  RoomEvent,
} from "livekit-client";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Loader from "../../../Components/Loader";
import { STATUSES } from "../../../utils/constants";
import { dummyData } from "../../../utils/dummyData";
import { useUserContext } from "../../../utils/UserContext";
import AddPeersModal from "../AddPeersModal";
import IncomingCallModal from "../IncomingCallModal";
import Header from "./Header";
import LoggedOffPeer from "./LoggedOffPeer";
import Participant from "./Participant";

const Participants = () => {
  const room = useRoomContext();
  const participants = useRemoteParticipants({ room });
  const { user, setUser } = useUserContext();
  const [showPeersModal, setShowPeersModal] = useState(false);
  const [incomingCallFrom, setIncomingCallFrom] = useState(null);
  const { localParticipant } = room;
  const [remoteParticipant, setRemoteParticipant] = useState(null);

  // to publish the audio track once the remote user has accepted the huddle
  useEffect(() => {
    if (remoteParticipant) {
      onPublishTrack(remoteParticipant);
      setRemoteParticipant(null);
    }
  }, [remoteParticipant]);

  useEffect(() => {
    // this is called when remote user unpublishes a track
    room.on("trackSubscriptionStatusChanged", (track, status) => {
      if (track.kind === "audio" && status !== "subscribed") {
        setIncomingCallFrom(null);
        onUnpublishTrack();
      }
    });
  }, []);

  useEffect(() => {
    //To communicate between the participants
    const decoder = new TextDecoder();
    room.on(RoomEvent.DataReceived, (payload, participant, kind) => {
      const data = JSON.parse(decoder.decode(payload));
      //message when a user starts huddle
      if (data.connection === STATUSES.DESIRED) {
        if (user.peers.includes(participant.identity)) {
          setIncomingCallFrom(participant);
          notifyUsers(STATUSES.BUSY);
        } else {
          sendMessageToParticipant(participant, STATUSES.NO_RESPONSE);
        }
      }
      //message when remote user accepts the huddle request
      if (data.connection === STATUSES.CONNECTED) {
        setRemoteParticipant(participant);
      }
      //message when user gives no response to huddle
      if (data.connection === STATUSES.NO_RESPONSE) {
        onUnpublishTrack();
      }
      if (data.connection === STATUSES.REJECTED) {
        notifyUsers(STATUSES.AVAILABLE);
        setUser((old) => ({ ...old, huddle: null }));
      }
    });
  }, []);

  useEffect(() => {
    //if user disconnects from room in between a huddle call
    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      if (
        user.huddle?.to === participant.identity ||
        user.huddle?.peer === participant.identity
      ) {
        notifyUsers(STATUSES.AVAILABLE);
        if (participant.identity === incomingCallFrom.identity)
          setIncomingCallFrom(null);
        if (localParticipant.audioTracks.size > 0) {
          onUnpublishTrack();
        } else {
          setUser((old) => ({ ...old, huddle: null }));
        }
      }
    });
  }, []);

  const togglePeersModal = () => setShowPeersModal((old) => !old);

  const onUnpublishTrack = async () => {
    let audioTrack = null;
    localParticipant.audioTracks.forEach((track) => {
      if (!audioTrack) audioTrack = track.track;
    });
    //unpublish track
    if (audioTrack) {
      await localParticipant.unpublishTrack(audioTrack);
    }
    setUser((old) => ({ ...old, huddle: null }));
    notifyUsers(STATUSES.AVAILABLE);
  };

  const onRemovePeer = (selected) => {
    setUser((old) => ({
      ...old,
      peers: old.peers.filter((peer) => peer !== selected),
    }));
  };

  //to send message to all participants
  const notifyUsers = (status) => {
    const strData = JSON.stringify({ connection: status });
    const encoder = new TextEncoder();
    const data = encoder.encode(strData);
    localParticipant.publishData(data, DataPacket_Kind.LOSSY);
  };

  const sendMessageToParticipant = (participant, status) => {
    const strData = JSON.stringify({ connection: status });
    const encoder = new TextEncoder();
    const data = encoder.encode(strData);
    // publish reliable data to a set of participants
    room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE, [
      participant.sid,
    ]);
  };

  //function called on clicking start huddle
  const onStartHuddle = (participant) => {
    setUser((old) => ({ ...old, huddle: { to: participant.identity } }));
    sendMessageToParticipant(participant, STATUSES.DESIRED);
    notifyUsers(STATUSES.BUSY);
  };

  //function called to publish audio track
  const onPublishTrack = async (participant, type) => {
    const audioTrack = await createLocalAudioTrack({
      echoCancellation: true,
      noiseSuppression: true,
    });
    localParticipant.publishTrack(audioTrack).then((res) => {
      notifyUsers(STATUSES.BUSY);
      setUser((old) => ({
        ...old,
        huddle: {
          ...old.huddle,
          peer: participant.identity,
          status: "connected",
        },
      }));
      let videoTrack = "";
      let audioTrack = "";
      localParticipant.tracks.forEach((track) => {
        if (track.kind === "video") {
          videoTrack = track.trackSid;
        }
        if (track.kind === "audio") {
          audioTrack = track.trackSid;
        }
      });
      let permissions = [];
      dummyData.forEach((peer) => {
        permissions.push({
          participantIdentity: peer.id,
          allowedTrackSids:
            peer.id === participant.identity
              ? [audioTrack, videoTrack]
              : [videoTrack],
        });
      });
      localParticipant.setTrackSubscriptionPermissions(false, permissions);
      if (type === "incoming") {
        sendMessageToParticipant(incomingCallFrom, "connected");
        setIncomingCallFrom(null);
      }
    });
  };

  const loggedInUsers = [];
  let loggedOffUsers = [];
  if (participants.length) {
    participants.forEach((participant) => {
      if (user.peers.includes(participant.identity)) {
        loggedInUsers.push(participant);
      }
    });
  }
  loggedOffUsers = user.peers.filter(
    (peer) => !!!loggedInUsers.find((item) => item.identity === peer)
  );

  return (
    <>
      {room?.state === "connected" ? (
        <>
          <Header />
          <div className="participantsList">
            <div className="participantsContainer">
              <ParticipantLoop participants={loggedInUsers || []}>
                <Participant
                  onRemovePeer={onRemovePeer}
                  startHuddleCall={onStartHuddle}
                  onUnpublishTrack={onUnpublishTrack}
                />
              </ParticipantLoop>
              {(loggedOffUsers || []).map((user) => (
                <LoggedOffPeer
                  key={user}
                  peer={user}
                  onRemovePeer={onRemovePeer}
                />
              ))}
            </div>
          </div>
          {![...loggedInUsers, ...loggedOffUsers].length && (
            <>
              <div className="texAlign">
                <h5>Seems like you don't have any peer, Start adding now</h5>
                <Button onClick={togglePeersModal}>Add Peers</Button>
              </div>
            </>
          )}
        </>
      ) : (
        <Loader />
      )}
      {showPeersModal && (
        <AddPeersModal show={showPeersModal} handleModal={togglePeersModal} />
      )}
      {!!incomingCallFrom && (
        <IncomingCallModal
          show={!!incomingCallFrom}
          handleModal={() => setIncomingCallFrom(null)}
          onAccept={() => {
            onPublishTrack(incomingCallFrom, "incoming");
          }}
          incomingCallFrom={incomingCallFrom}
          sendMessageToParticipant={sendMessageToParticipant}
          notifyUsers={notifyUsers}
        />
      )}
    </>
  );
};

export default Participants;
