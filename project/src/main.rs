/* Приложение--Чат */

#[macro_use] extern crate rocket;

use rocket::{tokio::sync::broadcast::{channel, Sender, error::RecvError}, State};
use rocket::{serde::{Serialize, Deserialize}, Shutdown};
use rocket::{response::stream::{EventStream, Event}, fs::{relative, FileServer}, tokio::select};
use rocket::form::Form;

#[derive(Debug, Clone, FromForm, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]   // Это позволяет использовать функции и типы из этого модуля при сериализации и десериализации данных.
struct Message {
	#[field(validate = len(..30))]	// Указываем максимально-допустимую длину для room.
	room: String,
	#[field(validate = len(..20))]  // Указываем максимально-допустимую длину для username.
	username: String,
	message: String,
}

#[post("/message", data = "<form>")]
fn post(form: Form<Message>, queue: &State<Sender<Message>>) {	// тип State<> позволяет пользовать значение нескольким обработчикам.
	// Метод .send() возвращает ошибку, если нет людей для переписки. Так же метод .send() отправляет данные в очередь для последующей обработки.
	let _res = queue.send(form.into_inner()); // .into_inner() раскрывает обёртку Form<>, а метод .send()
	                                          // возвращает тип: Sender<'то, что было в обёртке Form<>'>.
}

#[get("/events")]
async fn events(queue: &State<Sender<Message>>, mut end: Shutdown) -> EventStream! [] { // Shutdown -- тип, при котором может закрываться чтение, а также запись TcpStream.
	                                                                  // EventStream! [] -- является бесконечным ответчиком. При нём создаётся бесконечный поток событий.
	let mut rx = queue.subscribe();

	EventStream! {
		loop {
			let message = select! {
				message = rx.recv() => match message {
					Ok(msg) => msg,
					Err(RecvError::Closed) => break,
					Err(RecvError::Lagged(_)) => continue,
				},
				_ = &mut end => break,
			};

			yield Event::json(&message);  // Код "yield Event::json(&msg);" используется для отправки события на event stream.
			                              // Функция yield позволяет приостановить выполнение кода до тех пор, 
										  // пока не будет готово следующее событие для отправки в event stream.
		}
	}
}

#[launch]
fn rocket() -> _ {
	rocket::build()
		.manage(channel::<Message>(1024).0)	// метод .manage() позволяет нам добавить состояние к экземпляру
											// нашего сервера rocket, к которому имеют доступ все обработчики.
		.mount("/", routes![post, events])
		.mount("/", FileServer::from(relative!("static")))
}

