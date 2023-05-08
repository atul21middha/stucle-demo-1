import {
  ParticipantLoop,
  useRemoteParticipants,
  useRoomContext,
} from "@livekit/components-react";
import { createLocalAudioTrack, RoomEvent } from "livekit-client";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Loader from "../../../Components/Loader";
import { dummyData } from "../../../utils/dummyData";
import { useUserContext } from "../../../utils/UserContext";
import AddPeersModal from "../AddPeersModal";
import Header from "./Header";
import LoggedOffPeer from "./LoggedOffPeer";
import Participant from "./Participant";
import RemoteParticipant from "./RemoteParticipant";

const Participants = () => {
  const room = useRoomContext();
  const participants = useRemoteParticipants({ room });
  const { user, setUser } = useUserContext();
  const [showPeersModal, setShowPeersModal] = useState(false);
  const { localParticipant } = room;
  const [incomingCallFrom, setIncomingCallFrom] = useState(null);

  // to publish the audio track once the remote user has accepted the huddle
  useEffect(() => {
    if (incomingCallFrom) {
      onPublishTrack(incomingCallFrom);
    }
  }, [incomingCallFrom]);

  useEffect(() => {
    // this is called when remote user unpublishes a track
    room.on("trackSubscriptionStatusChanged", (track, status, participant) => {
      if (track.kind === "audio") {
        if (status !== "subscribed") {
          onUnpublishTrack();
        }
        if (status === "subscribed") {
          if (localParticipant.audioTracks.size === 0) {
            setIncomingCallFrom(participant);
          }
        }
      }
    });
  }, [room]);

  useEffect(() => {
    //if user disconnects from room in between a huddle call
    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      if (user.huddle?.peer === participant.identity) {
        if (localParticipant.audioTracks.size > 0) {
          onUnpublishTrack();
        } else {
          setUser((old) => ({ ...old, huddle: null }));
        }
      }
    });
  }, [user]);

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
    setIncomingCallFrom(null);
    setUser((old) => ({ ...old, huddle: null }));
  };

  const onRemovePeer = (selected) => {
    setUser((old) => ({
      ...old,
      peers: old?.peers?.filter((peer) => peer !== selected),
    }));
  };

  //function called on clicking start huddle
  const onStartHuddle = (participant) => {
    onPublishTrack(participant);
  };

  //function called to publish audio track
  const onPublishTrack = async (participant, type) => {
    const audioTrack = await createLocalAudioTrack({
      echoCancellation: true,
      noiseSuppression: true,
    });
    localParticipant.publishTrack(audioTrack).then((res) => {
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
  loggedOffUsers = user?.peers?.filter(
    (peer) => !!!loggedInUsers.find((item) => item.identity === peer)
  );

  //checking if the huddle partner is a peer or not
  let isCallerPeer = loggedInUsers.find(
    (user) => user.identity === incomingCallFrom?.identity
  );

  //this is to show the participant tile when participant is not peer
  const showRemoteUser = incomingCallFrom && !!!isCallerPeer && user.huddle;

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
              {showRemoteUser && (
                <RemoteParticipant
                  onRemovePeer={onRemovePeer}
                  startHuddleCall={onStartHuddle}
                  onUnpublishTrack={onUnpublishTrack}
                  remoteParticipant={incomingCallFrom}
                />
              )}
              {(loggedOffUsers || []).map((user) => (
                <LoggedOffPeer
                  key={user}
                  peer={user}
                  onRemovePeer={onRemovePeer}
                />
              ))}
            </div>
          </div>
          {![...loggedInUsers, ...loggedOffUsers].length && !showRemoteUser && (
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
    </>
  );
};

export default Participants;
