var connection = require('../../../configuration/database/connection');
var _ = require('lodash');
module.exports = function (req, res, next) {
    var query = 'select * from users where user_id="' + req.session.userId + '"';
    connection.query(query, function(err, data){
        if(err && !data[0]) {
            return next(true);
        }
        res.status(200).send(data[0]);
    })
};