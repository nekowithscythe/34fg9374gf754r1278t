var sqlite3 = require('sqlite3').verbose();
//var md5 = require('md5');

const DBSOURCE = "db01.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message);
      throw err;
    }else{
        console.log('DB - Connected.');
        db.run(`CREATE TABLE videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title text, 
            videodate text, 
            location text, 
            filename text,
            origfilename text,
            mimetype text,
            size integer,
            duration integer
            )`,
        (err) => {
            if (err) {
                // Table already created
                console.log("DB - Already Created.");
            }else{
                // Table just created, creating some rows
                //var insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
                //db.run(insert, ["admin","admin@example.com",md5("admin123456")])
                //db.run(insert, ["user","user@example.com",md5("user123456")])
                console.log("DB - Created.");
            }
        });  
    }
});


module.exports = db;