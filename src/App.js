import "@livekit/react-components/dist/index.css";
import "./App.css";
import "@livekit/components-styles";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RoomPage from "./RoomPage";
import { UserContextProvider } from "./utils/UserContext";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);

function App() {
  return (
    <div data-lk-theme="default">
      <BrowserRouter>
        <UserContextProvider>
          <Routes>
            <Route path="/room/:roomName" element={<RoomPage />} />
          </Routes>
        </UserContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
