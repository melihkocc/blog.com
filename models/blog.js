const mongoose = require("mongoose")

const blogSchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    content : {
        type : String,
        required : true,
    },
    date : {
        type : Date,
        default : Date.now,
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : true
    },
    categories : [{
        type : mongoose.Schema.ObjectId,
        ref : "Category",
        required : false,
    }],
    url : {
        type : String,
        required : true
    },
    image_id : {
        type : String,
        required : true
    },
    comments : [{
        type: mongoose.Schema.ObjectId,
        ref : "Comment",
        required : false
    }],
    likeSayisi : {
        type : Number,
        default : 0,
        required : true
    }
})

module.exports = mongoose.model("Blog",blogSchema)