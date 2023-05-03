import "react-aspect-ratio/aspect-ratio.css";
import { useUserContext } from "./utils/UserContext";
import Login from "./Pages/Login";
import ConferenceRoom from "./Pages/ConferenceRoom";

const RoomPage = () => {
  const { user, token } = useUserContext();
  return <>{!(user && token) ? <Login /> : <ConferenceRoom />}</>;
};

export default RoomPage;
