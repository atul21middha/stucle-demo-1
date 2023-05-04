import "@livekit/react-components/dist/index.css";
import "./App.css";
import "@livekit/components-styles";
import RoomPage from "./RoomPage";
import { UserContextProvider } from "./utils/UserContext";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);

function App() {
  return (
    <div data-lk-theme="default">
      <UserContextProvider>
        <RoomPage />
      </UserContextProvider>
    </div>
  );
}

export default App;
