/* Пример сайта, который получает ввод пользователем, 
   а затем выводит его на странице */

#[macro_use]
extern crate rocket;

use rocket::form::Form;
use rocket::response::content;
use rocket::fs::{relative, FileServer};
//use rocket::State;
//use std::sync::{Arc, Mutex};

#[derive(FromForm)]
struct Message {
    Content: String,
}

#[post("/message", data = "<message_form>")]
fn message(message_form: Form<Message>/*, saved_message: &State<Arc<Mutex<Option<String>>>>*/) -> content::RawHtml<String> {
    let message = message_form.into_inner().Content;
    //*saved_message.lock().unwrap() = Some(message.clone());
    let response = format!("Saved message: {}", message);

    content::RawHtml(response)
}

/* Здесь Я хочу показать, что необязательно преобразовывать текст из response в HTML тип.

#[post("/message", data = "<message_form>")]
fn message(message_form: Form<Message>) -> String {
    let message = message_form.into_inner().Content;
    format!("Saved message: {}", message)
}
*/

#[launch]
fn launch() -> _ {
    rocket::build()
        .mount("/", routes![message])
        .mount("/", FileServer::from(relative!("static")))
        //.manage(Arc::new(Mutex::new(None::<String>)))
}

// и /**/ Я обозначил то, что пока не понимаю. Без этих строчек сайт также хорошо работает.