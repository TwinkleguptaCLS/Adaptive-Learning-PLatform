const mongoose  = require('mongoose')

const studentSchema = new mongoose.Schema({
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
    data : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"student"
    }]
})

module.exports =  new mongoose.model('student',studentSchema);