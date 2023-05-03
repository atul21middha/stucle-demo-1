const path = require("path");

const prodReactWrapper = (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  return res.sendFile(path.join(__dirname, "../build/index.html"), {
    lastModified: false,
    cacheControl: false,
  });
};

const reactWrapper = () => {
  if (process.env.NODE_ENV === "production") return prodReactWrapper;

  // development server related code
  const proxy = require("express-http-proxy");
  return proxy("http://localhost:3001");
};

module.exports = reactWrapper;
