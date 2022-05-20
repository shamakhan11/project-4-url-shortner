const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const route = require("./routes/route");
const { default: mongoose } = require('mongoose');


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://SatyamRandawa:Loveyam@cluster0.nevir.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser: true
})
.then( () => console.log("MongoDB Is Connected"))
.catch (err => console.log(err))

app.use("/", route)

app.listen(process.env.PORT || 3000, (err) => {
    console.log("connected to PORT 3000")
})