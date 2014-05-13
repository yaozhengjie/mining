'use strict';
var dashboard = angular.module('miningApp.dashboard', [])
  .constant('PROTOCOL', window.protocol)
  .filter('replaceUnderToSpace', function() {
    return function(input) {
      input = input || '';
      return input.replace(/_/g, ' ');
    };
  })
  .directive('resize', function ($window, $rootScope) {
    return {
      link: function (scope, elem, attr){
        scope.__width = 0;

        scope.$watch('__width', function (newValue, oldValue) {
            $rootScope.$emit('WINDOW_RESIZE');
        });
        scope.$watch(function(){
          scope.__width = elem.width();
        });
        var win = angular.element($window);
        win.bind("resize",function(e){
          $rootScope.$emit('WINDOW_RESIZE');
        });
        elem.bind('resize', function () {
            $rootScope.$emit('WINDOW_RESIZE');
            scope.$apply();
        });
      }
    }
  })
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/dashboard/:slug', {
        templateUrl: 'assets/app/views/dashboard_detail.html',
        controller: 'DashboardDetailCtrl',
        resolve: {
          'current_dashboard': ['Dashboard', '$route', '$http',
            function(Dashboard, $route, $http){
              if($route.current.params.slug){
                return $http.get('/api/dashboard/'+$route.current.params.slug+'?full=' + true);
                // return Dashboard.getFull({'slug':$route.current.params.slug});
              }else{
                AlertService.add('error', 'Error!');
                return '';
              }
            }
          ]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(['$rootScope', 'Dashboard', 'AlertService',
    function($rootScope, Dashboard, AlertService){
      $rootScope.dashboards = Dashboard.query();
      $rootScope.$on('$routeChangeStart', function (ev, to, toParams, from, fromParams) {
        AlertService.clearTemporarios();
      });
    }
  ])
;