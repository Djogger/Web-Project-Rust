// JavaScript source code

let roomListDiv = document.getElementById('room-list');
let messagesDiv = document.getElementById('messages');
let newMessageForm = document.getElementById('new-message');
let newRoomForm = document.getElementById('new-room');
let statusDiv = document.getElementById('status');

let roomTemplate = document.getElementById('room');
let messageTemplate = document.getElementById('message');

let messageField = newMessageForm.querySelector("#message");
let usernameField = newMessageForm.querySelector("#username");
let roomNameField = newRoomForm.querySelector("#name");

var STATE = {
  room: "lobby",
  rooms: {},
  connected: false,
}

// Add a new room `name` and change to it. Returns `true` if the room didn't
// already exist and false otherwise.
function addRoom(name) {
  if (STATE[name]) {
    changeRoom(name);
    return false;
  }

  var node = roomTemplate.content.cloneNode(true); // Метод cloneNode(true) создает глубокую копию содержимого шаблона, включая все его дочерние элементы.
  var room = node.querySelector(".room"); //  находит первый элемент с классом "room" внутри склонированного узла node. 
  // Это позволяет получить доступ к элементу комнаты в скопированной разметке.
  room.addEventListener("click", () => changeRoom(name));
  room.textContent = name; // связано с переключением комнат (Отображение названия Комнат)
  room.dataset.name = name; // связано с переключением комнат (Переход в Комнату)
  roomListDiv.appendChild(node); /* Метод строки кода roomListDiv.appendChild(node); добавляет склонированный 
  узел node внутри элемента roomListDiv. Это позволяет отобразить комнату в пользовательском интерфейсе, добавляя ее в список комнат.*/

  STATE[name] = [];
  changeRoom(name);
  return true;
}

// Change the current room to `name`, restoring its messages.
function changeRoom(name) {
  if (STATE.room == name) return;

  var newRoom = roomListDiv.querySelector(`.room[data-name='${name}']`); // data-name -- это необязательное название переменной. (Но все же можно заглянуть в код на странице, там в теле кода будет.)
  var oldRoom = roomListDiv.querySelector(`.room[data-name='${STATE.room}']`); /* .querySelector - это метод, который вернет первое вхождение 
  элемента (Element) документа, который соответствует указанному тегу, или селектору, или группе селекторов. 
  Если совпадений не найдено, вернет null.*/
  if (!newRoom || !oldRoom) return;

  STATE.room = name;

  messagesDiv.querySelectorAll(".message").forEach((msg) => {
    messagesDiv.removeChild(msg)
  });

  STATE[name].forEach((data) => addMessage(name, data.username, data.message))
}

// Add `message` from `username` to `room`. If `push`, then actually store the
// message. If the current room is `room`, render the message.
function addMessage(room, username, message, push = false) {
  if (push) {
    STATE[room].push({ username, message })
  }

  if (STATE.room == room) {
    var node = messageTemplate.content.cloneNode(true);
    node.querySelector(".message .username").textContent = username;
    node.querySelector(".message .text").textContent = message;
    messagesDiv.appendChild(node);
  }
}

// Subscribe to the event source at `uri` with exponential backoff reconnect.
function subscribe(uri) {
  var retryTime = 1;

  function connect(uri) {
    const events = new EventSource(uri);

    events.addEventListener("message", (ev) => {
      console.log("raw data", JSON.stringify(ev.data));
      console.log("decoded data", JSON.stringify(JSON.parse(ev.data)));
      const msg = JSON.parse(ev.data);
      if (!"message" in msg || !"room" in msg || !"username" in msg) return;
      addMessage(msg.room, msg.username, msg.message, true);
    });

    events.addEventListener("open", () => {
      setConnectedStatus(true);
      console.log(`connected to event stream at ${uri}`);
      retryTime = 1;
    });

    events.addEventListener("error", () => {
      setConnectedStatus(false);
      events.close();

      let timeout = retryTime;
      retryTime = Math.min(64, retryTime * 2);
      console.log(`connection lost. attempting to reconnect in ${timeout}s`);
      setTimeout(() => connect(uri), (() => timeout * 1000)());
    });
  }

  connect(uri);
}

// Set the connection status: `true` for connected, `false` for disconnected.
function setConnectedStatus(status) {
  STATE.connected = status;
  statusDiv.className = (status) ? "connected" : "reconnecting";
}

// Let's go! Initialize the world.
function init() {
  // Initialize some rooms.
  addRoom("lobby");
  addRoom("rocket");
  changeRoom("lobby");
  addMessage("lobby", "Rocket", "Отправь сообщение.", true);
  addMessage("rocket", "Rocket", "Это другая комната.", true);

  // Set up the form handler.
  newMessageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const room = STATE.room;
    const message = messageField.value;
    const username = usernameField.value || "guest";
    if (!message || !username) return;
    
    /* Файл .rs (Rust) содержит обработчик для POST запроса на путь "/message". Обработчик получает данные из формы, 
    которые были отправлены с помощью fetch из файла .js. */
    if (STATE.connected) {
      fetch("/message", {
        method: "POST",
        body: new URLSearchParams({ room, username, message }),
      }).then((response) => {
        if (response.ok) messageField.value = "";
      }); // then((response))... отвечает за то, чтобы после отправки сообщения
          // очищалась строка ввода.
    }
  })

  // Set up the new room handler.
  newRoomForm.addEventListener("submit", (e) => {
    e.preventDefault(); // .preventDefault() -- отмена действия браузера.

    const room = roomNameField.value;
    if (!room) return;

    roomNameField.value = "";
    if (!addRoom(room)) return;

    addMessage(room, "Rocket", `Создана новая комната: "${room}"`, true);
  })

  // Subscribe to server-sent events.
  subscribe("/events");
}

init();