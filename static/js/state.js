var myApp = angular.module('myApp', ['ui.router']);
myApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to main
  $urlRouterProvider.otherwise("/");
  //
  // Now set up the states

  $stateProvider
    .state('index', {
      url: "/",
      templateUrl: "php/main.php"
    })
    .state('remote', {
      url: "/remote",
      templateUrl: "php/controller.php"
    });
});

myApp.config(["$locationProvider", function($locationProvider) {
  $locationProvider.html5Mode(true);
}]);


