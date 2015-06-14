var myApp = angular.module('myApp', ['ui.router']).run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", console.log.bind(console));
});

myApp.controller("body", ["$scope",'$state', function($scope,$state){
  $scope.remoteChan = function(chan){
      $state.go('remote.chan', {channelId: chan});
    }
  $scope.checkIt = function(){
    checkId();
  }
  $scope.isPlay = function(){
    return ($state.current.name == "channel")
  }
}]);
myApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to main
  //$urlRouterProvider.when("/remote/(.*)","/remote");
  $urlRouterProvider.otherwise("/");
  //
  // Now set up the states
   
  $stateProvider
    .state('main', {
      url: "/",
      views: {
        'navbar':{
            templateUrl: '/php/fp-nav.php'
          },
          'main':{
              templateUrl: "/php/fp-main.php"
          }
      },
      resolve: {
        fixBody : function(){
          $("body").removeClass("channelpage");
          
        }
      }
    })
    .state('remote', {
      url: "/remote",
      views: {
          'navbar':{
            templateUrl: '/php/fp-nav.php'
          },
          'main':{
              templateUrl: "/php/controller.php"
          }
      }
    })
    .state('remote.null', {
      url: "/",
      views: {
          'navbar':{
            templateUrl: '/php/fp-nav.php'
          },
          'main':{
              templateUrl: "/php/controller.php"
          }
      }
    })
    .state('remote.chan', {
      url: "/{channelId}",
      views: {
          'navbar':{
            templateUrl: '/php/fp-nav.php'
          },
          'main':{
              templateUrl: "/php/controller.php"
          }
      }
    })
    .state('remote.chan.null', {
      url: "/",
      views: {
          'navbar':{
            templateUrl: '/php/fp-nav.php'
          },
          'main':{
              templateUrl: "/php/controller.php"
          }
      }
    })
    .state('channel', {
      url: "/{channelName}",
      views: {
        'navbar': {
              templateUrl: "/php/play-nav.php"
        },
        'main':{
          templateUrl: "/php/play-main.php"
        }
      },
      resolve: {
        fixBody : function(){
          $("body").addClass("channelpage");
        }
      }
    })
    .state('channel.null', {
      url: "/",
      views: {
        'navbar': {
              templateUrl: "/php/play-nav.php"
        },
        'main':{
          templateUrl: "/php/play-main.php"
        }
      },
      resolve: {
        fixBody : function(){
          $("body").addClass("channelpage");
        }
      }
    })
});

myApp.config(["$locationProvider", function($locationProvider) {
  $locationProvider.html5Mode(true);
}]);


