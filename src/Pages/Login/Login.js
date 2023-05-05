import { PreJoin } from "@livekit/components-react";
import { dummyData } from "../../utils/dummyData";
import { useUserContext } from "../../utils/UserContext";
import "./styles.css";

const Login = () => {
  const { setUser } = useUserContext();

  const onSubmit = async (values) => {
    const validUser = dummyData.find((user) => user.id === values.username);
    if (!validUser) return alert("invalid user");
    try {
      let data = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/token?room=stucle&username=${values.username}`,
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      data = await data.json();
      if (data.token) {
        setUser({ ...validUser, metadata: values, token: data.token });
      }
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
