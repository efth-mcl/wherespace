const express = require('express')

wherehouse = express()

// dont touch, it runs
wherehouse.get('/', async (req, res) => {

    const q1 =  "SELECT drivers.name, packages.voucher from wherespace.drivers ";
    const q2 =  "SELECT drivers.name from wherespace.drivers ";
    const q3 = "SELECT id_driver, id_pack from wherespace.pack_driver ";

    var q4 = "inner JOIN wherespace.driver_cluster on wherespace.driver_cluster.id_driver = wherespace.drivers.name "
    q4 += "inner JOIN wherespace.clusters on wherespace.driver_cluster.id_cluster = wherespace.clusters.name "
    q4 += "inner JOIN wherespace.postcodes on wherespace.postcodes.id_cluster = wherespace.clusters.name "
    q4 += "inner JOIN wherespace.pack_code on wherespace.postcodes.code = wherespace.pack_code.id_code "
    q4 += "inner JOIN wherespace.packages on wherespace.packages.voucher = wherespace.pack_code.id_pack "
    
    var pick_up_plan_q = q1 + q4
    let pick_up_plan = await req.app.locals.db_class
        .schemas.get("wherespace")
        .big_query(pick_up_plan_q)
    
    pick_up_plan = pick_up_plan.rows

    let scanned_packs = await req.app.locals.db_class
        .schemas.get('wherespace')
        .tables.get("pack_driver")
        .select(["*"])

    scanned_packs = scanned_packs.rows

    var rest_packs_q = q1 + q4
    rest_packs_q += "WHERE (drivers.name, packages.voucher) not in "
    rest_packs_q += "(" + q3 + ")"
    let rest_packs = await req.app.locals.db_class
        .schemas.get("wherespace")
        .big_query(rest_packs_q)
    
    rest_packs = rest_packs.rows

    var ready_q = q2
    ready_q += "WHERE (drivers.name) not in "
    ready_q += "(" + q2 + q4
    ready_q += "WHERE (drivers.name, packages.voucher) not in "
    ready_q += "(" + q3 +"))" 
    let ready = await req.app.locals.db_class
        .schemas.get("wherespace")
        .big_query(ready_q)
    
    ready = ready.rows   

    res.render('wherehouse/index', {
        pick_up_plan: pick_up_plan,
        scanned_packs: scanned_packs,
        rest_packs: rest_packs,
        ready: ready

    })
})

module.exports = wherehouse