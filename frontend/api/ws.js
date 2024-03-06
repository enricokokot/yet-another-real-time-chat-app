const handleOpeningWebSocket = (
  currentUserUsername,
  setInbox,
  users,
  setUnknownInInbox
) => {
  const ws = new WebSocket("ws://localhost:8010/ws");

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
    if (
      !users.map((user) => user.id).includes(JSON.parse(e.data).data.fromId)
    ) {
      setUnknownInInbox((prev) => !prev);
    }
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
