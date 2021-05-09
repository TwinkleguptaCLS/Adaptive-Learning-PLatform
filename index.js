const express = require('express')
const path = require('path');
const mongoose = require("mongoose")
const bodyParser = require("body-parser")

//importing models
const Student = require('./student');
const Teacher = require('./teacher')

const app = express();
const port = process.env.PORT || 5000;


//engine setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//setting up public folder
app.use(express.static('./public'));

app.get('/',(req,res)=>{
    res.send('<h1>Adaptive Learning Platform</h1>');
})

//mongoose connection
var mongoDB = 'mongodb://localhost/Navigus';
mongoose.connect(process.env.MONGODB_URI || mongoDB,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=> console.log('Database connected'));

// Dummy home route
app.get('/home', async(req, res) => {
    res.render('display')
})
app.get('/', async(req, res) => {
    res.render('display')
})

// ADMIN REGISTER
app.get('/registerAdmin', async(req, res) => {
    res.render('registerAdmin')
})
// Register admin
app.post('/registerAdmin', async(req, res) => {
var { email, roll, username, password, confirmpassword } = req.body;
var err;

// if any field is empty
if (!email || !roll || !username || !password || !confirmpassword) {
    err = 'Please fill all details!'
    res.render('registerAdmin', { 'err': err });
}

// if password doesn't match
if (password != confirmpassword) {
    err = 'Passwords Don\'t match!'
    res.render('registerAdmin', { 'err': err, 'email': email, 'roll': roll, 'username': username });
}

// if everything is fine then check for exiting email in db
if (typeof err == 'undefined') {
    const check = await Teacher.exists({ roll: req.body.roll })
    if (check == false) {
        bcrypt.genSalt(10, async(err, salt) => {
            if (err) throw err;
            bcrypt.hash(password, salt, async(err, hash) => {
                if (err) throw err;
                password = hash;

                // save new user
                await Teacher.create({
                    email,
                    username,
                    roll,
                    password
                })
                req.flash('success_message', "Teacher Registered Successfully.. Login To Continue..");
                res.redirect('/loginAdmin');
            });
        });
    } else {
        console.log('user exists')
        err = 'Teacher with this roll number already exists!'
        res.render('registerAdmin', { 'err': err });
    }

}
})



app.listen(port, () => console.log(`Server Started on port ${port}!`));

console.log(mongoose.connection.readyState);