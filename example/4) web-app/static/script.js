// Мдаа-м, Капец (Ｔ▽Ｔ )

function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const messageDisplay = document.getElementById("messageDisplay");

  const message = messageInput.value;

  let newParagraph = document.createElement('p');

  fetch("/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // Надо узнать больше про fetch и headers. Объяснение -- (1).
    },
    body: `Content=${encodeURIComponent(message)}`,
  })
    .then((response) => response.text())
    .then((text) => {
      newParagraph.textContent = `${text}`;
      messageDisplay.appendChild(newParagraph);
    });
}

/* (1):
Fetch - это функция, которая используется для отправки HTTP запросов на сервер и получения ответа от него. 
Она является модернизированной и более мощной альтернативой старому XMLHttpRequest.

В коде, который вы предоставили, fetch отправляет POST запрос на "/message" ресурс на сервере. 
Он включает в себя некоторые параметры, которые определяют, каким образом и что нужно отправить на сервер.

Headers - это объект, содержащий заголовки HTTP запроса. 
Заголовки могут быть использованы для передачи дополнительной информации о запросе, 
такой как Content-Type, Accept, Authorization и др. В вашем коде, заголовок "Content-Type" 
устанавливается в "application/x-www-form-urlencoded".

"application/x-www-form-urlencoded" - это один из типов данных, используемых для передачи данных через HTTP запросы. 
Он указывает на то, что данные будут закодированы в виде строки, в соответствии с принятым стандартом, называемым x-www-form-urlencoded. 
Это обычно используется при отправке данных формы на сервер.

Таким образом, код выполняет POST запрос на "/message" с заголовком "Content-Type" равным "application/x-www-form-urlencoded" и 
телом запроса, состоящим из значения переменной message, закодированного в соответствии с указанным стандартом.
*/