//const QUERY = require('./query');
const SCHEDULE = require("node-schedule");
const MONGOOSE = require('mongoose');
const GoogleSpreadsheet = require("google-spreadsheet");
const Credentials = require("./secret.json");

var dbPath = 'mongodb://localhost/userDB';


var createSpreadsheet = function() {
  var gDoc = new GoogleSpreadsheet('ADD LONG ID FROM SHEETS URL');
  var gSheet = "";
}

var query = function () {

    connectDB();
    findAll();
    setTimeout( dissconnectDB, 3000);
}

var dissconnectDB = function () {
    MONGOOSE.disconnect();
    console.log("disconnect");
}

var createWorkBook = function () {
    XLSX.writeFile(workbook, 'tracking.xlsx');
}

var connectDB = function () {
    var db = MONGOOSE.connect(dbPath, { useMongoClient: true });
    db.on('error', console.error.bind(console, 'connection error: '));
    db.once('open', function () {
        console.log("success")
    });
}

var findAll = function () {

    USER.find({}, function (err, users) {
        if (!err) {
            console.log(users);
        } else { throw err; }
    });

}

var sched = SCHEDULE.scheduleJob('*/1 * * * *', query)
