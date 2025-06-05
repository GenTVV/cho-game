const socket = new WebSocket("ws://localhost:3000"); // для Render будет wss://...

socket.onopen = () => {
  const nickname = prompt("Твой ник:");
  const stats = {
    level: localStorage.getItem("level"),
    xp: localStorage.getItem("xp"),
    morale: localStorage.getItem("morale")
  };
  socket.send(JSON.stringify({
    type: "hello",
    nickname,
    stats
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "playerJoined") {
    console.log(`${data.nickname} зашел в игру. Статистика:`, data.stats);
    // Тут можно обновить интерфейс: добавить в список игроков и т.п.
  }
};