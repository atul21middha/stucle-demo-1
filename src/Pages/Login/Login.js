import { PreJoin } from "@livekit/components-react";
// import { useParams } from "react-router-dom";
import { dummyData } from "../../utils/dummyData";
import { useUserContext } from "../../utils/UserContext";
import "./styles.css";

const Login = () => {
  const { setUser, setToken } = useUserContext();
  // const { roomName } = useParams();

  const onSubmit = async (values) => {
    const validUser = dummyData.find((user) => user.id === values.username);
    if (!validUser) return alert("invalid user");
    try {
      let data = await fetch(
        `/api/token?room=stucle&username=${values.username}`
      );
      data = await data.json();
      if (data.token) {
        setToken(data.token);
      }
      setUser({ ...validUser, metadata: values });
    } catch (e) {
      console.log("e", e);
    }
  };

  return (
    <div className="root" data-lk-theme="default">
      <div className="container">
        <PreJoin
          onError={(err) => console.log("error while setting up prejoin", err)}
          defaults={{
            username: "",
            videoEnabled: true,
            audioEnabled: false,
          }}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};

export default Login;
