const express = require('express')

const dotenv = require('dotenv')
dotenv.config()
const app = express()
const cors = require('cors')
const cookiesParser = require('cookie-parser')
const errorMiddleware = require("./middlewares/error");
const routes = require('./routes/routes')
const path = require("path");
const ConnectDB = require('./config/Db')
const bodyParser = require('body-parser');

//=======Middllewares==============================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.set(express.static("uploads"))
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());
app.use(cookiesParser())
// Middleware for Errors
app.use(errorMiddleware);

//=======routes==============================
app.use('/api', routes)
app.get("/", (req, res) => {
    res.send("I am Cosmetic Backend")
});


//========Listen App ===================================
ConnectDB()
app.listen(process.env.PORT, () => {
    console.log(`server is running on port number ${process.env.PORT}`)
})



