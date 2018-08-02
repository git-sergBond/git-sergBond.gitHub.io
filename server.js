#!/usr/bin/env nodejs
var express = require("express");
var bodyParser = require("body-parser");
// 
var urlencodedParser = bodyParser.urlencoded({extended: false});
var jsonParser = bodyParser.json();
//
var app = express();
app.use(express.static(__dirname));
//тестовые данные пользователей
let arr_users= [
  {
    login: "vacya",
    password: "12345",
    email: "vacya@mail.ru",
    phone: "89202205409",
    acessToken: "dsdasdasasdasdsadasdasd3123525253423423423"
  },
  {
    login: "kurasava",
    password: "12345",
    email: "kurasava@mail.ru",
    phone: "89802285410",
    acessToken: "dDGSAHDHASDHHASDHdjfngdjdfs52525FDFSDFF23"
  }
]
function sendJSON(data,response){
  return response.send(JSON.stringify(data));
}
//Модуль Авторизации
app.post("/sessionAPI",jsonParser, function(request, response){
  console.log(new Date + " POST /sessionAPI");
  if (!request.body) return response.sendStatus(400);
  console.log(request.body);
  if (!request.body.login && !request.body.password) {
    response.sendStatus(400);
    response.send("Неверный метод отправки запроса или не отправлен логин и пароль");
    return response;
  }
  for (user of arr_users) {
    if (request.body.login == user.login
      && request.body.password == user.password) {
      return sendJSON({
        status: 'OK',
        acessToken: user.acessToken,
        errors: []//? зачем ошибки
      }, response);
    }
  }
  response.sendStatus(400);
  return sendJSON({
    status: 'WRONG_DATA',
    errors: 'Неверные логин или пароль'//? где список ошибок
  }, response);
});
//Модуль Регистрации
app.post("/registerAPI",jsonParser, function(request, response){
  /*

foreach($arr_exists_users as $user){
    if($_POST['email'] == $user['email'] || $_POST['phone'] == $user['phone']) {
        echo json_encode(['status' => 'WRONG_DATA', 'errors' => ['Такой пользователь уже существует']]);
        return;
    }
}
return;
   */
  console.log(new Date + " POST /registerAPI");
  if(!request.body) return response.sendStatus(400);
  console.log(request.body);
  if (!request.body.email && !request.body.password && !request.body.phone){
    response.sendStatus(400);
    response.send("Неверный метод отправки запроса или не отправлены email, пароль и телефон");
    return response
  } 
  if(request.body.phone.length != 11){
    response.sendStatus(400);
    sendJSON({
      status : 'WRONG_DATA',
      errors : ['Неверный номер']
    }, response);
  }
  for (user of arr_users) {
    if (request.body.login == user.login
      && request.body.password == user.password) {
        response.sendStatus(400);
        return sendJSON({
          status: 'WRONG_DATA',
          acessToken: user.acessToken,
          errors: ['Такой пользователь уже существует']
        }, response);
    }
  }
  return sendJSON({
    status: 'OK',//зачем? когда можно отдать 200 или 400 или еще ченить
    errors: []//? где список ошибок
  }, response);
});
app.listen(3000);