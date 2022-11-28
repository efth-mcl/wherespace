const express = require('express')
const fs = require('fs')
const Database = require('../db/base')


const db = express()

const data = fs.readFileSync('./data/db_structure.json')
const db_structure = JSON.parse(data)
const [db_name, db_obj] = Object.entries(db_structure)[0]
const db_class = new Database(db_name, db_obj)

db.get('/create', (req, res) => {
    // db created manually
    // db_class.create()
    for (schema of db_class.schemas.values()) {
        schema.create()
        for (table of schema.tables.values()) {
            table.create()
            for(column of table.columns.values()) {
                column.alter()
            }
        }
    }
    res.send('Database '+ db_name +" Created Successfully.")
});

db.get('/init_data', (req, res) => {
    fs.readFile('./data/init_data_entry.json', (err, data_str) => {
        const data_structure = JSON.parse(data_str)
        const data_obj = Object.values(data_structure)[0]

        console.log(data_obj)

        // Schema depth
        for (const [schema_name, schema_obj] of Object.entries(data_obj)) { 
            // Table depth
            for (const [table_name, table_obj] of Object.entries(schema_obj)) { 
                // Entity depth
                for (const entity_obj of Object.values(table_obj)) { 
                    db_class.schemas.get(schema_name).tables.get(table_name).insert(entity_obj)
                }
            }
        }
    });
    res.send('Initial data entry has been succulently, in'+ db_class.name)
});

module.exports = db
