
var terms = {};
function parseSearchInput(_terms, input) {
	terms = _terms;

	// capture literal search terms (LST) like name="veil of the night"
	var regex = /([^\s]*=\".*?\")/g;
	var lsts = input.match(regex);
	lsts = expandLsts(lsts);
	var _input = input.replace(regex, 'LST');
	var queryStr = parseSearchInputTokens(_input);
	var i = 0;
	var _queryStr = queryStr.replace('LST', function (match) {
		var lst = lsts[i];
		i++;
		return lst;
	});
	return _queryStr;
	return parseSearchInputTokens(input);
}

function expandLsts(lsts) {
	return lsts;
}

function parseSearchInputTokens(input) {
	var tokens = input.split(" ");
	var queryTokens = [];
	for (i in tokens) {
		var token = tokens[i];
		var evaluatedToken = token;
		if ( token != "OR" && token != "AND" && token !="LST" ) {
			evaluatedToken = evalSearchTerm(token);
			if (evaluatedToken && hasBackTick(evaluatedToken)) {
				evaluatedToken = parseSearchInputTokens(evaluatedToken);
			}
		}
		queryTokens.push(evaluatedToken);
	}
	var queryString = queryTokens.join(" ");
	return queryString;
}

function evalSearchTerm(token) {
	var result = "";
	for (regex in terms) {
		if (terms.hasOwnProperty(regex)) {
			var rgex = new RegExp('^' + regex + '$', 'i');
			var cleanToken = removeParensAndBackTick(token);
			var foundMatch = rgex.test(cleanToken);
			if (foundMatch) {
				result = terms[regex].query;
				// apply any captured regex groups
				result = cleanToken.replace(rgex, result);
				// escape spaces for elasticsearch
				result = escapeField(result);
				if (hasOpenParen(token))  result = '(' + result;
				if (hasCloseParen(token)) result = result + ')';
				break;
			}
		}
	}
	return result;
}

function removeParensAndBackTick(token) {
	var _token = token.replace(/[\(\)`]/g, "");
	return _token;
}

function hasOpenParen(token) {
	return token.startsWith('(');
}

function hasCloseParen(token) {
	return token.endsWith(')');
}

function hasBackTick(token) {
	return token.indexOf('`') != -1;
}

function escapeField(result) {
	var res = result;
	var delimIdx = result.indexOf(':');
	if (delimIdx != -1) {
		var field = res.substr(0, delimIdx);
		res = res.replace(field, field.replace(/\s/g, '\\ '));
	}
	return res;
}

(function() {
	'use strict';

	var appModule = angular.module('application', [
		'elasticsearch',
		'ui.router',
		'ngAnimate',

		//foundation
		'foundation',
		'foundation.dynamicRouting',
		'foundation.dynamicRouting.animations'
	]);

	appModule.config(config);
	appModule.run(run);

	config.$inject = ['$urlRouterProvider', '$locationProvider'];

	function config($urlProvider, $locationProvider) {
		$urlProvider.otherwise('/');

		$locationProvider.html5Mode({
			enabled:false,
			requireBase: false
		});

		$locationProvider.hashPrefix('!');
	}

	function run() {
		FastClick.attach(document.body);
	}

	// Create the es service from the esFactory
	appModule.service('es', function (esFactory) {
		return esFactory({ host: 'http://apikey:07e669ae1b2a4f517d68068a8e24cfe4@api.exiletools.com' }); // poeblackmarketweb@gmail.com
	});

	appModule.controller('SearchController', ['$scope', '$http', 'es', function($scope, $http, es) {
		// Default
		$scope.searchInput = "gloves 50life";
		$scope.queryString = "";

		$scope.termsMap = {};

		var mergeIntoTermsMap = function(res){
			var ymlData = jsyaml.load(res.data);
			jQuery.extend($scope.termsMap, ymlData);
		}

		$http.get('assets/terms/itemtypes.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/gems.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/mod-ofs.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/mod-def.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/mod-vaal.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/attributes.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/sockets.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/buyout.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/uniques.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/basetypes.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/currencies.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/leagues.yml').then(mergeIntoTermsMap);
		$http.get('assets/terms/seller.yml').then(mergeIntoTermsMap);
		
		$scope.doSearch = function() {
			$scope.Response = null;
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
				//console.log(JSON.stringify($scope.Response));
			}, function (err) {
				console.trace(err.message);
			});
		}


		$scope.getSocketClasses = function(x) {
			var sockets = [];
			var colors = x.split('-').join('').split('');
			for (var i = 0; i < colors.length; i++){
				var cssClasses;
				switch (i) {
					case 0 : cssClasses = 'socketLeft'; break;
					case 1 : cssClasses = 'socketRight'; break;
					case 2 : cssClasses = 'socketRight middle'; break;
					case 3 : cssClasses = 'socketLeft middle'; break;
					case 4 : cssClasses = 'socketLeft bottom'; break;
					case 5 : cssClasses = 'socketRight bottom'; break;
				}
				switch (colors[i]) {
					case 'W' : cssClasses += ' socketWhite'; break;
					case 'R' : cssClasses += ' socketRed'; break;
					case 'G' : cssClasses += ' socketGreen'; break;
					case 'B' : cssClasses += ' socketBlue'; break;
				}
				sockets[i] = cssClasses;
			}
			return sockets;
		}
		// probably way to complicated, but I was tired.
		$scope.getSocketLinkClasses = function(x) {
			var groups = x.split('-');
			var pointer = 0;
			var pos = [];

			for (var i = 0; i < groups.length; i++) {
				var count = groups[i].length - 1;

				try {
					pointer += groups[i - 1].length;
				} catch (err){}

				if(count > 0) {
					for (var j = 0; j < count; j++) {
						var cssClasses;
						switch (pointer+j) {
							case 0 : cssClasses = 'socketLinkCenter'; break;
							case 1 : cssClasses = 'socketLinkRight'; break;
							case 2 : cssClasses = 'socketLinkCenter middle'; break;
							case 3 : cssClasses = 'socketLinkLeft middle'; break;
							case 4 : cssClasses = 'socketLinkCenter bottom'; break;
						}
						pos.push(cssClasses);
					}
				}
			}
			return pos;
		}
	}]);

	// Custom filters
	appModule.filter("currencyToCssClass", () => str => {
		var currencyCssClassMap = new Map([
			["Chaos Orb", "chaos-orb"],
			["Exalted Orb", "exalt-orb"]
		]);
		var result = currencyCssClassMap.get(str);
		if(!result) result = str;
		return result;
	});

	// Custom Directive
	appModule.directive('myEnter', function () {
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
})();
