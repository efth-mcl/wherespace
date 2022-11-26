const {Pool} = require('pg')
const { database } = require('pg/lib/defaults')

function create_pool(database=null) {
    let pool = new Pool({
        user: 'postgres',
        host: '172.16.0.2',
        password: 'dummypass',
        port: 5432,
        database: database
      })
      return pool
}

function sql_create(type='DATABASE', name, database=null) {
    create_pool(database).connect().then((client) => {
        return client
            .query(`CREATE ${type} ${name}`)
            .then((res) => {
                client.release()
            })
            .catch((err) => {
                client.release()
                console.log(err.stack)
        })
    })
}

function sql_alter(type='TABLE', parent_name, command='ADD COLUMN', name, arguments=[], database=null) {
    const arguments_str = arguments.join(' ')
    create_pool(database).connect().then((client) => {
        return client
            .query(`ALTER ${type} ${parent_name} ${command} ${name} ${arguments_str}`)
            .then((res) => {
                client.release()
            })
            .catch((err) => {
                client.release()
                console.log(err.stack)
        })
    })
}

class Database {
    constructor(name, obj) {
        this.name = name
        this.schemas = this.#setupschemas(obj)

    }
    create() {
        sql_create('database', this.name)
    }
    #setupschemas(obj) {
        let schemas = []
        for (const [key, value] of Object.entries(obj)) {
            const schema = new Schema(key, value, this)
            schemas.push(schema)
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
        sql_create('schema', this.name, this.parent.name)
    }

    #setuptables(obj) {
        let tables = []
        for (const [key, value] of Object.entries(obj)) {
            const table = new Table(key, value, this)
            tables.push(table)
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
        sql_create('table', name + " ()", this.parent.parent.name)
    }
    #setupcolumns(obj) {
        let columns = []
        for (const [key, value] of Object.entries(obj)) {
            const schema = new Column(key, value, this)
            columns.push(schema)
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
        for (const p of this.properties) {
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
                    attributes.push('REFERENCES ' + this.parent.parent.name +"."+ p.attribute +' (id)')
                    break;
                default:
                    break;
            }
        }
        sql_alter('TABLE', parent_name, 'ADD COLUMN', this.name, attributes, this.parent.parent.parent.name)
    }
    #setupproperties(obj){
        let properties = []
        for (const [key, value] of Object.entries(obj)) {
            const property = new Property(key, value, this)
            
            properties.push(property)
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
