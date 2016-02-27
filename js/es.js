// We define an EsConnector module that depends on the elasticsearch module.     
var EsConnector = angular.module('EsConnector', ['elasticsearch']);

// Create the es service from the esFactory
EsConnector.service('es', function (esFactory) {
  return esFactory({ host: 'http://apikey:DEVELOPMENT-Indexer@api.exiletools.com' });
});


EsConnector.controller('ExileToolsHelloWorld', function($scope, es) {
  // Default
  $scope.searchInput = "2haxe";
  $scope.queryString = "";
  // attributes.baseItemType:Armour AND shop.updated:>1456191110199
  $scope.doSearch = function() {
          $scope.Response = null;
          console.log(terms);
          var searchQuery = parseSearchInput($scope.searchInput);
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