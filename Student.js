const mongoose  = require('mongoose')

const StudentSchema = new mongoose.Schema({
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
        ref:"data"
    }]
})

module.exports =  new mongoose.model('Student',StudentSchema);