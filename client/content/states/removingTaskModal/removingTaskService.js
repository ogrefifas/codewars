app.factory('removingTaskService', function($http) {
    return {
        removeTask : function (id) {
            return $http.delete('/task/' + id);
        }
    }
});