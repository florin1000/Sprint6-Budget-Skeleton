(function() {
    var app = angular.module('RouteWorkshop', ['ngRoute']);
    var pages = [
        {name: 'Home', url: '', ctrl: 'HomeCtrl'},
        {name: 'Page 1', url: 'page1'},
        {name: 'Page 2', url: 'page2'}
    ];

    //configure angular app
    app.config(function($locationProvider, $routeProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        angular.forEach(pages, function(page) {
            $routeProvider.when('/' + page.url, {
                templateUrl: 'pages/' + (!page.url ? 'index' : page.url) + '.html',
                controller: page.ctrl || 'DummyCtrl'
            })
        });

        $routeProvider.otherwise({
            templateUrl: 'pages/index.html',
            controller: "HomeCtrl"
        });
    });

    //create controllers
    app.controller('DummyCtrl', angular.noop);

    app.controller('HomeCtrl', function($scope, TransactionStore) {
        $scope.transactions = [];

        TransactionStore.getTransactionsInMonth(moment().format('YYYY-MM')).then(function(items) {
            $scope.transactions = items;
        });
    });

    app.controller('NavCtrl', function($scope, $location) {
        $scope.pages = pages;

        $scope.linkClass = function(linkUrl) {
            return $location.path() == '/' + linkUrl ? 'selected' : '';
        };
    });

    //create services
    app.factory('TransactionStore', function($http, $q) {
        return (function() {
            var URL = 'http://server.godev.ro:8080/api/dragos/transactions';

            var getTransactionsInMonth = function(month) {
                return $q(function(resolve, reject) {
                    $http({url: URL + '?month=' + month})
                        .then(
                            function(xhr) {
                                if (xhr.status == 200) {
                                    resolve(xhr.data);
                                } else {
                                    reject();
                                }
                            },
                            reject
                        );
                });
            };

            var add = function(data) {
                return $q(function(resolve, reject) {
                    $http({
                        url: URL,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify(data)
                    })
                        .then(
                            function(xhr) {
                                if (xhr.status == 201) {
                                    resolve(xhr.data);
                                } else {
                                    reject();
                                }
                            },
                            reject
                        );
                });
            };

            var del = function(id) {
                return $q(function(resolve, reject) {
                    $http({
                        url: URL + '/' + id,
                        method: 'DELETE'
                    })
                        .then(
                            function(xhr) {
                                if (xhr.status == 204) {
                                    resolve();
                                } else {
                                    reject();
                                }
                            },
                            reject
                        );
                });
            };

            return {
                getTransactionsInMonth: getTransactionsInMonth,
                add: add,
                delete: del
            };
        })();
    });
})();