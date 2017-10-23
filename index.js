//const QUERY = require('./query');
const SCHEDULE = require("node-schedule");
const MONGOOSE = require('mongoose');
var GoogleSpreadsheet = require("google-spreadsheet");
const GOOGLE = require("./secret.json");
const SHEETS = require("./sheets.json");
const dbPath = 'mongodb://localhost/userDB';
var async = require('async');



// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet(SHEETS.sheet_id);
var sheet;

async.series([
  function setAuth(callback) {
    doc.useServiceAccountAuth(GOOGLE, callback);
  },
  function getInfoAndWorksheets(callback) {
    doc.getInfo(function (err, info) {
        console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
        sheet = info.worksheets[0];
        console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount);
        callback();
    });
  },
  function getRows(callback) {
    sheet.getRows({
      offset: 1
    }, function(err, rows){
      var length =rows.length-1;
      var date = new Date();
      rows[length].date = date.toISOString().substring(0,10);
      rows[length].save();

      callback();

    });
  },
  function appendRows(callback) {
    var date = new Date().toISOString().substring(0,10);
    sheet.addRow({
      date: date,
      tasks_created_today: "1",
      tasks_completed_today: "2",
      number_of_users: "3"
    }, function(err){
      ///
      callback();
    });
  }
],
function (err) {
  if (err) {
    console.log('Error: ' + err);
  }
});
