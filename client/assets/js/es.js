// We define an EsConnector module that depends on the elasticsearch module.     
var EsConnector = angular.module('EsConnector', ['elasticsearch']);

// Create the es service from the esFactory
EsConnector.service('es', function (esFactory) {
  return esFactory({ host: 'http://apikey:DEVELOPMENT-Indexer@api.exiletools.com' });
});


EsConnector.controller('ExileToolsHelloWorld', function($scope, $http, es) {
  // Default
  $scope.searchInput = "2haxe";
  $scope.queryString = "";
  
  $scope.termsMap = {};

  var mergeIntoTermsMap = function(res){
          console.info(res.data);
          var ymlData = jsyaml.load(res.data);
          jQuery.extend($scope.termsMap, ymlData);
        }
  
  $http.get('terms/itemtypes.yml').then(mergeIntoTermsMap);
  $http.get('terms/gems.yml').then(mergeIntoTermsMap);
  $http.get('terms/buyouts.yml').then(mergeIntoTermsMap);
  $scope.doSearch = function() {
          $scope.Response = null;
          console.log(terms);
          var searchQuery = parseSearchInput($scope.termsMap, $scope.searchInput);
          console.log("searchQuery=" + searchQuery);
          $scope.queryString = searchQuery;
          
          es.search({
          index: 'index',
          body: {
            "sort": [
              {
                "shop.updated": {
                  "order": "desc"
                }
              }
            ], 
            "query": {
                "query_string": {
                   "default_operator": "AND",
                   "query": searchQuery
                }
            },
            // Is this faster?
            /*"query": {
              "filtered": {
                "query": {
                    "query_string": {
                       "query": $scope.searchInput
                    }
                }
              }
            },*/
            size:100
          }
          }).then(function (response) {
            $scope.Response = response;
          }, function (err) {
            console.trace(err.message);
          });
  }
});

// Custom Directive
EsConnector.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
