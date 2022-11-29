const express = require('express')
const fs = require('fs')
const db = express()

db.get('/create', async (req, res) => {
    const db_name = req.app.locals.db_class.name;
    for (schema of req.app.locals.db_class.schemas.values()) {
        await schema.create()
        for (table of schema.tables.values()) {
            await table.create()
            for(column of table.columns.values()) {
                await column.alter()
            }
        }
    }
    console.log('Database '+ db_name +" Created Successfully.")
    res.send('Database '+ db_name +" Created Successfully.")
});


db.get('/init_data', async (req, res) => {
    fs.readFile('./data/init_data_entry.json', async (err, data_str) => {
        const data_structure = JSON.parse(data_str)
        const data_obj = Object.values(data_structure)[0]

        // Schema depth
        for (const [schema_name, schema_obj] of Object.entries(data_obj)) { 
            // Table depth
            for (const [table_name, table_obj] of Object.entries(schema_obj)) { 
                // Entity depth
                for (const entity_obj of Object.values(table_obj)) { 
                    await req.app.locals.db_class.schemas.get(schema_name).tables.get(table_name).insert(entity_obj)
                }
            }
        }
    });
    console.log('Initial data entry has been succulently, in '+ req.app.locals.db_class.name)
    res.send('Initial data entry has been succulently, in '+ req.app.locals.db_class.name)
});

db.get('/clear_tables', async (req, res) => {
    const query = "TRUNCATE wherespace.driver_cluster, wherespace.pack_driver, wherespace.pack_code, wherespace.postcodes, wherespace.drivers, wherespace.packages, wherespace.clusters"
    await req.app.locals.db_class.schemas.get("wherespace").big_query(query)
    console.log('All tables are clear')
    res.send('All tables are clear')
})

module.exports = db
