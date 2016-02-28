
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
        var foundMatch = rgex.test(removeParensAndBackTick(token));
        if (foundMatch) {
            result = terms[regex].query;
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