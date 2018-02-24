var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

var options = {
 errorMessages: {
  UserExistsError:"Пользователь с таким логином уже существует",
  MissingPasswordError: "Отстуствет пароль",
  MissingUsernameError: "Отстуствет логин",
 }
};

UserSchema.plugin(passportLocalMongoose, options);

module.exports = mongoose.model("User", UserSchema);