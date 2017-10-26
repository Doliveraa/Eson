//const QUERY = require('./query');
const SCHEDULE = require("node-schedule");
const MONGOOSE = require('mongoose');
const GoogleSpreadsheet = require("google-spreadsheet");
const GOOGLE = require("./secret.json");
const SHEETS = require("./sheets.json");
const dbPath = 'mongodb://localhost/userDB';
const async = require('async');
const USERS = require('./users.js');
MONGOOSE.model("User",USERS);

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet(SHEETS.sheet_id);
var sheet;
var db;
var USER;
/**
 * Connects to database using Moongoose.
 * @param  {Function} callback [description]
 */
const connectDB = function connectDB(callback) {
  db = MONGOOSE.createConnection(dbPath, { useMongoClient: true },function(err){callback()});
	USER = db.model('User',USERS);
	db.once('open', function() {
   	console.log("DB connected");
       callback();
  });

};

/**
 * Sets authorization for Google spreadsheet using Service Account Auth.
 * @param {Function} callback [description]
 */
const setAuth = function setAuth(callback) {
  doc.useServiceAccountAuth(GOOGLE, callback);
  console.log("google connect");
};

/**
 * Gets Information about the google Worksheet.
 * @param  {Function} callback [description]
 */
const getSheets = function getInfoAndWorksheets(callback) {
  doc.getInfo(function (err, info) {
      console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
      sheet = info.worksheets[0];
      console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount);
      callback();
  });
};

/**
 * Get rows using a google sheet.
 * @param  {Function} callback [description]
 */
const getRows = function getRows(callback) {
  sheet.getRows({
    offset: 1
  }, function(err, rows){
    var length =rows.length-1;
    var date = new Date();
    rows[length].date = date.toISOString().substring(0,10);
    rows[length].save();
    callback();
  });
};

/**
 * Append a row to a google sheet.
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function appendRows( userCount, callback)
{
		console.log("inside append rows,users count", resuluts[0]);
		var date = new Date().toISOString().substring(0,10);
		sheet.addRow({
			date: date,
			tasks_created_today: "place holder1",
			tasks_completed_today: "place holder 2",
			number_of_users: userCount
		}, function(err){
			if(err)
				console.log("error append rows callback fxn", err);
				throw err;
			callback();
		});
};



/**
 * find all users.
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
const findAll = function findall(callback) {
  USER.count({}, function(err, userCount) {
		console.log("Number of users:",userCount);
		callback(null, userCount);
	})
}

/**
 * A asynchronous series.
 */
var series = function() {
	console.log("		Runnning  ")
  async.series([
		connectDB,
		setAuth,
		getSheets,
		findAll],
  function (err, results) {
    if (err) {
      console.log('Error: ' + err);
    }

		//in this series finall is index 3 and the callback with
		//the usercount adds usercount to index 3s result
		console.log(results[3]);

		MONGOOSE.disconnect(function(){
      console.log("disconnected");
    });

  });
};

// This schedule runs every {currently 1 min}, it calls the series function.
var sched = SCHEDULE.scheduleJob('*/1 * * * *',series);
