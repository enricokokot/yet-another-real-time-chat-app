const handleOpeningWebSocket = (currentUserUsername, setInbox) => {
  const ws = new WebSocket("ws://localhost:80/ws");

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

  ws.onclose = (e) => {
    console.log("connection closed");
    console.log(e.code, e.reason);
  };
  return ws;
};

export default handleOpeningWebSocket;
