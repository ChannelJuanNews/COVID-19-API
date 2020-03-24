// INCLUDES
let express     = require('express')
let mysql      = require('mysql');
let app         = express()

const { exec } = require('child_process');

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

// update the database
app.get('/update', (req, res) => {
    exec('node ./actions/loop.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);

            return res.json(error)
        } else {
            res.json("done")
        }
        console.log(`stdout: ${stdout}`);
    });
})

app.get('/', (req, res) => {
    res.json({
        hello : "and welcome to our database"
    })
})

app.get('*', (req, res) => {
    res.json({
        error : "idk why but this is an error"
    })
})

// bind to port 3000
app.listen('3100', (err) => {
    if(err){
        console.log(err)
    } else {
        console.log("we in at port", 3100)
    }
})
