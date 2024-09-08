import handleConnect from "../api/connect";

const handleOpeningWebSocket = (
  port,
  currentUserUsername,
  setInbox,
  setPort
) => {
  const ws = new WebSocket(`ws://localhost:${port}/ws`);

  ws.onopen = () => {
    console.log("connection opened");
    const theObject = {
      type: "connection",
      data: {
        user: currentUserUsername,
      },
    };
    ws.send(JSON.stringify(theObject));
  };

  ws.onmessage = (e) => {
    console.log("a message was received");
    setInbox((prev) => [...prev, JSON.parse(e.data)]);
    console.log(e.data);
  };

  ws.onerror = (e) => {
    console.log("an error occurred");
    console.log(e.message);
  };

  ws.onclose = async (e) => {
    console.log("connection closed");
    console.log(e.code, e.reason);
    setTimeout(async () => {
      let oldPort = port;
      let newPort = port;
      while (newPort === oldPort) {
        newPort = await handleConnect();
        newPort = parseInt(newPort);
      }
      console.log("Debug: port:", newPort);
      setPort(parseInt(newPort));
    }, 1000);
  };
  return ws;
};

export default handleOpeningWebSocket;
