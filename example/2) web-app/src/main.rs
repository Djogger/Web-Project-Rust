/* Второй пример работы Веб-Сервера */

// Тут будет показана связь между методами get и post.

#[macro_use] extern crate rocket;

use rocket::form::Form;
use rocket::fs::FileServer;

#[derive(FromForm)]
struct MyFormData {
    name: String,
    age: u8,
}

#[get("/get")]
fn index() -> &'static str {
    "Hello, Rocket!"
}

#[post("/", data = "<my_form_data>")]
fn process_form(my_form_data: Form<MyFormData>) -> String {
    let name = &my_form_data.name;
    let age = my_form_data.age;
    format!("Welcome to the club, {}! Your age is {}.", name, age)
}

#[launch]
fn launch() -> _ {
    rocket::build()
        .mount("/", routes![index, process_form])
        .mount("/", FileServer::from("static"))
}