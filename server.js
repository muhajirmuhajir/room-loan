const express = require('express');
const app = express();
const multer = require('multer')
const mt = multer()
const router = require('./api/router');
const db = require('./api/database');
const cors = require('cors');
const PORT = process.env.PORT || 8000

//midleware
app.use(express.json())
app.use('/r', express.static('uploads/images'))
app.use('/d', express.static('uploads/documents'))
app.use(cors())

//route
app.use(router)

//start
db.connect().then(() => {
    app.listen(PORT, () => {
        console.log("server is running");
    })
}).catch(err => {
    console.log("db error");
})