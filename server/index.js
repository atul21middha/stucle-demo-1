const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const reactWrapper = require("./react-wrapper");

const middlewares = require("./middlewares");
const { AccessToken } = require("livekit-server-sdk");

// Setting up express & must use middleware
const app = express();

/**
 * Cookie Parser
 */
app.use(cookieParser());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static(path.join(__dirname, "../build")));
}

app.get("/api/token", (req, res) => {
  const apiKey = "APIceR8UKdB2gud";
  const apiSecret = "aGOhF8vMBvY9HeOndQWjV8XmzohiEfZpXBT1TEglGPR";
  const roomName = req.query.room;
  const participantName = req.query.username;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = at.toJwt();
  console.log("access token", token);
  res.send({ token });
});

app.get("/*", reactWrapper());
app.use(middlewares.errorHandler);

// Setting up node js server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}...`));
