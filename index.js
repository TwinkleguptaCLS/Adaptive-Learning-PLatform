const express = require('express')
const path = require('path');

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

app.listen(port, () => console.log(`Server Started on port ${port}!`));