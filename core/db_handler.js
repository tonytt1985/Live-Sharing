/**
 * Created with JetBrains WebStorm.
 * User: ttran03
 * Date: 6/28/13
 * Time: 9:52 AM
 * To change this template use File | Settings | File Templates.
 */

var mysql = require('mysql');
/** @constructor
 *
 */
function dbHandler(){
    this.dbConfig = new require("./config").Config("DATABASE");
    this.client = null;
    this.dbConnect();
};
dbHandler.prototype.dbConnect = function(){
    var _this = this;
    this.client = mysql.createConnection(_this.dbConfig);
    this.client.on('error', function (err) {
        console.log(err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST')
            _this.dbConnect();
    });
};
/**
 * Execute mysql query
 * @param {String} query Query string will be executed.
 * @param {Array} params Contain values will be inserted to query string.
 * @param {Function} cb  Function will be executed after Query has finished
 */
dbHandler.prototype.executeQuery = function(queryString, params, cb){
    this.client.query(queryString, params, function(error, results){
        if(typeof(cb) == 'function')
            cb(error, results);
     });
};
module.exports = dbHandler;
