//const QUERY = require('./query');
const SCHEDULE = require("node-schedule");
const MONGOOSE = require('mongoose');
const MOMENT = require("moment");
const GoogleSpreadsheet = require("google-spreadsheet");
const ASYNC = require('async');

const GOOGLE = require("./secret.json");
const SHEETS = require("./sheets.json");
const USERS = require('./users.js');
const ASSIGNMENTS = require('./assignments.js');

MONGOOSE.model("User",USERS);
MONGOOSE.model("Assignment",ASSIGNMENTS);
const dbPath = 'mongodb://localhost/userDB';
const TODAY = MOMENT().startOf('day').toISOString();
const EOD= MOMENT().endOf('day').toISOString();

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet(SHEETS.sheet_id);
var sheet;
var db;
var USER;
/**
 * Connects to database using Moongoose. note: since we are connecting and disconnecting to mongoDB
 * many times and only when the project is running there is an instantiation of a new connection and
 * scheemas each time in order to reduce connections.  
 * @param  {Function} callback [description]
 */
const connectDB = function connectDB(callback) {
  db = MONGOOSE.createConnection(dbPath, { useMongoClient: true },function(err){callback()});
	USER = db.model('User',USERS);
  ASSIGNMENT = db.model('Assignment',ASSIGNMENTS);
	db.once('open', function() {
   	console.log("ConnectDB: Connected");

       callback();
  });

};

/**
 * Sets authorization for Google spreadsheet using Service Account Auth.
 * @param {Function} callback [description]
 */
const setAuth = function setAuth(callback) {
  doc.useServiceAccountAuth(GOOGLE, callback);
  console.log("SetAtuh: Gooogle Connected");
};

const createOne = function createOne(callback){
  ASSIGNMENT.create({title: "Hello", dueDate: Date.now, completed: false, userId: "59c9c07962b78aed5257fd06", dateCreated: Date.now});
}

/**
 * Gets Information about the google Worksheet.
 * @param  {Function} callback [description]
 */
const getSheets = function getInfoAndWorksheets(callback) {
  doc.getInfo(function (err, info) {
      sheet = info.worksheets[0];
      console.log("Get G-Worksheets")
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
function appendRows( assignmentsCreated, assignmentsCompleted, userCount, callback)
{
		console.log("AppendRows");
		var date = new Date().toISOString().substring(0,10);
		sheet.addRow({
			date: date,
			tasks_created_today: assignmentsCreated,
			tasks_completed_today: assignmentsCompleted,
			number_of_users: userCount
		}, function(err, row){
			callback();
		});
};





const tasksCreatedToday = function tasksCreatedToday(callback){
  ASSIGNMENT.count({dateCreated: {"$gte": TODAY, "$lt": EOD} }, function (err, assignmentsCreated) {
    console.log("TasksCreatedToday: DB # of task created today:"+assignmentsCreated)
    callback(null, assignmentsCreated);
  })
}

const tasksCompletedToday = function tasksCompletedToday(assignmentsCreated, callback) {
  ASSIGNMENT.count({$and: [ {dateCreated: {"$gte": TODAY, "$lt": EOD} }, {completed: true} ]}, function (err, assignmentsCompleted) {
    console.log("TasksCompletedToday: DB # of task completed today:"+assignmentsCompleted)
		callback(null, assignmentsCreated, assignmentsCompleted);
  })
}

/**
 * find all users.
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
const findAllUsers = function findAllUsers(assignmentsCreated, assignmentsCompleted, callback) {
  USER.count({}, function(err, userCount) {
		console.log("FindAll: DB # of users:",userCount);
		callback(null, assignmentsCreated, assignmentsCompleted, userCount);
	})
}

/**
 * A asynchronous series.
 */
var series = function() {
  console.log("     Running");
	ASYNC.waterfall([
		connectDB,
		setAuth,
		getSheets,
    tasksCreatedToday,
    tasksCompletedToday,
    findAllUsers,
    appendRows
    ],
  function (err, results) {
    if (err) {
      console.log('Error: ' + err);
    }

		MONGOOSE.disconnect(function(){
      console.log("DB disconnect");
    });

  });
};

//This schedule runs every {currently 1 min}, it calls the series function.
var sched = SCHEDULE.scheduleJob('*/1 * * * *',series);
