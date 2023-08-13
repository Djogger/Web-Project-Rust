// Мдаа-м, Капец (Ｔ▽Ｔ )

function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const messageDisplay = document.getElementById("messageDisplay");

  const message = messageInput.value;

  let newParagraph = document.createElement('p');

  fetch("/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded", // Объяснение -- (1).
    },
    body: `Content=${encodeURIComponent(message)}`,
  })
    .then((response) => response.text())
    .then((text) => {
      newParagraph.textContent = `${text}`;
      messageDisplay.appendChild(newParagraph);
    });
}