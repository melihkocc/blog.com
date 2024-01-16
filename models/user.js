const mongoose = require("mongoose")
const {isEmail} = require("validator")
const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    lastName : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        validate : [isEmail,"Geçersiz Email"],
        trim : true
    },
    password : {
        type : String,
        required : true,
        trim : true
    },
    resetToken : String,
    resetTokenExpiration : String,
    isAdmin : {
        type : Boolean,
        default : false,
    },
    date : {
        type : Date,
        default : Date.now,
    },
    url : {
        type : String,
        default : "/images/blog-thumb-04.jpg",
        required : true
    },
    image_id : {
        type : String,
        default : "/images/blog-thumb-04.jpg",
        required : true
    },
    myLikesBlog : [{
        type : mongoose.Schema.ObjectId,
        ref : "Blog",
        required: false,
    }],
    takipci : [{
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : false,
    }],
    takipEdilen : [{
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : false,
    }]
})

module.exports = mongoose.model("User",userSchema)