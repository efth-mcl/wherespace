const {Pool} = require('pg')


function sql_create(type='DATABASE', name, pool) {
    const query = "CREATE " + type + " " + name
    pool.connect().then((client) => {
        return client
        .query(query)
        .then(() => {
            client.release()
          })
          .catch((err) => {
            client.release()
            console.log(err.stack)
          })
    })
}

function sql_alter(type='TABLE', parent_name, command='ADD COLUMN', name, attributes=[], pool) {
    const attributes_str = attributes.join(' ')

    const query = "ALTER " + type + " " + parent_name + " " + command + " " + name + " " + attributes_str
    pool.connect().then((client) => {
        return client
        .query(query)
        .then(() => {
            client.release()
          })
          .catch((err) => {
            client.release()
            console.log(err.stack)
          })
    })
}

function sql_insert(name, columns_name, values, pool) {

    // dont touch it works
    var query_text = 'INSERT INTO ' + name + "("
    var cnt = 1
    for (column_name of columns_name) {
        query_text += column_name
        if (cnt < columns_name.length) query_text += ", "
        cnt += 1
    }
    query_text += ") VALUES("
    for (let i = 1; i <= columns_name.length; i++) {
        query_text += "$"+i,toString()
        if (i < columns_name.length) query_text += ", "
      }
    query_text += ")"
    const query = {
        text: query_text,
        values: values
    }
    pool.connect().then((client) => {
        return client
        .query(query)
        .then(() => {
            client.release()
          })
          .catch((err) => {
            client.release()
            console.log(err.stack)
          })
    })
}


function sql_select(keys=["*"], table_name, pool) {
    var query_text = "SELECT "

    var i = 1
    for (key of keys) {
        query_text += key
        if (i < keys.length) query_text += ", "
    }
    query_text += " FROM " + table_name
    const results = pool.query(query_text)
    return results
}


function sql_big_query(query_str, pool) {
    const results = pool.query(query_str)
    return results
}


class Database {
    constructor(name, obj) {
        this.name = name
        this.schemas = this.#setupschemas(obj)
        this.pool = new Pool({
            user: 'postgres',
            host: '172.16.0.2',
            password: 'dummypass',
            port: 5432,
            database: this.name
          })
    }

    create() {
        sql_create('database', this.name, this.pool)
    }
    #setupschemas(obj) {
        let schemas = new Map();
        for (const [key, value] of Object.entries(obj)) {
            const schema = new Schema(key, value, this)
            schemas.set(key, schema)
        }
        return schemas
    }
};

class Schema {
    constructor(name, obj, parent) {
        this.name = name
        this.tables = this.#setuptables(obj)
        this.parent = parent
    }

    create() {
        sql_create('schema', this.name, this.parent.pool)
    }

    big_query(query_str) {
        const results = sql_big_query(query_str, this.parent.pool)
        return results
    }

    #setuptables(obj) {
        let tables = new Map();
        for (const [key, value] of Object.entries(obj)) {
            const table = new Table(key, value, this)
            tables.set(key, table)
        }
        return tables
    }
};


class Table{
    constructor(name, obj, parent) {
        this.name =  name
        this.columns = this.#setupcolumns(obj)

        this.parent = parent
    }

    create() {
        const name = this.parent.name + "." + this.name
        sql_create('table', name + " ()", this.parent.parent.pool)
    }

    insert(entity_obj) {
        const name = this.parent.name + "." + this.name

        

        const columns_name = Object.keys(entity_obj)
        const values = Object.values(entity_obj)
        
        const database = this.parent.parent.name

        sql_insert(name, columns_name, values, this.parent.parent.pool)
    }

    select(keys=["*"]) {
        const table_name = this.parent.name + "." + this.name
        const results = sql_select(keys, table_name, this.parent.parent.pool)
        return results
    }

    #setupcolumns(obj) {
        let columns = new Map();
        for (const [key, value] of Object.entries(obj)) {
            const column = new Column(key, value, this)
            columns.set(key, column)
        }
        return columns
    }
};


class Column {
    constructor(name, obj, parent) {
        this.name =  name
        this.properties = this.#setupproperties(obj)

        this.parent = parent
    }
    alter() {
        const parent_name = this.parent.parent.name + "." + this.parent.name
        var attributes = []
        for (const p of this.properties.values()) {
            switch (p.name) {
                case "dtype":
                    attributes.push(p.attribute)
                    break;
                case "require":
                    if (p.attribute) {
                        attributes.push('NOT NULL')
                    }
                    break;
                case "primary_key":
                    if (p.attribute) {
                        attributes.push('PRIMARY KEY')
                    }
                    break;
                case "ref":
                    const table_name =  Object.keys(p.attribute)[0]
                    const table_key =  Object.values(p.attribute)[0]
                    attributes.push('REFERENCES ' + this.parent.parent.name +"."+ table_name + " (" + table_key +")")
                    break;
                default:
                    break;
            }
        }
        sql_alter('TABLE', parent_name, 'ADD COLUMN', this.name, attributes, this.parent.parent.parent.pool)
    }
    #setupproperties(obj){
        let properties = new Map();
        for (const [key, value] of Object.entries(obj)) {
            const property = new Property(key, value, this)
            
            properties.set(key, property)
        }
        return properties
    }
};

class Property {
    constructor(name, attribute, parent){
        this.name = name
        this.attribute = attribute

        this.parent = parent
    }
}


module.exports = Database
