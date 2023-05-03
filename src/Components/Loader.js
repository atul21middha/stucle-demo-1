import { Spinner } from "react-bootstrap";

export const Loader = () => {
  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
        }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    </div>
  );
};

export default Loader;
