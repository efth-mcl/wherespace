const express = require('express')

app = express()

app.get('/', (req, res) => {
    res.send('Big Bang Era')
})

app.listen(8381, () => {
    console.log("Run app at port 8381");
})
