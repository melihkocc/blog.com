const mongoose = require("mongoose")

const commentSchema = mongoose.Schema({
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : true
    },
    message : {
        type : String,
        required : true
    },
    date : {
        type : String,
        default : getFormattedDate
    }
})

function getFormattedDate() {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('tr-TR', options);
}

module.exports = mongoose.model("Comment",commentSchema)