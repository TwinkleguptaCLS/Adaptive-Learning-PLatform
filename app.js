const express = require('express')
const path = require('path');
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const expressLayouts = require('express-ejs-layouts');
const {response} = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');

//passport
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
//importing models
const Student = require('./student');
const Teacher = require('./teacher')

const app = express();
const port = process.env.PORT || 5000;

//authentication
app.use(passport.initialize());
app.use(passport.session());



app.use(session({
    secret: 'woot',
    resave: true, 
    saveUninitialized: true}));

app.use(flash());

// MIDDLEWARES
// Global variable
app.use(async(req, res, next) => {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

// Check if user is authenticated and clear cache accordingly
const checkAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        console.log('checkauthenticated success')
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
    } else {
        console.log('checkauthenticated failed')
        res.redirect('/home');
    }
}

//engine setup
app.set('views',path.join(__dirname,'views'));
//app.use(expressLayouts);
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({ extended : false }));


//setting up public folder
app.use('/public', express.static('public'));


// app.get('/',(req,res)=>{
//     res.send('<h1>Adaptive Learning Platform</h1>');
// })

//mongoose connection
var mongoDB = 'mongodb://localhost/Navigus';
mongoose.connect(process.env.MONGODB_URI || mongoDB,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=> console.log('Database connected'));

// initial register routes

app.get('/', async(req, res) => {
    res.render('index')
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
                return res.redirect('loginAdmin');
            });
        });
    } else {
        console.log('user exists')
        err = 'Teacher with this roll number already exists!'
        res.render('registerAdmin', { 'err': err });
    }

}
})

app.get('/registerUser', async(req, res) => {
    res.render('registerUser')
})

// Register user
app.post('/registerUser', async(req, res) => {
    var { email, username, roll, password, confirmpassword } = req.body;
    var err;

    // if any field is empty
    if (!email || !username || !roll || !password || !confirmpassword) {
        err = 'Please fill all details!'
        res.render('registerUser', { 'err': err });
    }

    // if password doesn't match
    if (password != confirmpassword) {
        err = 'Passwords Don\'t match!'
        res.render('registerUser', { 'err': err, 'email': email, 'roll': roll, 'username': username });
    }

    // if everything is fine then check for exiting email in db
    if (typeof err == 'undefined') {
        const check = await Student.exists({ roll: req.body.roll })
        if (check == false) {
            bcrypt.genSalt(10, async(err, salt) => {
                if (err) throw err;
                bcrypt.hash(password, salt, async(err, hash) => {
                    if (err) throw err;
                    password = hash;

                    // save new user
                    await Student.create({
                        email,
                        username,
                        roll,
                        password
                    })
                    req.flash('success_message', "Registered Successfully.. Login To Continue..");
                    return res.redirect('loginUser');
                });
            });
        } else {
            console.log('user exists')
            err = 'User with this roll number already exists!'
            res.render('registerUser', { 'err': err });
        }

    }
})

passport.serializeUser(function(Teacher,cb){
    cb(null,Teacher.id);
})
passport.deserializeUser(function(id,cb){
    Teacher.findByID(id,function(err,Teacher){
        cb(err,Teacher);
    })
})

passport.serializeUser(function(Student,cb){
    cb(null,Student.id);
})
passport.deserializeUser(function(id,cb){
    Teacher.findByID(id,function(err,Student){
        cb(err,Student);
    })
})

passport.use('localTeacher', new localStrategy({ usernameField: 'roll' }, async(roll, password, done) => {

    Teacher.findOne({ roll: roll }, async(err, data) => {
        if (err) throw err;
        if (!data) {
            return done(null, false, { message: "User Doesn't Exists.." });
        }
        bcrypt.compare(password, data.password, async(err, match) => {
            if (err) {
                return done(null, false);
            }
            if (!match) {
                return done(null, false, { message: "Password Doesn't Match" });
            }
            if (match) {
                console.log('matchedAdmin')
                return done(null, data);
            }
        });
    });
}));

passport.use('localUser', new localStrategy({ usernameField: 'roll' }, async(roll, password, done) => {

    User.findOne({ roll: roll }, async(err, data) => {
        if (err) throw err;
        if (!data) {
            return done(null, false, { message: "User Doesn't Exists.." });
        }
        bcrypt.compare(password, data.password, async(err, match) => {
            if (err) {
                return done(null, false);
            }
            if (!match) {
                return done(null, false, { message: "Password Doesn't Match" });
            }
            if (match) {
                console.log('matchedUser')
                return done(null, data);
            }
        });
    });
}));

// Login admin
app.get('/loginAdmin', async(req, res) => {
    res.render('loginAdmin');
})

// Login user
app.get('/loginUser', async(req, res) => {
    res.render('loginUser');
})

// Login admin
app.post('/loginAdmin', (req, res, next) => {
    passport.authenticate('localTeacher', {
        failureRedirect: '/loginAdmin',
        successRedirect: '/indexAdmin',
        failureFlash: true,
    })(req, res, next);
});

// Login user
app.post('/loginUser', (req, res, next) => {
    passport.authenticate('localUser', {
        failureRedirect: '/loginUser',
        successRedirect: '/indexUser',
        failureFlash: true,
    })(req, res, next);
});

// Success route admin
app.get('/indexAdmin', checkAuthenticated, async(req, res) => {
    res.render('indexAdmin', { 'teacher': req.teacher });
});

// Success route user
app.get('/indexUser', checkAuthenticated, async(req, res) => {
    res.render('indexUser', { 'user': req.user });
});

app.get('/api', checkAuthenticated, async(req, res) => {
    user.findById(req.user._id).populate("data").exec(async(error, foundUser) => {
        if (error) {
            console.log(error);
            return res.redirect('/404')
        }

        if (!foundUser) {
            console.log("Api url does not exist");
            return res.redirect('/404')
        }
        // res.send( {'slots': foundUser.slots})
        // res.render('allslots', { 'user': foundUser.username, 'uid': foundUser._id, 'data': foundUser.data })
        res.send({ 'user': foundUser.username, 'uid': foundUser._id, 'data': foundUser.data })
    });

})


// Logout route
app.get('/logout', async(req, res) => {
    req.logout();
    return res.redirect('home');
})


app.listen(port);
console.log('Server is listening on port 5000');