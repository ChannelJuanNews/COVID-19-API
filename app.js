// INCLUDES
let express = require('express')
let mysql      = require('mysql');
let app = express()


// create connection string
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'pandemic'
});

// actually connect to mysql
connection.connect( function(err) {
    if(err){
        console.log(err)
    } else {
        console.log("WE ARE CONNECTED")
    }
});


app.get('/country/:country', (req, res) => {
    let country = req.params.country
    let query = `SELECT * FROM pandemic.covid19 WHERE COUNTRY='${country}' ORDER BY CONFIRMED DESC;`
    connection.query( query , function (error, results, fields) {
        if (error) return res.json(error)
        return res.json(results)
    });
})


// api endpoint for our personal use
app.get('/country/:country/state/:state', (req, res) => {

    let country = req.params.country
    let state = req.params.state

    let query = `SELECT * FROM pandemic.covid19 WHERE COUNTRY='${country}' AND STATE='${state}' ORDER BY CONFIRMED DESC;`


    connection.query( query , function (error, results, fields) {
        if (error) return res.json(error)
        return res.json(results)
    });
})

//
app.listen('3000', (err) => {
    if(err){
        console.log(err)
    } else {
        console.log("we in at port", 3000)
    }
})
