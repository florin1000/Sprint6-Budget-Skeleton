(function () {
    var myapp = angular.module("app", ['ngRoute'])
        .controller("AddTransController", function ($scope) {


        })
        .controller("ShowTransController", function ($scope, Queries) {
            $scope.transactions = [];
            var total;
            Queries.getMonthlyTransactions(moment().format('YYYY-MM')).then(function (items) {
                $scope.transactions = items;
                $scope.budget = getBalance(items);
            });
            $scope.delTrans = function (id) {
                Queries.del(id).then(function (items) {
                    Queries.getMonthlyTransactions(moment().format('YYYY-MM')).then(function(items) {
                        $scope.transactions = items;
                        $scope.budget = getBalance(items);
                    });
                });
            };

            $scope.getBalance = function (items) {
                total = 0;
                transactions.forEach(function (item) {
                    total += item.amount;
                });
                return total;
            };
        })
        .config(function ($locationProvider, $routeProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
            //http://viralpatel.net/blogs/angularjs-routing-and-views-tutorial-with-example/
            $routeProvider.when('/', {
                templateUrl: 'sheets/home.html',
                controller: 'ShowTransController'
            }).when('/receive', {
                templateUrl: 'sheets/addtransaction.html',
                controller: 'AddTransController' //Atentie la numele controlerului
            }).when('/spend', {
                templateUrl: 'sheets/addtransaction.html',
                controller: 'AddTransController'
            }).otherwise({redirectTo: '/'})
        })
        .factory('Queries', function ($http, $q) {
            return (function () {
                var url = 'http://server.godev.ro:8080/api/dragos/transactions';
                var getMonthlyTransactions = function (month) {
                    return $q(function (resolve, reject) {
                        $http({
                            url: url + '?month=' + month
                        }).then(
                            function (xhr) {
                                if (xhr.status == 200) {
                                    resolve(xhr.data);
                                }
                                else {
                                    reject();
                                }
                            }, reject
                        );
                    });
                };

                var del = function (id) {
                    return $q(function (resolve, reject) {
                        $http({
                            method: 'DELETE',
                            url: url + '/' + id
                        }).then(
                            function (xhr) {
                                if (xhr.status == 204) {
                                    resolve();
                                }
                                else {
                                    reject();
                                }
                            }, reject
                        );
                    });
                };

                var add = function (data) {
                    return $q(function (resolve, reject) {
                        $http({
                            method: 'POST',
                            url: url,
                            data: JSON.stringify(data)
                        }).then(
                            function (xhr) {
                                if (xhr.status == 201) {
                                    resolve();
                                }
                                else {
                                    reject();
                                }
                            }, reject
                        );
                    });
                };
                return {
                    getAll: getMonthlyTransactions,
                    del: del,
                    add: add
                };
            })();
        });
})();