const mongoose = require("mongoose")
const {isEmail} = require("validator")

const messageSchema = mongoose.Schema({
    name : {
        type : String,
        required: true,
        trim : true
    },
    lastName : {
        type : String,
        required: true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        validate : [isEmail,"Geçersiz Email"],
        trim : true
    },
    message : {
        type : String,
        required: true
    }
})

module.exports = mongoose.model("Message",messageSchema)