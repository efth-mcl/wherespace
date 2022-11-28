const express = require('express')
const db = require('./routes/db')

const app = express()

app.get('/', (req, res) => {
    res.send('Big Bang Era')
})

app.use('/db', db)

app.listen(8381, () => {
    console.log("Run app at port 8381");
})
