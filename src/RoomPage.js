import "react-aspect-ratio/aspect-ratio.css";
import { useUserContext } from "./utils/UserContext";
import Login from "./Pages/Login";
import ConferenceRoom from "./Pages/ConferenceRoom";

const RoomPage = () => {
  const { user } = useUserContext();
  return <>{!user ? <Login /> : <ConferenceRoom />}</>;
};

export default RoomPage;
