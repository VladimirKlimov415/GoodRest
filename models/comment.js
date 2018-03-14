var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
   cafe: {
       id:{
           type: mongoose.Schema.Types.ObjectId,
           ref:"Cafe"
       },
       name:String
   }
});

module.exports = mongoose.model("Comment", commentSchema);