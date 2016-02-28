function parseSearchInput(e,r){terms=e;var n=/([^\s]*=\".*?\")/g,t=r.match(n);t=expandLsts(t);var a=r.replace(n,"LST"),s=parseSearchInputTokens(a),o=0,i=s.replace("LST",function(e){var r=t[o];return o++,r});return i}function expandLsts(e){return e}function parseSearchInputTokens(e){var r=e.split(" "),n=[];for(i in r){var t=r[i],a=t;"OR"!=t&&"AND"!=t&&"LST"!=t&&(a=evalSearchTerm(t),a&&hasBackTick(a)&&(a=parseSearchInputTokens(a))),n.push(a)}var s=n.join(" ");return s}function evalSearchTerm(e){var r="";for(regex in terms)if(terms.hasOwnProperty(regex)){var n=new RegExp("^"+regex+"$","i"),t=n.test(removeParensAndBackTick(e));if(t){r=terms[regex].query,r=e.replace(n,r),r=escapeField(r),hasOpenParen(e)&&(r="("+r),hasCloseParen(e)&&(r+=")");break}}return r}function removeParensAndBackTick(e){var r=e.replace(/[\(\)`]/g,"");return r}function hasOpenParen(e){return e.startsWith("(")}function hasCloseParen(e){return e.endsWith(")")}function hasBackTick(e){return-1!=e.indexOf("`")}function escapeField(e){var r=e,n=e.indexOf(":");if(-1!=n){var t=r.substr(0,n);r=r.replace(t,t.replace(/\s/g,"\\ "))}return r}var terms={};!function(){"use strict";function e(e,r){e.otherwise("/"),r.html5Mode({enabled:!1,requireBase:!1}),r.hashPrefix("!")}function r(){FastClick.attach(document.body)}var n=angular.module("application",["elasticsearch","ui.router","ngAnimate","foundation","foundation.dynamicRouting","foundation.dynamicRouting.animations"]);n.config(e),n.run(r),e.$inject=["$urlRouterProvider","$locationProvider"],n.service("es",function(e){return e({host:"http://apikey:DEVELOPMENT-Indexer@api.exiletools.com"})}),n.controller("SearchController",function(e,r,n){e.searchInput="staff 30sdmg",e.queryString="",e.termsMap={};var t=function(r){var n=jsyaml.load(r.data);jQuery.extend(e.termsMap,n)};r.get("assets/terms/itemtypes.yml").then(t),r.get("assets/terms/gems.yml").then(t),r.get("assets/terms/mod-ofs.yml").then(t),r.get("assets/terms/buyouts.yml").then(t),e.doSearch=function(){e.Response=null;var r=parseSearchInput(e.termsMap,e.searchInput);console.log("searchQuery="+r),e.queryString=r,n.search({index:"index",body:{sort:[{"shop.updated":{order:"desc"}}],query:{query_string:{default_operator:"AND",query:r}},size:100}}).then(function(r){e.Response=r},function(e){console.trace(e.message)})}}),n.directive("myEnter",function(){return function(e,r,n){r.bind("keydown keypress",function(r){13===r.which&&(e.$apply(function(){e.$eval(n.myEnter)}),r.preventDefault())})}})}();