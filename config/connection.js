//~Inserting data to database 1st step ( from Database connection) this function is we declare for to take module (2 in app.js)
const mongoClient = require('mongodb').MongoClient
const state = {
    db: null
}
// DATABASE
module.exports.connect = function (done) {
    const url = 'mongodb://localhost:27017'
    const dbname = 'shopping'

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()
    })

    // ^all this function for connect database
}

//!this funtion is to take or use the database
module.exports.get = function () {
    return state.db
}
// !after enter the details only show collections in the database
// !first add details inthe localhast:3000/admin/add-product/.....then open the mongodb terminal and enter'mongo' then enter 'show dbs' and then enter 'use shopping' and 'show collections' then enter 'db.product.find()'