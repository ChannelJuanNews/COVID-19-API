let csv     = require('csv-parser');
let fs      = require('fs');
let mysql   = require('mysql')
let path    = require('path');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'pandemic'
});


// build the date for today's data
let today = new Date()
let day = today.getDate()
let month = today.getMonth() + 1
let year = today.getFullYear()

if(month < 10) {
    month = "0" + month
}

if(day < 10) {
    day = "0" + day
}

let date = `${month}-${day}-${year}`
console.log(date)


//date = '03-23-2020'


let full_path =  path.resolve( __dirname + `/../COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/${date}.csv`)
console.log(full_path)


try {

    if (fs.existsSync(full_path)) {
        //file exists
        console.log("first, latest date available is", date, full_path)

    } else {
        day = Number(day) - 1
        date = `${month}-${day}-${year}`
        full_path =  path.resolve( __dirname + `/../COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/${date}.csv`)

        if (fs.existsSync(full_path)) {
            console.log("latest date available is", date, full_path)
        } else {
            console.log("fatal error, file does not exist")
        }

    }
} catch(err) {
    console.error(err)
}

let amt = 0;
let end_amt = 0;


function query(row, amt){
    let query = `INSERT INTO covid19 (FIPS, CITY, STATE, COUNTRY, LAST_UPDATE, LATITUDE, LONGITUDE, CONFIRMED, DEATHS, RECOVERED, ACTIVE, COMBINED_KEY) VALUES ("${Number(row.FIPS)}", "${row.Admin2}", "${row.Province_State}", "${row.Country_Region}", "${row.Last_Update}", "${row.Lat}", "${row.Long_}", "${row.Confirmed}", "${row.Deaths}", "${row.Recovered}", "${row.Active}", "${row.Combined_Key}");`

    connection.query( query , function (error, results, fields) {
        if (error) console.log(error)
        //console.log(row);
        //console.log("RESULT IS", results)
        console.log("amt is", amt)

        if(amt == end_amt){
            console.log("end amt is", end_amt)
            connection.end()
        }
    });
}





// actually connect to mysql
connection.connect( function(err){
    if(err){
        console.log(err)
    }
    console.log('connected as id ' + connection.threadId);



    // drop the table
    connection.query('DROP TABLE IF EXISTS covid19;', function(error, results, fields) {
        if(error){ console.log(error); process.exit() }

        // recreate the same table
        connection.query("CREATE TABLE covid19( FIPS INTEGER, CITY VARCHAR(100), STATE VARCHAR(100), COUNTRY VARCHAR(100), LAST_UPDATE DATE, LATITUDE VARCHAR(100), LONGITUDE VARCHAR(100), CONFIRMED INTEGER, DEATHS INTEGER, RECOVERED INTEGER, ACTIVE INTEGER,  COMBINED_KEY VARCHAR(100) );", function(error, res, f) {
            if(error){ console.log(error); process.exit()}

                // execute order 66
                fs.createReadStream(full_path)
                  .pipe(csv())
                  .on('data', (row) => {
                    // increase amt every iteration (used for self termination)
                    amt++

                    if (row.FIPS == undefined || row.Admin2 == undefined || row.Province_State == undefined || row.Country_Region == undefined || row.Last_Update == undefined || row.Lat == undefined ){
                        // do nothing, do not query the value
                        //console.log('row that is dirty data is', row)
                        amt--
                    } else {
                        query(row, amt)
                    }
                  })
                  .on('end', () => {
                      end_amt = amt;
                      console.log('CSV file successfully processed');
                  });

        })
    })
});
