const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required : true
    },
    rollno:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    coursequiz : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coursequiz"
    }]
})

module.exports = new mongoose.model('teacher',teacherSchema);