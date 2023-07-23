/* Пример Веб-Приложения */

/* Тут я попытаюсь понять принцип работы методов post и get, а также постараюсь больше 
разобраться в библиотеке Rocket.

План этого примера:
1) Понять принцип работы методов post и get -- ()
2) Вспомнить создание страницы при помощи файла .html -- ()
3) Попробовать осуществить авторизацию -- ()
4) Просто потыкать всё -- ()
*/

use rocket::fs::FileServer;

#[macro_use] extern crate rocket;
/*
// Обычный путь:
#[get("/get")]
fn get() -> &'static str {
	"Example str"
}

// Динамические параметры:
#[get("/hello/<name>")]
fn hello(name: String) -> String {
	format!("Hello, {}!", name.as_str())
}

#[get("/hello1/<name1>/<age>/<truth>")]
fn hello2(name1: String, age: u8, truth: bool) -> String {
	if truth {
		format!("Ваше имя - {}. Вам: {}.", name1, age)
	} else {
		format!("{}, we need to talk to you >:(", name1)
	}
}
*/
// Forms:

use rocket::form::Form;

#[derive(FromForm)]
struct Task <'a>{
	description: &'a str,
}

#[post("/todo", data="<task>")]
fn new(task: Form<Task>) -> String {
	let form_data = task.into_inner().description;
    // Применяем полученные данные, например:
	getform(form_data)
	// Да, я знаю, что мог сделать всё одной строкой, но я это понял, только после создания
	// второй фун-ии. Мне жалко её удалять)) 
	// format!("You tupped: '{}'", form_data)
}

#[post("/message", data="<arg>")]
fn getform(arg: &str) -> String {
	println!("	Ваша строка получена :3\n");  // Эта строка выводится в терминал.
	format!("You tupped: '{}'", arg)  // Эта строка возвращается в функцию new().
}


#[launch]
fn launch() -> _ {
	rocket::build()
		.mount("/", routes![new, getform])
		.mount("/", FileServer::from("static"))
}