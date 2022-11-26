const express = require('express')
const fs = require('fs')
const {Pool, Client} = require('pg')
const Database = require('../db/base')

const db = express()

db.get('/create', (req, res) => {
    fs.readFile('./data/db_structure.json', (err, data) => {
        const db_structure = JSON.parse(data)
        console.log(db_structure)
        const [db_name, db_obj] = Object.entries(db_structure)[0]
        const db_class = new Database(db_name, db_obj)
        
        db_class.create()
        
        for (schema of db_class.schemas) {
            schema.create()
            for (table of schema.tables) {
                table.create()
                for(column of table.columns) {
                    column.alter()
                }
            }
        }
        res.send('Database '+ db_name +" Created Successfully.")
    });
})

module.exports = db
