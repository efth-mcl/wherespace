const express = require('express')
const fs = require('fs')
const db = require('./routes/db')
const login = require('./routes/login')
const driver = require('./routes/driver')
const wherehouse = require('./routes/wherehouse')

const Database = require('./db/base')

const app = express()

const data = fs.readFileSync('./data/db_structure.json')
const db_structure = JSON.parse(data)
const [db_name, db_obj] = Object.entries(db_structure)[0]
const db_class = new Database(db_name, db_obj)


app.set('view engine', 'pug')

app.use(express.urlencoded({
    extended: true
  }))

app.use('/db', db)
app.use('/login', login)
app.use('/driver', driver)
app.use('/wherehouse', wherehouse)

login.locals.db_class = db_class
db.locals.db_class = db_class
wherehouse.locals.db_class = db_class
driver.locals.db_class = db_class

app.get('/', (req, res) => {
    res.render('index', { title: 'index', message: 'Big Bang'})
})

app.listen(8381, () => {
    console.log("Run app at port 8381");
})