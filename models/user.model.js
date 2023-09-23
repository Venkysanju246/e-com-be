const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    email:String,
    password:String,
    phone:Number
})

const UserModel = mongoose.model("user", UserSchema)

module.exports = UserModel