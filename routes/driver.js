const express = require('express')

driver = express()

driver.get('/:name', (req, res) => {
    const name = req.params.name
    console.log(name)
    res.render('driver/index', {name: name})
})

driver.post('/:name', (req, res) => {
    const barcode = req.body.barcode
    const name = req.params.name
    entity_obj = {
        id_pack: barcode,
        id_driver: name
    }
    req.app.locals.db_class.schemas.get('wherespace').tables.get('pack_driver').insert(entity_obj)
    
    res.render('driver/index', {name: name})
})

module.exports = driver