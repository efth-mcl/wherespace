const express = require('express')

login = express()

login.get('/', (req, res) => {
    res.render('login')
})

login.get('/driver', async (req, res) => {
    const values = await req.app.locals.db_class
        .schemas.get('wherespace')
        .tables.get("drivers")
        .select(["name"])

    console.log("values")
    console.log(values.rows)
    res.render('driver/login', {values: values.rows, length: values.rows.length})
})

login.post('/driver', (req, res) => {
    const name = req.body.name
    console.log(name)
    res.redirect('/driver/'+name)
})

login.get('/wherehouse', (req, res) => {
    const name = req.params.name
    res.redirect('/wherehouse')
})

module.exports = login