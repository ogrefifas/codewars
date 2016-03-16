var connection = require('../../../configuration/database/connection');
var _ = require('lodash');
module.exports = function (req, res, next) {

    var checkFilter = function (filter) {
        var selectOptionsFilter = {};
        selectOptionsFilter.where = [];
        selectOptionsFilter.join = [];
        selectOptionsFilter.sort = "";
        selectOptionsFilter.sortBy = "";

        if(!filter) {
            return selectOptionsFilter;
        }

        if (req.session.authorized && filter.group) {
            switch (filter.group) {
                case 'own':
                    selectOptionsFilter.where.push(' tasks.user_id = "' + req.session.userId + '" ');
                    break;
                case 'favorite':
                    selectOptionsFilter.where.push(' favorites_tasks.user_id = "' + req.session.userId + '" ');
                    selectOptionsFilter.join.push(' join favorites_tasks using(task_id) ');
                    break;
                case 'later':
                    selectOptionsFilter.where.push(' later_tasks.user_id = "' + req.session.userId + '" ');
                    selectOptionsFilter.join.push(' join later_tasks using(task_id) ');
                    break;
                default:
                    break;
            }
        }

        if (!_.isEmpty(filter.levels)) {
            selectOptionsFilter.where.push(' level in (' + filter.levels.join(',') + ') ');
        }

        if (!_.isEmpty(filter.types)) {
            filter.types = '"' + filter.types.join('","') + '"';
            selectOptionsFilter.where.push(' types.type_name in (' + filter.types + ') ');
            selectOptionsFilter.join.push(' join tasks_types using (task_id) join types using(type_id) ');
        }


        if (filter.sortBy) {
            selectOptionsFilter.sortBy = (filter.sortBy == 'name' || filter.sortBy == 'level') ? filter.sortBy : 'add_date';
            selectOptionsFilter.sortBy = ' order by ' + selectOptionsFilter.sortBy + ' ';
        }

        if (filter.sortOrder && filter.sortBy) {
            selectOptionsFilter.sort = (filter.sortOrder == 'A-Z') ? 'ASC' : 'DESC';
        }

        selectOptionsFilter.where = (_.isEmpty(selectOptionsFilter.where)) ? " " :  "where " + selectOptionsFilter.where.join(' and ');
        selectOptionsFilter.join = (_.isEmpty(selectOptionsFilter.join)) ? " " : selectOptionsFilter.join.join(' ');

        return selectOptionsFilter;
    };
    var getTasksQuering = function(filter) {
        var query = 'SELECT tasks.task_id as taskId, tasks.name as name, level, description, language, add_date as addDate' +
            ' from tasks' + (filter.join || ' ') +
            (filter.where || ' ') + (filter.sortBy || ' ') + (filter.sort || ' ') +
            ' LIMIT 21 OFFSET ' + (req.body.fromItem || 0) + ' ';

        connection.query(query, function(err,data) {
            if(err) {
                return next(true);
            }
            res.status(200).send(data);
        });
    };

    getTasksQuering( checkFilter(req.body.filter) );

};