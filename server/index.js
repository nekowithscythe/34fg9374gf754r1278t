const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const multer = require('multer');

const PORT = parseInt(process.env.PORT || '3001');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '500000000');
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const CORS_WHITELIST = process.env.CORS_WHITELIST || "http://localhost:" + PORT;
const SIMULATE_ERRORS = process.env.SIMULATE_ERRORS || 'no';


console.log("PORT: " + PORT);
console.log("MAX_FILE_SIZE: " + MAX_FILE_SIZE);
console.log("UPLOAD_PATH: " + UPLOAD_PATH);
console.log("CORS_WHITELIST: " + CORS_WHITELIST);
console.log("SIMULATE_ERRORS: " + SIMULATE_ERRORS);
console.log("------");


var fileupload = multer({ dest: UPLOAD_PATH });
const cors = require("cors");
const db = require("./database.js")

const sql_insert = 'INSERT INTO videos (title, videodate, location, filename, origfilename, mimetype, size, duration) VALUES (?,?,?,?,?,?,?,?)';
const sql_select_all = 'SELECT id, title, videodate, location, filename, origfilename, mimetype, size, duration FROM videos';
const sql_select_one = 'SELECT id, title, videodate, location, filename, origfilename, mimetype, size, duration FROM videos WHERE filename = ?';

//Add the client URL to the CORS policy
const whitelist = [CORS_WHITELIST];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    };
  },
  credentials: true
};
app.use(cors(corsOptions));

// for parsing application/json
app.use(express.json()); 

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

app.use(express.static(path.join(__dirname, "..", "client", "build")));
//app.use(express.static('public'));

app.post('/api/upload', fileupload.single("file_video"), function (req, res) {
  console.log("upload triggered.");
  //console.log(req.body);
  //console.log(req.file);

  var file_title = null;
  var file_datetime = null;
  var file_location = null;
  var file_duration = null;

  var errors = [];
  if (SIMULATE_ERRORS !== 'no') {
    errors.push("***Simulated error for purpose of demo.***");
  }

  if (!req.body) { //No form data received
    errors.push("No form data received");
  } else {

    if (!req.body.file_title) { //No title received
      errors.push("No title received ('file_title')");
    } else {
      file_title = req.body.file_title.trim();
      if (file_title.length > 7 && file_title.length < 101) { //Title length limit
        // OK
      } else {
        errors.push("Title must be between 8 and 100 characters");
      }
    }

    if (!req.body.file_datetime) { //No datetime received
      errors.push("No datetime received ('file_datetime')");
    } else {
      file_datetime = req.body.file_datetime.trim();
      //Source: https://stackoverflow.com/a/3143231
      var dateregex = /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)$/;
      var matchdata = file_datetime.match(dateregex);
      if (matchdata) { //Datetime format check
        // OK
      } else {
        errors.push("file_datetime must be in ISO 8601 format (YYYY-MM-DDTHH:MM)");
      }
    }

    if (!req.body.file_location) { //No location received
      file_location = '';
    } else {
      file_location = req.body.file_location.trim();
      if (file_location.length == 0) { //Location length limit
        // OK
      } else  {
        var intregex = /^(\d{6})$/;
        var matchdata = file_location.match(intregex);
        if (matchdata) { //Location format check
          // OK
        } else {
          errors.push("file_location must be a 6-digit integer");
        }
      }
    }

    if (!req.body.file_duration) { //No location received
      file_duration = 0;
    } else {
      file_duration = req.body.file_duration.trim();
      if (file_duration.length == 0) { //Location length limit
        file_duration = 0;
      } else  {
        var intregex = /^(\d+)$/;
        var matchdata = file_duration.match(intregex);
        if (matchdata) { //Location format check
          file_duration = parseInt(file_duration);
        } else {
          errors.push("file_duration must be an integer");
        }
      }
    }

  }

  if (!req.file) { //No file received
    errors.push("No file received");
  } else {
    if (req.file.size > MAX_FILE_SIZE) { //File size limit
      errors.push("File size larger than " + MAX_FILE_SIZE + " bytes");
    } else if (!req.file.mimetype.includes("video")) { //File type limit
      errors.push("Only video files are allowed (" + req.file.mimetype + ")");
    }
    if (errors.length > 0) { //Delete file if any errors are encountered.
      fs.unlink(req.file.path, (err) => {
        if (err) {
            throw err;
        }
      });
    }
  }

  if (errors.length > 0) {
    res.statusCode = 400
    res.send({ 
      msg: "Invalid Post", 
      errors: errors 
    })
  } else {

    db.run(sql_insert, [
      file_title,
      file_datetime,
      file_location,
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      file_duration
    ], (err) => {
      if (err) {
        errors.push("Failed to insert into DB");
      }

      if (errors.length > 0) {
        res.statusCode = 400
        res.send({ 
          msg: "Invalid Post", 
          errors: errors 
        })
      } else {
      
        res.statusCode = 200
        res.send({ 
          msg: "Success"
        });
        /* db.all(sql_select_all, [], (err, rows) => {
          if (err) {
            throw Error("DB: Failed to " + err.message);
          }
          rows.forEach((row) => {
            console.log([row.title, row.videodate, row.location, row.filename, row.origfilename, row.mimetype, row.size]);
          });
        }); */
      }

    });

    
  }
});

app.get('/api/list', (req, res) => {
  console.log("list triggered.");
  var errors = [];
  if (SIMULATE_ERRORS !== 'no') {
    errors.push("***Simulated error for purpose of demo.***");
  }
  var data = [];

  db.all(sql_select_all, [], (err, rows) => {
    if (err) {
      throw Error("DB: Failed to " + err.message);
    }
    rows.forEach((row) => {
      data.push({
          title: row.title, 
          datetime: row.videodate, 
          location: row.location, 
          fileid: row.filename, 
          original_filename: row.origfilename, 
          mimetype: row.mimetype, 
          size: row.size,
          id: row.id,
          duration: row.duration
        });

      /* console.log([row.title, row.videodate, row.location, row.filename, row.origfilename, row.mimetype, row.size]);
      console.log(data); */
    });


    if (errors.length > 0) {
      res.statusCode = 400
      res.send({
        msg: "Failed to get data",
        errors: errors
      })
    } else {
      res.statusCode = 200
      var senddict = {
        msg: "Success",
        data: data
      };
      /* console.log("boo hoohoo");
      console.log("senddict: " + senddict);
      console.log("boo hoohoo"); */
      res.send(senddict);
    }


  });

  
});

app.get('/api/video/:fileid', (req, res) => {
  var fileid = req.params.fileid.trim();
  if (fileid.length > 10) { //Location length limit
    db.all(sql_select_one, [fileid], (err, rows) => {
      if (err) {
        throw Error("DB: Failed to " + err.message);
      }
      if (rows && rows.length > 0) {
        var filepath = path.join(__dirname, UPLOAD_PATH, rows[0].filename);
        console.log("Sending: (" + rows[0].origfilename + ") " + filepath);

        res.setHeader('Content-Disposition', 'attachment; filename=' + rows[0].origfilename);
        res.setHeader('Content-Transfer-Encoding', 'binary');
        res.setHeader('Content-Type', rows[0].mimetype);

        res.sendFile(filepath, (err) => {
          if (err) {
            console.log(err);
            throw Error("Failed to send file.");
            }
        });
      } else {
        res.statusCode = 404
        res.send('No such file.');
      }
    });
  } else {
    throw Error("Failed to get Video.");
  }
});

/* app.get('/', (req, res) => {
  res.send('Home!');
}); */


/* app.use(function (err, req, res, next) {
  // Check if the error is thrown from multer
  if (err instanceof multer.MulterError) {
    res.statusCode = 400
    res.send({ code: err.code })
  } else if (err) {
    // If it is not multer error then check if it is our custom error for FILE_MISSING
    if (err.message === "FILE_MISSING") {
      res.statusCode = 400
      res.send({ code: "FILE_MISSING" })
    } else {
      //For any other errors set code as GENERIC_ERROR
      res.statusCode = 500
      res.send({ code: "GENERIC_ERROR" })
    }
  }
}) */

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`GoveTech Challenge listening at http://localhost:${PORT}`);
});
