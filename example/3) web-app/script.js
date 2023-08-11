// JavaScript source code

/* Код этого файла работает следующим способом:
	С помощью этого кода при нажатии на кнопку мы выводим новый текст на странице.
	При этом саму страницу не надо обновлять. */

// Создаем новый элемент
function alerted() {
var newParagraph = document.createElement('p');
newParagraph.textContent = 'Новый Текст.';

// Находим родительский элемент
var container = document.getElementById('container');

// Добавляем новый элемент в качестве дочернего элемента
container.appendChild(newParagraph);
}