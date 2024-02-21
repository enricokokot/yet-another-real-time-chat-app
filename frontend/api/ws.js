const handleOpeningWebSocket = (currentUserUsername) => {
  const ws = new WebSocket("ws://localhost:8010/ws");

  ws.onopen = () => {
    console.log("connection opened");
    ws.send(`connection opened by ${currentUserUsername}`);
  };

  ws.onmessage = (e) => {
    console.log("a message was received");
    console.log(e.data);
  };

  ws.onerror = (e) => {
    console.log("an error occurred");
    console.log(e.message);
  };

  ws.onclose = (e) => {
    console.log("connection closed");
    console.log(e.code, e.reason);
  };
  return ws;
};

export default handleOpeningWebSocket;
