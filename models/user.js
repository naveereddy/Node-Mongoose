var mongoose = require('mongoose');
var Schema = mongoose.Schema

let userSchema = new Schema({
  name:{
    type: String
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  password: {
   type:String,
   required: true
  },
  age: Number,
  phoneNumber: String,
  gender: Number,
  birthday: String,
  createdDate:{
    type: Date,
    default: Date.now()
  },
  occupation: String,
  verify:{
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('User' , userSchema);