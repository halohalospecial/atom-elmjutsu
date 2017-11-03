
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

var _elm_lang$lazy$Native_Lazy = function() {

function memoize(thunk)
{
    var value;
    var isForced = false;
    return function(tuple0) {
        if (!isForced) {
            value = thunk(tuple0);
            isForced = true;
        }
        return value;
    };
}

return {
    memoize: memoize
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _elm_lang$lazy$Lazy$force = function (_p0) {
	var _p1 = _p0;
	return _p1._0(
		{ctor: '_Tuple0'});
};
var _elm_lang$lazy$Lazy$Lazy = function (a) {
	return {ctor: 'Lazy', _0: a};
};
var _elm_lang$lazy$Lazy$lazy = function (thunk) {
	return _elm_lang$lazy$Lazy$Lazy(
		_elm_lang$lazy$Native_Lazy.memoize(thunk));
};
var _elm_lang$lazy$Lazy$map = F2(
	function (f, a) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p2) {
				var _p3 = _p2;
				return f(
					_elm_lang$lazy$Lazy$force(a));
			});
	});
var _elm_lang$lazy$Lazy$map2 = F3(
	function (f, a, b) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p4) {
				var _p5 = _p4;
				return A2(
					f,
					_elm_lang$lazy$Lazy$force(a),
					_elm_lang$lazy$Lazy$force(b));
			});
	});
var _elm_lang$lazy$Lazy$map3 = F4(
	function (f, a, b, c) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p6) {
				var _p7 = _p6;
				return A3(
					f,
					_elm_lang$lazy$Lazy$force(a),
					_elm_lang$lazy$Lazy$force(b),
					_elm_lang$lazy$Lazy$force(c));
			});
	});
var _elm_lang$lazy$Lazy$map4 = F5(
	function (f, a, b, c, d) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p8) {
				var _p9 = _p8;
				return A4(
					f,
					_elm_lang$lazy$Lazy$force(a),
					_elm_lang$lazy$Lazy$force(b),
					_elm_lang$lazy$Lazy$force(c),
					_elm_lang$lazy$Lazy$force(d));
			});
	});
var _elm_lang$lazy$Lazy$map5 = F6(
	function (f, a, b, c, d, e) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p10) {
				var _p11 = _p10;
				return A5(
					f,
					_elm_lang$lazy$Lazy$force(a),
					_elm_lang$lazy$Lazy$force(b),
					_elm_lang$lazy$Lazy$force(c),
					_elm_lang$lazy$Lazy$force(d),
					_elm_lang$lazy$Lazy$force(e));
			});
	});
var _elm_lang$lazy$Lazy$apply = F2(
	function (f, x) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p12) {
				var _p13 = _p12;
				return A2(
					_elm_lang$lazy$Lazy$force,
					f,
					_elm_lang$lazy$Lazy$force(x));
			});
	});
var _elm_lang$lazy$Lazy$andThen = F2(
	function (callback, a) {
		return _elm_lang$lazy$Lazy$lazy(
			function (_p14) {
				var _p15 = _p14;
				return _elm_lang$lazy$Lazy$force(
					callback(
						_elm_lang$lazy$Lazy$force(a)));
			});
	});

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

var _elm_community$parser_combinators$Combine$app = function (p) {
	var _p0 = p;
	if (_p0.ctor === 'Parser') {
		return _p0._0;
	} else {
		return _elm_lang$lazy$Lazy$force(_p0._0);
	}
};
var _elm_community$parser_combinators$Combine$InputStream = F3(
	function (a, b, c) {
		return {data: a, input: b, position: c};
	});
var _elm_community$parser_combinators$Combine$initStream = function (s) {
	return A3(_elm_community$parser_combinators$Combine$InputStream, s, s, 0);
};
var _elm_community$parser_combinators$Combine$runParser = F3(
	function (p, st, s) {
		var _p1 = A3(
			_elm_community$parser_combinators$Combine$app,
			p,
			st,
			_elm_community$parser_combinators$Combine$initStream(s));
		if (_p1._2.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				{ctor: '_Tuple3', _0: _p1._0, _1: _p1._1, _2: _p1._2._0});
		} else {
			return _elm_lang$core$Result$Err(
				{ctor: '_Tuple3', _0: _p1._0, _1: _p1._1, _2: _p1._2._0});
		}
	});
var _elm_community$parser_combinators$Combine$parse = function (p) {
	return A2(
		_elm_community$parser_combinators$Combine$runParser,
		p,
		{ctor: '_Tuple0'});
};
var _elm_community$parser_combinators$Combine$ParseLocation = F3(
	function (a, b, c) {
		return {source: a, line: b, column: c};
	});
var _elm_community$parser_combinators$Combine$currentLocation = function (stream) {
	var find = F3(
		function (position, currentLine, lines) {
			find:
			while (true) {
				var _p2 = lines;
				if (_p2.ctor === '[]') {
					return A3(_elm_community$parser_combinators$Combine$ParseLocation, '', 1, position);
				} else {
					if (_p2._1.ctor === '[]') {
						return A3(_elm_community$parser_combinators$Combine$ParseLocation, _p2._0, currentLine + 1, position);
					} else {
						var _p3 = _p2._0;
						var length = _elm_lang$core$String$length(_p3);
						if (_elm_lang$core$Native_Utils.cmp(position, length) > -1) {
							var _v3 = (position - length) - 1,
								_v4 = currentLine + 1,
								_v5 = _p2._1;
							position = _v3;
							currentLine = _v4;
							lines = _v5;
							continue find;
						} else {
							if (_elm_lang$core$Native_Utils.eq(currentLine, 0)) {
								return A3(_elm_community$parser_combinators$Combine$ParseLocation, _p3, 1, position);
							} else {
								return A3(_elm_community$parser_combinators$Combine$ParseLocation, _p3, currentLine, position - 1);
							}
						}
					}
				}
			}
		});
	return A3(
		find,
		stream.position,
		0,
		A2(_elm_lang$core$String$split, '\n', stream.data));
};
var _elm_community$parser_combinators$Combine$currentSourceLine = function (_p4) {
	return function (_) {
		return _.source;
	}(
		_elm_community$parser_combinators$Combine$currentLocation(_p4));
};
var _elm_community$parser_combinators$Combine$currentLine = function (_p5) {
	return function (_) {
		return _.line;
	}(
		_elm_community$parser_combinators$Combine$currentLocation(_p5));
};
var _elm_community$parser_combinators$Combine$currentColumn = function (_p6) {
	return function (_) {
		return _.column;
	}(
		_elm_community$parser_combinators$Combine$currentLocation(_p6));
};
var _elm_community$parser_combinators$Combine$RecursiveParser = function (a) {
	return {ctor: 'RecursiveParser', _0: a};
};
var _elm_community$parser_combinators$Combine$lazy = function (t) {
	return _elm_community$parser_combinators$Combine$RecursiveParser(
		_elm_lang$lazy$Lazy$lazy(
			function (_p7) {
				var _p8 = _p7;
				return _elm_community$parser_combinators$Combine$app(
					t(
						{ctor: '_Tuple0'}));
			}));
};
var _elm_community$parser_combinators$Combine$Parser = function (a) {
	return {ctor: 'Parser', _0: a};
};
var _elm_community$parser_combinators$Combine$primitive = _elm_community$parser_combinators$Combine$Parser;
var _elm_community$parser_combinators$Combine$bimap = F3(
	function (fok, ferr, p) {
		return _elm_community$parser_combinators$Combine$Parser(
			F2(
				function (state, stream) {
					var _p9 = A3(_elm_community$parser_combinators$Combine$app, p, state, stream);
					if (_p9._2.ctor === 'Ok') {
						return {
							ctor: '_Tuple3',
							_0: _p9._0,
							_1: _p9._1,
							_2: _elm_lang$core$Result$Ok(
								fok(_p9._2._0))
						};
					} else {
						return {
							ctor: '_Tuple3',
							_0: _p9._0,
							_1: _p9._1,
							_2: _elm_lang$core$Result$Err(
								ferr(_p9._2._0))
						};
					}
				}));
	});
var _elm_community$parser_combinators$Combine$map = F2(
	function (f, p) {
		return A3(_elm_community$parser_combinators$Combine$bimap, f, _elm_lang$core$Basics$identity, p);
	});
var _elm_community$parser_combinators$Combine_ops = _elm_community$parser_combinators$Combine_ops || {};
_elm_community$parser_combinators$Combine_ops['<$>'] = _elm_community$parser_combinators$Combine$map;
var _elm_community$parser_combinators$Combine_ops = _elm_community$parser_combinators$Combine_ops || {};
_elm_community$parser_combinators$Combine_ops['<$'] = function (res) {
	return _elm_community$parser_combinators$Combine$map(
		_elm_lang$core$Basics$always(res));
};
var _elm_community$parser_combinators$Combine$skip = function (p) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<$'],
		{ctor: '_Tuple0'},
		p);
};
var _elm_community$parser_combinators$Combine_ops = _elm_community$parser_combinators$Combine_ops || {};
_elm_community$parser_combinators$Combine_ops['$>'] = _elm_lang$core$Basics$flip(
	F2(
		function (x, y) {
			return A2(_elm_community$parser_combinators$Combine_ops['<$'], x, y);
		}));
var _elm_community$parser_combinators$Combine$mapError = _elm_community$parser_combinators$Combine$bimap(_elm_lang$core$Basics$identity);
var _elm_community$parser_combinators$Combine_ops = _elm_community$parser_combinators$Combine_ops || {};
_elm_community$parser_combinators$Combine_ops['<?>'] = F2(
	function (p, m) {
		return A2(
			_elm_community$parser_combinators$Combine$mapError,
			_elm_lang$core$Basics$always(
				{
					ctor: '::',
					_0: m,
					_1: {ctor: '[]'}
				}),
			p);
	});
var _elm_community$parser_combinators$Combine$withState = function (f) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				return A3(
					_elm_community$parser_combinators$Combine$app,
					f(state),
					state,
					stream);
			}));
};
var _elm_community$parser_combinators$Combine$withLocation = function (f) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				return A3(
					_elm_community$parser_combinators$Combine$app,
					f(
						_elm_community$parser_combinators$Combine$currentLocation(stream)),
					state,
					stream);
			}));
};
var _elm_community$parser_combinators$Combine$withLine = function (f) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				return A3(
					_elm_community$parser_combinators$Combine$app,
					f(
						_elm_community$parser_combinators$Combine$currentLine(stream)),
					state,
					stream);
			}));
};
var _elm_community$parser_combinators$Combine$withColumn = function (f) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				return A3(
					_elm_community$parser_combinators$Combine$app,
					f(
						_elm_community$parser_combinators$Combine$currentColumn(stream)),
					state,
					stream);
			}));
};
var _elm_community$parser_combinators$Combine$andThen = F2(
	function (f, p) {
		return _elm_community$parser_combinators$Combine$Parser(
			F2(
				function (state, stream) {
					var _p10 = A3(_elm_community$parser_combinators$Combine$app, p, state, stream);
					if (_p10._2.ctor === 'Ok') {
						return A3(
							_elm_community$parser_combinators$Combine$app,
							f(_p10._2._0),
							_p10._0,
							_p10._1);
					} else {
						return {
							ctor: '_Tuple3',
							_0: _p10._0,
							_1: _p10._1,
							_2: _elm_lang$core$Result$Err(_p10._2._0)
						};
					}
				}));
	});
var _elm_community$parser_combinators$Combine_ops = _elm_community$parser_combinators$Combine_ops || {};
_elm_community$parser_combinators$Combine_ops['>>='] = _elm_lang$core$Basics$flip(_elm_community$parser_combinators$Combine$andThen);
var _elm_community$parser_combinators$Combine$andMap = F2(
	function (rp, lp) {
		return A2(
			_elm_community$parser_combinators$Combine_ops['>>='],
			lp,
			A2(_elm_lang$core$Basics$flip, _elm_community$parser_combinators$Combine$map, rp));
	});
var _elm_community$parser_combinators$Combine_ops = _elm_community$parser_combinators$Combine_ops || {};
_elm_community$parser_combinators$Combine_ops['<*>'] = _elm_lang$core$Basics$flip(_elm_community$parser_combinators$Combine$andMap);
var _elm_community$parser_combinators$Combine_ops = _elm_community$parser_combinators$Combine_ops || {};
_elm_community$parser_combinators$Combine_ops['<*'] = F2(
	function (lp, rp) {
		return A2(
			_elm_community$parser_combinators$Combine$andMap,
			rp,
			A2(_elm_community$parser_combinators$Combine$map, _elm_lang$core$Basics$always, lp));
	});
var _elm_community$parser_combinators$Combine_ops = _elm_community$parser_combinators$Combine_ops || {};
_elm_community$parser_combinators$Combine_ops['*>'] = F2(
	function (lp, rp) {
		return A2(
			_elm_community$parser_combinators$Combine$andMap,
			rp,
			A2(
				_elm_community$parser_combinators$Combine$map,
				_elm_lang$core$Basics$flip(_elm_lang$core$Basics$always),
				lp));
	});
var _elm_community$parser_combinators$Combine$between = F3(
	function (lp, rp, p) {
		return A2(
			_elm_community$parser_combinators$Combine_ops['<*'],
			A2(_elm_community$parser_combinators$Combine_ops['*>'], lp, p),
			rp);
	});
var _elm_community$parser_combinators$Combine$sequence = function (parsers) {
	var accumulate = F4(
		function (acc, ps, state, stream) {
			accumulate:
			while (true) {
				var _p11 = ps;
				if (_p11.ctor === '[]') {
					return {
						ctor: '_Tuple3',
						_0: state,
						_1: stream,
						_2: _elm_lang$core$Result$Ok(
							_elm_lang$core$List$reverse(acc))
					};
				} else {
					var _p12 = A3(_elm_community$parser_combinators$Combine$app, _p11._0, state, stream);
					if (_p12._2.ctor === 'Ok') {
						var _v11 = {ctor: '::', _0: _p12._2._0, _1: acc},
							_v12 = _p11._1,
							_v13 = _p12._0,
							_v14 = _p12._1;
						acc = _v11;
						ps = _v12;
						state = _v13;
						stream = _v14;
						continue accumulate;
					} else {
						return {
							ctor: '_Tuple3',
							_0: _p12._0,
							_1: _p12._1,
							_2: _elm_lang$core$Result$Err(_p12._2._0)
						};
					}
				}
			}
		});
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				return A4(
					accumulate,
					{ctor: '[]'},
					parsers,
					state,
					stream);
			}));
};
var _elm_community$parser_combinators$Combine$fail = function (m) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				return {
					ctor: '_Tuple3',
					_0: state,
					_1: stream,
					_2: _elm_lang$core$Result$Err(
						{
							ctor: '::',
							_0: m,
							_1: {ctor: '[]'}
						})
				};
			}));
};
var _elm_community$parser_combinators$Combine$emptyErr = _elm_community$parser_combinators$Combine$Parser(
	F2(
		function (state, stream) {
			return {
				ctor: '_Tuple3',
				_0: state,
				_1: stream,
				_2: _elm_lang$core$Result$Err(
					{ctor: '[]'})
			};
		}));
var _elm_community$parser_combinators$Combine$succeed = function (res) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				return {
					ctor: '_Tuple3',
					_0: state,
					_1: stream,
					_2: _elm_lang$core$Result$Ok(res)
				};
			}));
};
var _elm_community$parser_combinators$Combine$putState = function (state) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (_p13, stream) {
				return A3(
					_elm_community$parser_combinators$Combine$app,
					_elm_community$parser_combinators$Combine$succeed(
						{ctor: '_Tuple0'}),
					state,
					stream);
			}));
};
var _elm_community$parser_combinators$Combine$modifyState = function (f) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				return A3(
					_elm_community$parser_combinators$Combine$app,
					_elm_community$parser_combinators$Combine$succeed(
						{ctor: '_Tuple0'}),
					f(state),
					stream);
			}));
};
var _elm_community$parser_combinators$Combine$count = F2(
	function (n, p) {
		var accumulate = F2(
			function (x, acc) {
				return (_elm_lang$core$Native_Utils.cmp(x, 0) < 1) ? _elm_community$parser_combinators$Combine$succeed(
					_elm_lang$core$List$reverse(acc)) : A2(
					_elm_community$parser_combinators$Combine$andThen,
					function (res) {
						return A2(
							accumulate,
							x - 1,
							{ctor: '::', _0: res, _1: acc});
					},
					p);
			});
		return A2(
			accumulate,
			n,
			{ctor: '[]'});
	});
var _elm_community$parser_combinators$Combine$string = function (s) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				if (A2(_elm_lang$core$String$startsWith, s, stream.input)) {
					var len = _elm_lang$core$String$length(s);
					var rem = A2(_elm_lang$core$String$dropLeft, len, stream.input);
					var pos = stream.position + len;
					return {
						ctor: '_Tuple3',
						_0: state,
						_1: _elm_lang$core$Native_Utils.update(
							stream,
							{input: rem, position: pos}),
						_2: _elm_lang$core$Result$Ok(s)
					};
				} else {
					return {
						ctor: '_Tuple3',
						_0: state,
						_1: stream,
						_2: _elm_lang$core$Result$Err(
							{
								ctor: '::',
								_0: A2(
									_elm_lang$core$Basics_ops['++'],
									'expected ',
									_elm_lang$core$Basics$toString(s)),
								_1: {ctor: '[]'}
							})
					};
				}
			}));
};
var _elm_community$parser_combinators$Combine$parens = A2(
	_elm_community$parser_combinators$Combine$between,
	_elm_community$parser_combinators$Combine$string('('),
	_elm_community$parser_combinators$Combine$string(')'));
var _elm_community$parser_combinators$Combine$braces = A2(
	_elm_community$parser_combinators$Combine$between,
	_elm_community$parser_combinators$Combine$string('{'),
	_elm_community$parser_combinators$Combine$string('}'));
var _elm_community$parser_combinators$Combine$brackets = A2(
	_elm_community$parser_combinators$Combine$between,
	_elm_community$parser_combinators$Combine$string('['),
	_elm_community$parser_combinators$Combine$string(']'));
var _elm_community$parser_combinators$Combine$regex = function (pat) {
	var pattern = A2(_elm_lang$core$String$startsWith, '^', pat) ? pat : A2(_elm_lang$core$Basics_ops['++'], '^', pat);
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				var _p14 = A3(
					_elm_lang$core$Regex$find,
					_elm_lang$core$Regex$AtMost(1),
					_elm_lang$core$Regex$regex(pattern),
					stream.input);
				if ((_p14.ctor === '::') && (_p14._1.ctor === '[]')) {
					var _p15 = _p14._0;
					var len = _elm_lang$core$String$length(_p15.match);
					var rem = A2(_elm_lang$core$String$dropLeft, len, stream.input);
					var pos = stream.position + len;
					return {
						ctor: '_Tuple3',
						_0: state,
						_1: _elm_lang$core$Native_Utils.update(
							stream,
							{input: rem, position: pos}),
						_2: _elm_lang$core$Result$Ok(_p15.match)
					};
				} else {
					return {
						ctor: '_Tuple3',
						_0: state,
						_1: stream,
						_2: _elm_lang$core$Result$Err(
							{
								ctor: '::',
								_0: A2(
									_elm_lang$core$Basics_ops['++'],
									'expected input matching Regexp /',
									A2(_elm_lang$core$Basics_ops['++'], pattern, '/')),
								_1: {ctor: '[]'}
							})
					};
				}
			}));
};
var _elm_community$parser_combinators$Combine$whitespace = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine$regex('[ \t\r\n]*'),
	'whitespace');
var _elm_community$parser_combinators$Combine$whitespace1 = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine$regex('[ \t\r\n]+'),
	'whitespace');
var _elm_community$parser_combinators$Combine$while = function (pred) {
	var accumulate = F3(
		function (acc, state, stream) {
			accumulate:
			while (true) {
				var _p16 = _elm_lang$core$String$uncons(stream.input);
				if (_p16.ctor === 'Just') {
					var _p17 = _p16._0._0;
					if (pred(_p17)) {
						var pos = stream.position + 1;
						var c = A2(_elm_lang$core$String$cons, _p17, '');
						var _v17 = A2(_elm_lang$core$Basics_ops['++'], acc, c),
							_v18 = state,
							_v19 = _elm_lang$core$Native_Utils.update(
							stream,
							{input: _p16._0._1, position: pos});
						acc = _v17;
						state = _v18;
						stream = _v19;
						continue accumulate;
					} else {
						return {ctor: '_Tuple3', _0: state, _1: stream, _2: acc};
					}
				} else {
					return {ctor: '_Tuple3', _0: state, _1: stream, _2: acc};
				}
			}
		});
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				var _p18 = A3(accumulate, '', state, stream);
				var rstate = _p18._0;
				var rstream = _p18._1;
				var res = _p18._2;
				return {
					ctor: '_Tuple3',
					_0: rstate,
					_1: rstream,
					_2: _elm_lang$core$Result$Ok(res)
				};
			}));
};
var _elm_community$parser_combinators$Combine$end = _elm_community$parser_combinators$Combine$Parser(
	F2(
		function (state, stream) {
			return _elm_lang$core$Native_Utils.eq(stream.input, '') ? {
				ctor: '_Tuple3',
				_0: state,
				_1: stream,
				_2: _elm_lang$core$Result$Ok(
					{ctor: '_Tuple0'})
			} : {
				ctor: '_Tuple3',
				_0: state,
				_1: stream,
				_2: _elm_lang$core$Result$Err(
					{
						ctor: '::',
						_0: 'expected end of input',
						_1: {ctor: '[]'}
					})
			};
		}));
var _elm_community$parser_combinators$Combine$lookAhead = function (p) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				var _p19 = A3(_elm_community$parser_combinators$Combine$app, p, state, stream);
				if ((_p19.ctor === '_Tuple3') && (_p19._2.ctor === 'Ok')) {
					return {
						ctor: '_Tuple3',
						_0: _p19._0,
						_1: stream,
						_2: _elm_lang$core$Result$Ok(_p19._2._0)
					};
				} else {
					return _p19;
				}
			}));
};
var _elm_community$parser_combinators$Combine$or = F2(
	function (lp, rp) {
		return _elm_community$parser_combinators$Combine$Parser(
			F2(
				function (state, stream) {
					var _p20 = A3(_elm_community$parser_combinators$Combine$app, lp, state, stream);
					if (_p20._2.ctor === 'Ok') {
						return _p20;
					} else {
						var _p21 = A3(_elm_community$parser_combinators$Combine$app, rp, state, stream);
						if (_p21._2.ctor === 'Ok') {
							return _p21;
						} else {
							return {
								ctor: '_Tuple3',
								_0: state,
								_1: stream,
								_2: _elm_lang$core$Result$Err(
									A2(_elm_lang$core$Basics_ops['++'], _p20._2._0, _p21._2._0))
							};
						}
					}
				}));
	});
var _elm_community$parser_combinators$Combine$choice = function (xs) {
	return A3(_elm_lang$core$List$foldr, _elm_community$parser_combinators$Combine$or, _elm_community$parser_combinators$Combine$emptyErr, xs);
};
var _elm_community$parser_combinators$Combine_ops = _elm_community$parser_combinators$Combine_ops || {};
_elm_community$parser_combinators$Combine_ops['<|>'] = _elm_community$parser_combinators$Combine$or;
var _elm_community$parser_combinators$Combine$optional = F2(
	function (res, p) {
		return A2(
			_elm_community$parser_combinators$Combine_ops['<|>'],
			p,
			_elm_community$parser_combinators$Combine$succeed(res));
	});
var _elm_community$parser_combinators$Combine$chainl = F2(
	function (op, p) {
		var accumulate = function (x) {
			return A2(
				_elm_community$parser_combinators$Combine_ops['<|>'],
				A2(
					_elm_community$parser_combinators$Combine$andThen,
					function (f) {
						return A2(
							_elm_community$parser_combinators$Combine$andThen,
							function (y) {
								return accumulate(
									A2(f, x, y));
							},
							p);
					},
					op),
				_elm_community$parser_combinators$Combine$succeed(x));
		};
		return A2(_elm_community$parser_combinators$Combine$andThen, accumulate, p);
	});
var _elm_community$parser_combinators$Combine$chainr = F2(
	function (op, p) {
		var accumulate = function (x) {
			return A2(
				_elm_community$parser_combinators$Combine_ops['<|>'],
				A2(
					_elm_community$parser_combinators$Combine$andThen,
					function (f) {
						return A2(
							_elm_community$parser_combinators$Combine$andThen,
							function (y) {
								return _elm_community$parser_combinators$Combine$succeed(
									A2(f, x, y));
							},
							A2(_elm_community$parser_combinators$Combine$andThen, accumulate, p));
					},
					op),
				_elm_community$parser_combinators$Combine$succeed(x));
		};
		return A2(_elm_community$parser_combinators$Combine$andThen, accumulate, p);
	});
var _elm_community$parser_combinators$Combine$maybe = function (p) {
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				var _p22 = A3(_elm_community$parser_combinators$Combine$app, p, state, stream);
				if ((_p22.ctor === '_Tuple3') && (_p22._2.ctor === 'Ok')) {
					return {
						ctor: '_Tuple3',
						_0: _p22._0,
						_1: _p22._1,
						_2: _elm_lang$core$Result$Ok(
							_elm_lang$core$Maybe$Just(_p22._2._0))
					};
				} else {
					return {
						ctor: '_Tuple3',
						_0: state,
						_1: stream,
						_2: _elm_lang$core$Result$Ok(_elm_lang$core$Maybe$Nothing)
					};
				}
			}));
};
var _elm_community$parser_combinators$Combine$many = function (p) {
	var accumulate = F3(
		function (acc, state, stream) {
			accumulate:
			while (true) {
				var _p23 = A3(_elm_community$parser_combinators$Combine$app, p, state, stream);
				if ((_p23.ctor === '_Tuple3') && (_p23._2.ctor === 'Ok')) {
					var _p25 = _p23._1;
					var _p24 = _p23._0;
					if (_elm_lang$core$Native_Utils.eq(stream, _p25)) {
						return {
							ctor: '_Tuple3',
							_0: _p24,
							_1: _p25,
							_2: _elm_lang$core$List$reverse(acc)
						};
					} else {
						var _v25 = {ctor: '::', _0: _p23._2._0, _1: acc},
							_v26 = _p24,
							_v27 = _p25;
						acc = _v25;
						state = _v26;
						stream = _v27;
						continue accumulate;
					}
				} else {
					return {
						ctor: '_Tuple3',
						_0: state,
						_1: stream,
						_2: _elm_lang$core$List$reverse(acc)
					};
				}
			}
		});
	return _elm_community$parser_combinators$Combine$Parser(
		F2(
			function (state, stream) {
				var _p26 = A3(
					accumulate,
					{ctor: '[]'},
					state,
					stream);
				var rstate = _p26._0;
				var rstream = _p26._1;
				var res = _p26._2;
				return {
					ctor: '_Tuple3',
					_0: rstate,
					_1: rstream,
					_2: _elm_lang$core$Result$Ok(res)
				};
			}));
};
var _elm_community$parser_combinators$Combine$many1 = function (p) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<*>'],
		A2(
			_elm_community$parser_combinators$Combine_ops['<$>'],
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			p),
		_elm_community$parser_combinators$Combine$many(p));
};
var _elm_community$parser_combinators$Combine$skipMany1 = function (p) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<$'],
		{ctor: '_Tuple0'},
		_elm_community$parser_combinators$Combine$many1(
			_elm_community$parser_combinators$Combine$skip(p)));
};
var _elm_community$parser_combinators$Combine$sepBy1 = F2(
	function (sep, p) {
		return A2(
			_elm_community$parser_combinators$Combine_ops['<*>'],
			A2(
				_elm_community$parser_combinators$Combine_ops['<$>'],
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				p),
			_elm_community$parser_combinators$Combine$many(
				A2(_elm_community$parser_combinators$Combine_ops['*>'], sep, p)));
	});
var _elm_community$parser_combinators$Combine$sepBy = F2(
	function (sep, p) {
		return A2(
			_elm_community$parser_combinators$Combine_ops['<|>'],
			A2(_elm_community$parser_combinators$Combine$sepBy1, sep, p),
			_elm_community$parser_combinators$Combine$succeed(
				{ctor: '[]'}));
	});
var _elm_community$parser_combinators$Combine$sepEndBy1 = F2(
	function (sep, p) {
		return A2(
			_elm_community$parser_combinators$Combine_ops['<*'],
			A2(_elm_community$parser_combinators$Combine$sepBy1, sep, p),
			_elm_community$parser_combinators$Combine$maybe(sep));
	});
var _elm_community$parser_combinators$Combine$sepEndBy = F2(
	function (sep, p) {
		return A2(
			_elm_community$parser_combinators$Combine_ops['<|>'],
			A2(_elm_community$parser_combinators$Combine$sepEndBy1, sep, p),
			_elm_community$parser_combinators$Combine$succeed(
				{ctor: '[]'}));
	});
var _elm_community$parser_combinators$Combine$skipMany = function (p) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<$'],
		{ctor: '_Tuple0'},
		_elm_community$parser_combinators$Combine$many(
			_elm_community$parser_combinators$Combine$skip(p)));
};
var _elm_community$parser_combinators$Combine$manyTill = F2(
	function (p, end) {
		var accumulate = F3(
			function (acc, state, stream) {
				accumulate:
				while (true) {
					var _p27 = A3(_elm_community$parser_combinators$Combine$app, end, state, stream);
					if (_p27._2.ctor === 'Ok') {
						return {
							ctor: '_Tuple3',
							_0: _p27._0,
							_1: _p27._1,
							_2: _elm_lang$core$Result$Ok(
								_elm_lang$core$List$reverse(acc))
						};
					} else {
						var _p28 = A3(_elm_community$parser_combinators$Combine$app, p, state, stream);
						if ((_p28.ctor === '_Tuple3') && (_p28._2.ctor === 'Ok')) {
							var _v30 = {ctor: '::', _0: _p28._2._0, _1: acc},
								_v31 = _p28._0,
								_v32 = _p28._1;
							acc = _v30;
							state = _v31;
							stream = _v32;
							continue accumulate;
						} else {
							return {
								ctor: '_Tuple3',
								_0: _p27._0,
								_1: _p27._1,
								_2: _elm_lang$core$Result$Err(_p27._2._0)
							};
						}
					}
				}
			});
		return _elm_community$parser_combinators$Combine$Parser(
			accumulate(
				{ctor: '[]'}));
	});

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

var _elm_community$parser_combinators$Combine_Char$crlf = A2(
	_elm_community$parser_combinators$Combine_ops['<$'],
	_elm_lang$core$Native_Utils.chr('\n'),
	A2(
		_elm_community$parser_combinators$Combine_ops['<?>'],
		_elm_community$parser_combinators$Combine$regex('\r\n'),
		'expected crlf'));
var _elm_community$parser_combinators$Combine_Char$satisfy = function (pred) {
	return _elm_community$parser_combinators$Combine$primitive(
		F2(
			function (state, stream) {
				var message = 'could not satisfy predicate';
				var _p0 = _elm_lang$core$String$uncons(stream.input);
				if (_p0.ctor === 'Just') {
					var _p1 = _p0._0._0;
					return pred(_p1) ? {
						ctor: '_Tuple3',
						_0: state,
						_1: _elm_lang$core$Native_Utils.update(
							stream,
							{input: _p0._0._1, position: stream.position + 1}),
						_2: _elm_lang$core$Result$Ok(_p1)
					} : {
						ctor: '_Tuple3',
						_0: state,
						_1: stream,
						_2: _elm_lang$core$Result$Err(
							{
								ctor: '::',
								_0: message,
								_1: {ctor: '[]'}
							})
					};
				} else {
					return {
						ctor: '_Tuple3',
						_0: state,
						_1: stream,
						_2: _elm_lang$core$Result$Err(
							{
								ctor: '::',
								_0: message,
								_1: {ctor: '[]'}
							})
					};
				}
			}));
};
var _elm_community$parser_combinators$Combine_Char$char = function (c) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<?>'],
		_elm_community$parser_combinators$Combine_Char$satisfy(
			F2(
				function (x, y) {
					return _elm_lang$core$Native_Utils.eq(x, y);
				})(c)),
		A2(
			_elm_lang$core$Basics_ops['++'],
			'expected ',
			_elm_lang$core$Basics$toString(c)));
};
var _elm_community$parser_combinators$Combine_Char$anyChar = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine_Char$satisfy(
		_elm_lang$core$Basics$always(true)),
	'expected any character');
var _elm_community$parser_combinators$Combine_Char$oneOf = function (cs) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<?>'],
		_elm_community$parser_combinators$Combine_Char$satisfy(
			A2(_elm_lang$core$Basics$flip, _elm_lang$core$List$member, cs)),
		A2(
			_elm_lang$core$Basics_ops['++'],
			'expected one of ',
			_elm_lang$core$Basics$toString(cs)));
};
var _elm_community$parser_combinators$Combine_Char$noneOf = function (cs) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<?>'],
		_elm_community$parser_combinators$Combine_Char$satisfy(
			function (_p2) {
				return !A3(_elm_lang$core$Basics$flip, _elm_lang$core$List$member, cs, _p2);
			}),
		A2(
			_elm_lang$core$Basics_ops['++'],
			'expected none of ',
			_elm_lang$core$Basics$toString(cs)));
};
var _elm_community$parser_combinators$Combine_Char$space = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine_Char$satisfy(
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.eq(x, y);
			})(
			_elm_lang$core$Native_Utils.chr(' '))),
	'expected space');
var _elm_community$parser_combinators$Combine_Char$tab = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine_Char$satisfy(
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.eq(x, y);
			})(
			_elm_lang$core$Native_Utils.chr('\t'))),
	'expected tab');
var _elm_community$parser_combinators$Combine_Char$newline = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine_Char$satisfy(
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.eq(x, y);
			})(
			_elm_lang$core$Native_Utils.chr('\n'))),
	'expected newline');
var _elm_community$parser_combinators$Combine_Char$eol = A2(_elm_community$parser_combinators$Combine_ops['<|>'], _elm_community$parser_combinators$Combine_Char$newline, _elm_community$parser_combinators$Combine_Char$crlf);
var _elm_community$parser_combinators$Combine_Char$lower = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine_Char$satisfy(_elm_lang$core$Char$isLower),
	'expected a lowercase character');
var _elm_community$parser_combinators$Combine_Char$upper = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine_Char$satisfy(_elm_lang$core$Char$isUpper),
	'expected an uppercase character');
var _elm_community$parser_combinators$Combine_Char$digit = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine_Char$satisfy(_elm_lang$core$Char$isDigit),
	'expected a digit');
var _elm_community$parser_combinators$Combine_Char$octDigit = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine_Char$satisfy(_elm_lang$core$Char$isOctDigit),
	'expected an octal digit');
var _elm_community$parser_combinators$Combine_Char$hexDigit = A2(
	_elm_community$parser_combinators$Combine_ops['<?>'],
	_elm_community$parser_combinators$Combine_Char$satisfy(_elm_lang$core$Char$isHexDigit),
	'expected a hexadecimal digit');

var _Bogdanp$elm_ast$Ast_Helpers$emptyTuple = _elm_community$parser_combinators$Combine$string('()');
var _Bogdanp$elm_ast$Ast_Helpers$name = function (p) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<*>'],
		A2(_elm_community$parser_combinators$Combine_ops['<$>'], _elm_lang$core$String$cons, p),
		_elm_community$parser_combinators$Combine$regex('[a-zA-Z0-9-_]*'));
};
var _Bogdanp$elm_ast$Ast_Helpers$upName = _Bogdanp$elm_ast$Ast_Helpers$name(_elm_community$parser_combinators$Combine_Char$upper);
var _Bogdanp$elm_ast$Ast_Helpers$spaces_ = _elm_community$parser_combinators$Combine$regex('[ \\t]+');
var _Bogdanp$elm_ast$Ast_Helpers$initialSymbol = function (k) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<*'],
		_elm_community$parser_combinators$Combine$string(k),
		_Bogdanp$elm_ast$Ast_Helpers$spaces_);
};
var _Bogdanp$elm_ast$Ast_Helpers$spaces = _elm_community$parser_combinators$Combine$regex('[ \\t]*');
var _Bogdanp$elm_ast$Ast_Helpers$between_ = function (p) {
	return A2(_elm_community$parser_combinators$Combine$between, p, p);
};
var _Bogdanp$elm_ast$Ast_Helpers$symbol_ = function (k) {
	return A2(
		_Bogdanp$elm_ast$Ast_Helpers$between_,
		_elm_community$parser_combinators$Combine$whitespace,
		A2(
			_elm_community$parser_combinators$Combine_ops['<*'],
			_elm_community$parser_combinators$Combine$string(k),
			_elm_community$parser_combinators$Combine$regex('( |\\n)+')));
};
var _Bogdanp$elm_ast$Ast_Helpers$symbol = function (k) {
	return A2(
		_Bogdanp$elm_ast$Ast_Helpers$between_,
		_elm_community$parser_combinators$Combine$whitespace,
		_elm_community$parser_combinators$Combine$string(k));
};
var _Bogdanp$elm_ast$Ast_Helpers$commaSeparated = function (p) {
	return A2(
		_elm_community$parser_combinators$Combine$sepBy1,
		_elm_community$parser_combinators$Combine$string(','),
		A2(_Bogdanp$elm_ast$Ast_Helpers$between_, _elm_community$parser_combinators$Combine$whitespace, p));
};
var _Bogdanp$elm_ast$Ast_Helpers$commaSeparated_ = function (p) {
	return A2(
		_elm_community$parser_combinators$Combine$sepBy,
		_elm_community$parser_combinators$Combine$string(','),
		A2(_Bogdanp$elm_ast$Ast_Helpers$between_, _elm_community$parser_combinators$Combine$whitespace, p));
};
var _Bogdanp$elm_ast$Ast_Helpers$moduleName = A2(
	_Bogdanp$elm_ast$Ast_Helpers$between_,
	_Bogdanp$elm_ast$Ast_Helpers$spaces,
	A2(
		_elm_community$parser_combinators$Combine$sepBy1,
		_elm_community$parser_combinators$Combine$string('.'),
		_Bogdanp$elm_ast$Ast_Helpers$upName));
var _Bogdanp$elm_ast$Ast_Helpers$reservedOperators = {
	ctor: '::',
	_0: '=',
	_1: {
		ctor: '::',
		_0: '.',
		_1: {
			ctor: '::',
			_0: '..',
			_1: {
				ctor: '::',
				_0: '->',
				_1: {
					ctor: '::',
					_0: '--',
					_1: {
						ctor: '::',
						_0: '|',
						_1: {
							ctor: '::',
							_0: ':',
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}
	}
};
var _Bogdanp$elm_ast$Ast_Helpers$operator = A2(
	_elm_community$parser_combinators$Combine$andThen,
	function (n) {
		return A2(_elm_lang$core$List$member, n, _Bogdanp$elm_ast$Ast_Helpers$reservedOperators) ? _elm_community$parser_combinators$Combine$fail(
			A2(
				_elm_lang$core$Basics_ops['++'],
				'operator \'',
				A2(_elm_lang$core$Basics_ops['++'], n, '\' is reserved'))) : _elm_community$parser_combinators$Combine$succeed(n);
	},
	_elm_community$parser_combinators$Combine$regex('[+\\-\\/*=.$<>:&|^?%#@~!]+|s\b'));
var _Bogdanp$elm_ast$Ast_Helpers$reserved = {
	ctor: '::',
	_0: 'module',
	_1: {
		ctor: '::',
		_0: 'where',
		_1: {
			ctor: '::',
			_0: 'import',
			_1: {
				ctor: '::',
				_0: 'as',
				_1: {
					ctor: '::',
					_0: 'exposing',
					_1: {
						ctor: '::',
						_0: 'type',
						_1: {
							ctor: '::',
							_0: 'alias',
							_1: {
								ctor: '::',
								_0: 'port',
								_1: {
									ctor: '::',
									_0: 'if',
									_1: {
										ctor: '::',
										_0: 'then',
										_1: {
											ctor: '::',
											_0: 'else',
											_1: {
												ctor: '::',
												_0: 'let',
												_1: {
													ctor: '::',
													_0: 'in',
													_1: {
														ctor: '::',
														_0: 'case',
														_1: {
															ctor: '::',
															_0: 'of',
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _Bogdanp$elm_ast$Ast_Helpers$loName = function () {
	var loName_ = A2(
		_elm_community$parser_combinators$Combine$andThen,
		function (n) {
			return A2(_elm_lang$core$List$member, n, _Bogdanp$elm_ast$Ast_Helpers$reserved) ? _elm_community$parser_combinators$Combine$fail(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'name \'',
					A2(_elm_lang$core$Basics_ops['++'], n, '\' is reserved'))) : _elm_community$parser_combinators$Combine$succeed(n);
		},
		_Bogdanp$elm_ast$Ast_Helpers$name(_elm_community$parser_combinators$Combine_Char$lower));
	return A2(
		_elm_community$parser_combinators$Combine_ops['<|>'],
		_elm_community$parser_combinators$Combine$string('_'),
		loName_);
}();
var _Bogdanp$elm_ast$Ast_Helpers$functionName = _Bogdanp$elm_ast$Ast_Helpers$loName;

var _Bogdanp$elm_ast$Ast_BinOp$R = {ctor: 'R'};
var _Bogdanp$elm_ast$Ast_BinOp$L = {ctor: 'L'};
var _Bogdanp$elm_ast$Ast_BinOp$operators = A3(
	_elm_lang$core$Dict$insert,
	'=',
	{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$R, _1: 0},
	A3(
		_elm_lang$core$Dict$insert,
		'|>',
		{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$R, _1: 1},
		A3(
			_elm_lang$core$Dict$insert,
			'<|',
			{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$R, _1: 1},
			A3(
				_elm_lang$core$Dict$insert,
				'>>',
				{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 9},
				A3(
					_elm_lang$core$Dict$insert,
					'<<',
					{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 9},
					A3(
						_elm_lang$core$Dict$insert,
						'^',
						{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 8},
						A3(
							_elm_lang$core$Dict$insert,
							'rem',
							{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 7},
							A3(
								_elm_lang$core$Dict$insert,
								'//',
								{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 7},
								A3(
									_elm_lang$core$Dict$insert,
									'%',
									{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 7},
									A3(
										_elm_lang$core$Dict$insert,
										'/',
										{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 7},
										A3(
											_elm_lang$core$Dict$insert,
											'*',
											{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 7},
											A3(
												_elm_lang$core$Dict$insert,
												'-',
												{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 6},
												A3(
													_elm_lang$core$Dict$insert,
													'+',
													{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 6},
													A3(
														_elm_lang$core$Dict$insert,
														'::',
														{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$R, _1: 5},
														A3(
															_elm_lang$core$Dict$insert,
															'++',
															{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$R, _1: 5},
															A3(
																_elm_lang$core$Dict$insert,
																'<=',
																{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 4},
																A3(
																	_elm_lang$core$Dict$insert,
																	'>=',
																	{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 4},
																	A3(
																		_elm_lang$core$Dict$insert,
																		'>',
																		{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 4},
																		A3(
																			_elm_lang$core$Dict$insert,
																			'<',
																			{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 4},
																			A3(
																				_elm_lang$core$Dict$insert,
																				'/=',
																				{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 4},
																				A3(
																					_elm_lang$core$Dict$insert,
																					'==',
																					{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 4},
																					A3(
																						_elm_lang$core$Dict$insert,
																						'&&',
																						{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 3},
																						A3(
																							_elm_lang$core$Dict$insert,
																							'||',
																							{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 2},
																							_elm_lang$core$Dict$empty)))))))))))))))))))))));
var _Bogdanp$elm_ast$Ast_BinOp$N = {ctor: 'N'};

var _elm_community$parser_combinators$Combine_Num$digit = function () {
	var toDigit = function (c) {
		return _elm_lang$core$Char$toCode(c) - _elm_lang$core$Char$toCode(
			_elm_lang$core$Native_Utils.chr('0'));
	};
	return A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		toDigit,
		A2(_elm_community$parser_combinators$Combine_ops['<?>'], _elm_community$parser_combinators$Combine_Char$digit, 'expected a digit'));
}();
var _elm_community$parser_combinators$Combine_Num$sign = A2(
	_elm_community$parser_combinators$Combine$optional,
	1,
	_elm_community$parser_combinators$Combine$choice(
		{
			ctor: '::',
			_0: A2(
				_elm_community$parser_combinators$Combine_ops['<$'],
				1,
				_elm_community$parser_combinators$Combine$string('+')),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_community$parser_combinators$Combine_ops['<$'],
					-1,
					_elm_community$parser_combinators$Combine$string('-')),
				_1: {ctor: '[]'}
			}
		}));
var _elm_community$parser_combinators$Combine_Num$unwrap = F2(
	function (f, s) {
		var _p0 = f(s);
		if (_p0.ctor === 'Ok') {
			return _p0._0;
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'Combine.Num',
				{
					start: {line: 23, column: 5},
					end: {line: 28, column: 83}
				},
				_p0)(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'impossible state in Combine.Num.unwrap: ',
					_elm_lang$core$Basics$toString(_p0._0)));
		}
	});
var _elm_community$parser_combinators$Combine_Num$toInt = _elm_community$parser_combinators$Combine_Num$unwrap(_elm_lang$core$String$toInt);
var _elm_community$parser_combinators$Combine_Num$int = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		F2(
			function (x, y) {
				return x * y;
			}),
		_elm_community$parser_combinators$Combine_Num$sign),
	A2(
		_elm_community$parser_combinators$Combine_ops['<?>'],
		A2(
			_elm_community$parser_combinators$Combine_ops['<$>'],
			_elm_community$parser_combinators$Combine_Num$toInt,
			_elm_community$parser_combinators$Combine$regex('(0|[1-9][0-9]*)')),
		'expected an integer'));
var _elm_community$parser_combinators$Combine_Num$toFloat = _elm_community$parser_combinators$Combine_Num$unwrap(_elm_lang$core$String$toFloat);
var _elm_community$parser_combinators$Combine_Num$float = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		function (_p2) {
			return F2(
				function (x, y) {
					return x * y;
				})(
				_elm_lang$core$Basics$toFloat(_p2));
		},
		_elm_community$parser_combinators$Combine_Num$sign),
	A2(
		_elm_community$parser_combinators$Combine_ops['<?>'],
		A2(
			_elm_community$parser_combinators$Combine_ops['<$>'],
			_elm_community$parser_combinators$Combine_Num$toFloat,
			_elm_community$parser_combinators$Combine$regex('(0|[1-9][0-9]*)(\\.[0-9]+)')),
		'expected a float'));

var _elm_lang$core$Set$foldr = F3(
	function (f, b, _p0) {
		var _p1 = _p0;
		return A3(
			_elm_lang$core$Dict$foldr,
			F3(
				function (k, _p2, b) {
					return A2(f, k, b);
				}),
			b,
			_p1._0);
	});
var _elm_lang$core$Set$foldl = F3(
	function (f, b, _p3) {
		var _p4 = _p3;
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, _p5, b) {
					return A2(f, k, b);
				}),
			b,
			_p4._0);
	});
var _elm_lang$core$Set$toList = function (_p6) {
	var _p7 = _p6;
	return _elm_lang$core$Dict$keys(_p7._0);
};
var _elm_lang$core$Set$size = function (_p8) {
	var _p9 = _p8;
	return _elm_lang$core$Dict$size(_p9._0);
};
var _elm_lang$core$Set$member = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return A2(_elm_lang$core$Dict$member, k, _p11._0);
	});
var _elm_lang$core$Set$isEmpty = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Dict$isEmpty(_p13._0);
};
var _elm_lang$core$Set$Set_elm_builtin = function (a) {
	return {ctor: 'Set_elm_builtin', _0: a};
};
var _elm_lang$core$Set$empty = _elm_lang$core$Set$Set_elm_builtin(_elm_lang$core$Dict$empty);
var _elm_lang$core$Set$singleton = function (k) {
	return _elm_lang$core$Set$Set_elm_builtin(
		A2(
			_elm_lang$core$Dict$singleton,
			k,
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Set$insert = F2(
	function (k, _p14) {
		var _p15 = _p14;
		return _elm_lang$core$Set$Set_elm_builtin(
			A3(
				_elm_lang$core$Dict$insert,
				k,
				{ctor: '_Tuple0'},
				_p15._0));
	});
var _elm_lang$core$Set$fromList = function (xs) {
	return A3(_elm_lang$core$List$foldl, _elm_lang$core$Set$insert, _elm_lang$core$Set$empty, xs);
};
var _elm_lang$core$Set$map = F2(
	function (f, s) {
		return _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				f,
				_elm_lang$core$Set$toList(s)));
	});
var _elm_lang$core$Set$remove = F2(
	function (k, _p16) {
		var _p17 = _p16;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$remove, k, _p17._0));
	});
var _elm_lang$core$Set$union = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$union, _p20._0, _p21._0));
	});
var _elm_lang$core$Set$intersect = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$intersect, _p24._0, _p25._0));
	});
var _elm_lang$core$Set$diff = F2(
	function (_p27, _p26) {
		var _p28 = _p27;
		var _p29 = _p26;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$diff, _p28._0, _p29._0));
	});
var _elm_lang$core$Set$filter = F2(
	function (p, _p30) {
		var _p31 = _p30;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(
				_elm_lang$core$Dict$filter,
				F2(
					function (k, _p32) {
						return p(k);
					}),
				_p31._0));
	});
var _elm_lang$core$Set$partition = F2(
	function (p, _p33) {
		var _p34 = _p33;
		var _p35 = A2(
			_elm_lang$core$Dict$partition,
			F2(
				function (k, _p36) {
					return p(k);
				}),
			_p34._0);
		var p1 = _p35._0;
		var p2 = _p35._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Set$Set_elm_builtin(p1),
			_1: _elm_lang$core$Set$Set_elm_builtin(p2)
		};
	});

var _elm_community$list_extra$List_Extra$greedyGroupsOfWithStep = F3(
	function (size, step, xs) {
		var okayXs = _elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$List$length(xs),
			0) > 0;
		var okayArgs = (_elm_lang$core$Native_Utils.cmp(size, 0) > 0) && (_elm_lang$core$Native_Utils.cmp(step, 0) > 0);
		var xs_ = A2(_elm_lang$core$List$drop, step, xs);
		var group = A2(_elm_lang$core$List$take, size, xs);
		return (okayArgs && okayXs) ? {
			ctor: '::',
			_0: group,
			_1: A3(_elm_community$list_extra$List_Extra$greedyGroupsOfWithStep, size, step, xs_)
		} : {ctor: '[]'};
	});
var _elm_community$list_extra$List_Extra$greedyGroupsOf = F2(
	function (size, xs) {
		return A3(_elm_community$list_extra$List_Extra$greedyGroupsOfWithStep, size, size, xs);
	});
var _elm_community$list_extra$List_Extra$groupsOfWithStep = F3(
	function (size, step, xs) {
		var okayArgs = (_elm_lang$core$Native_Utils.cmp(size, 0) > 0) && (_elm_lang$core$Native_Utils.cmp(step, 0) > 0);
		var xs_ = A2(_elm_lang$core$List$drop, step, xs);
		var group = A2(_elm_lang$core$List$take, size, xs);
		var okayLength = _elm_lang$core$Native_Utils.eq(
			size,
			_elm_lang$core$List$length(group));
		return (okayArgs && okayLength) ? {
			ctor: '::',
			_0: group,
			_1: A3(_elm_community$list_extra$List_Extra$groupsOfWithStep, size, step, xs_)
		} : {ctor: '[]'};
	});
var _elm_community$list_extra$List_Extra$groupsOf = F2(
	function (size, xs) {
		return A3(_elm_community$list_extra$List_Extra$groupsOfWithStep, size, size, xs);
	});
var _elm_community$list_extra$List_Extra$zip5 = _elm_lang$core$List$map5(
	F5(
		function (v0, v1, v2, v3, v4) {
			return {ctor: '_Tuple5', _0: v0, _1: v1, _2: v2, _3: v3, _4: v4};
		}));
var _elm_community$list_extra$List_Extra$zip4 = _elm_lang$core$List$map4(
	F4(
		function (v0, v1, v2, v3) {
			return {ctor: '_Tuple4', _0: v0, _1: v1, _2: v2, _3: v3};
		}));
var _elm_community$list_extra$List_Extra$zip3 = _elm_lang$core$List$map3(
	F3(
		function (v0, v1, v2) {
			return {ctor: '_Tuple3', _0: v0, _1: v1, _2: v2};
		}));
var _elm_community$list_extra$List_Extra$zip = _elm_lang$core$List$map2(
	F2(
		function (v0, v1) {
			return {ctor: '_Tuple2', _0: v0, _1: v1};
		}));
var _elm_community$list_extra$List_Extra$isPrefixOf = F2(
	function (prefix, xs) {
		var _p0 = {ctor: '_Tuple2', _0: prefix, _1: xs};
		if (_p0._0.ctor === '[]') {
			return true;
		} else {
			if (_p0._1.ctor === '[]') {
				return false;
			} else {
				return _elm_lang$core$Native_Utils.eq(_p0._0._0, _p0._1._0) && A2(_elm_community$list_extra$List_Extra$isPrefixOf, _p0._0._1, _p0._1._1);
			}
		}
	});
var _elm_community$list_extra$List_Extra$isSuffixOf = F2(
	function (suffix, xs) {
		return A2(
			_elm_community$list_extra$List_Extra$isPrefixOf,
			_elm_lang$core$List$reverse(suffix),
			_elm_lang$core$List$reverse(xs));
	});
var _elm_community$list_extra$List_Extra$selectSplit = function (xs) {
	var _p1 = xs;
	if (_p1.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		var _p5 = _p1._1;
		var _p4 = _p1._0;
		return {
			ctor: '::',
			_0: {
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _p4,
				_2: _p5
			},
			_1: A2(
				_elm_lang$core$List$map,
				function (_p2) {
					var _p3 = _p2;
					return {
						ctor: '_Tuple3',
						_0: {ctor: '::', _0: _p4, _1: _p3._0},
						_1: _p3._1,
						_2: _p3._2
					};
				},
				_elm_community$list_extra$List_Extra$selectSplit(_p5))
		};
	}
};
var _elm_community$list_extra$List_Extra$select = function (xs) {
	var _p6 = xs;
	if (_p6.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		var _p10 = _p6._1;
		var _p9 = _p6._0;
		return {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _p9, _1: _p10},
			_1: A2(
				_elm_lang$core$List$map,
				function (_p7) {
					var _p8 = _p7;
					return {
						ctor: '_Tuple2',
						_0: _p8._0,
						_1: {ctor: '::', _0: _p9, _1: _p8._1}
					};
				},
				_elm_community$list_extra$List_Extra$select(_p10))
		};
	}
};
var _elm_community$list_extra$List_Extra$tailsHelp = F2(
	function (e, list) {
		var _p11 = list;
		if (_p11.ctor === '::') {
			var _p12 = _p11._0;
			return {
				ctor: '::',
				_0: {ctor: '::', _0: e, _1: _p12},
				_1: {ctor: '::', _0: _p12, _1: _p11._1}
			};
		} else {
			return {ctor: '[]'};
		}
	});
var _elm_community$list_extra$List_Extra$tails = A2(
	_elm_lang$core$List$foldr,
	_elm_community$list_extra$List_Extra$tailsHelp,
	{
		ctor: '::',
		_0: {ctor: '[]'},
		_1: {ctor: '[]'}
	});
var _elm_community$list_extra$List_Extra$isInfixOf = F2(
	function (infix, xs) {
		return A2(
			_elm_lang$core$List$any,
			_elm_community$list_extra$List_Extra$isPrefixOf(infix),
			_elm_community$list_extra$List_Extra$tails(xs));
	});
var _elm_community$list_extra$List_Extra$inits = A2(
	_elm_lang$core$List$foldr,
	F2(
		function (e, acc) {
			return {
				ctor: '::',
				_0: {ctor: '[]'},
				_1: A2(
					_elm_lang$core$List$map,
					F2(
						function (x, y) {
							return {ctor: '::', _0: x, _1: y};
						})(e),
					acc)
			};
		}),
	{
		ctor: '::',
		_0: {ctor: '[]'},
		_1: {ctor: '[]'}
	});
var _elm_community$list_extra$List_Extra$groupWhileTransitively = F2(
	function (cmp, xs_) {
		var _p13 = xs_;
		if (_p13.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p13._1.ctor === '[]') {
				return {
					ctor: '::',
					_0: {
						ctor: '::',
						_0: _p13._0,
						_1: {ctor: '[]'}
					},
					_1: {ctor: '[]'}
				};
			} else {
				var _p15 = _p13._0;
				var _p14 = A2(_elm_community$list_extra$List_Extra$groupWhileTransitively, cmp, _p13._1);
				if (_p14.ctor === '::') {
					return A2(cmp, _p15, _p13._1._0) ? {
						ctor: '::',
						_0: {ctor: '::', _0: _p15, _1: _p14._0},
						_1: _p14._1
					} : {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: _p15,
							_1: {ctor: '[]'}
						},
						_1: _p14
					};
				} else {
					return {ctor: '[]'};
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$stripPrefix = F2(
	function (prefix, xs) {
		var step = F2(
			function (e, m) {
				var _p16 = m;
				if (_p16.ctor === 'Nothing') {
					return _elm_lang$core$Maybe$Nothing;
				} else {
					if (_p16._0.ctor === '[]') {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						return _elm_lang$core$Native_Utils.eq(e, _p16._0._0) ? _elm_lang$core$Maybe$Just(_p16._0._1) : _elm_lang$core$Maybe$Nothing;
					}
				}
			});
		return A3(
			_elm_lang$core$List$foldl,
			step,
			_elm_lang$core$Maybe$Just(xs),
			prefix);
	});
var _elm_community$list_extra$List_Extra$dropWhileRight = function (p) {
	return A2(
		_elm_lang$core$List$foldr,
		F2(
			function (x, xs) {
				return (p(x) && _elm_lang$core$List$isEmpty(xs)) ? {ctor: '[]'} : {ctor: '::', _0: x, _1: xs};
			}),
		{ctor: '[]'});
};
var _elm_community$list_extra$List_Extra$takeWhileRight = function (p) {
	var step = F2(
		function (x, _p17) {
			var _p18 = _p17;
			var _p19 = _p18._0;
			return (p(x) && _p18._1) ? {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: x, _1: _p19},
				_1: true
			} : {ctor: '_Tuple2', _0: _p19, _1: false};
		});
	return function (_p20) {
		return _elm_lang$core$Tuple$first(
			A3(
				_elm_lang$core$List$foldr,
				step,
				{
					ctor: '_Tuple2',
					_0: {ctor: '[]'},
					_1: true
				},
				_p20));
	};
};
var _elm_community$list_extra$List_Extra$splitAt = F2(
	function (n, xs) {
		return {
			ctor: '_Tuple2',
			_0: A2(_elm_lang$core$List$take, n, xs),
			_1: A2(_elm_lang$core$List$drop, n, xs)
		};
	});
var _elm_community$list_extra$List_Extra$groupsOfVarying_ = F3(
	function (listOflengths, list, accu) {
		groupsOfVarying_:
		while (true) {
			var _p21 = {ctor: '_Tuple2', _0: listOflengths, _1: list};
			if (((_p21.ctor === '_Tuple2') && (_p21._0.ctor === '::')) && (_p21._1.ctor === '::')) {
				var _p22 = A2(_elm_community$list_extra$List_Extra$splitAt, _p21._0._0, list);
				var head = _p22._0;
				var tail = _p22._1;
				var _v11 = _p21._0._1,
					_v12 = tail,
					_v13 = {ctor: '::', _0: head, _1: accu};
				listOflengths = _v11;
				list = _v12;
				accu = _v13;
				continue groupsOfVarying_;
			} else {
				return _elm_lang$core$List$reverse(accu);
			}
		}
	});
var _elm_community$list_extra$List_Extra$groupsOfVarying = F2(
	function (listOflengths, list) {
		return A3(
			_elm_community$list_extra$List_Extra$groupsOfVarying_,
			listOflengths,
			list,
			{ctor: '[]'});
	});
var _elm_community$list_extra$List_Extra$unfoldr = F2(
	function (f, seed) {
		var _p23 = f(seed);
		if (_p23.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			return {
				ctor: '::',
				_0: _p23._0._0,
				_1: A2(_elm_community$list_extra$List_Extra$unfoldr, f, _p23._0._1)
			};
		}
	});
var _elm_community$list_extra$List_Extra$scanr1 = F2(
	function (f, xs_) {
		var _p24 = xs_;
		if (_p24.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p24._1.ctor === '[]') {
				return {
					ctor: '::',
					_0: _p24._0,
					_1: {ctor: '[]'}
				};
			} else {
				var _p25 = A2(_elm_community$list_extra$List_Extra$scanr1, f, _p24._1);
				if (_p25.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, _p24._0, _p25._0),
						_1: _p25
					};
				} else {
					return {ctor: '[]'};
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$scanr = F3(
	function (f, acc, xs_) {
		var _p26 = xs_;
		if (_p26.ctor === '[]') {
			return {
				ctor: '::',
				_0: acc,
				_1: {ctor: '[]'}
			};
		} else {
			var _p27 = A3(_elm_community$list_extra$List_Extra$scanr, f, acc, _p26._1);
			if (_p27.ctor === '::') {
				return {
					ctor: '::',
					_0: A2(f, _p26._0, _p27._0),
					_1: _p27
				};
			} else {
				return {ctor: '[]'};
			}
		}
	});
var _elm_community$list_extra$List_Extra$scanl1 = F2(
	function (f, xs_) {
		var _p28 = xs_;
		if (_p28.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			return A3(_elm_lang$core$List$scanl, f, _p28._0, _p28._1);
		}
	});
var _elm_community$list_extra$List_Extra$indexedFoldr = F3(
	function (func, acc, list) {
		var step = F2(
			function (x, _p29) {
				var _p30 = _p29;
				var _p31 = _p30._0;
				return {
					ctor: '_Tuple2',
					_0: _p31 - 1,
					_1: A3(func, _p31, x, _p30._1)
				};
			});
		return _elm_lang$core$Tuple$second(
			A3(
				_elm_lang$core$List$foldr,
				step,
				{
					ctor: '_Tuple2',
					_0: _elm_lang$core$List$length(list) - 1,
					_1: acc
				},
				list));
	});
var _elm_community$list_extra$List_Extra$indexedFoldl = F3(
	function (func, acc, list) {
		var step = F2(
			function (x, _p32) {
				var _p33 = _p32;
				var _p34 = _p33._0;
				return {
					ctor: '_Tuple2',
					_0: _p34 + 1,
					_1: A3(func, _p34, x, _p33._1)
				};
			});
		return _elm_lang$core$Tuple$second(
			A3(
				_elm_lang$core$List$foldl,
				step,
				{ctor: '_Tuple2', _0: 0, _1: acc},
				list));
	});
var _elm_community$list_extra$List_Extra$foldr1 = F2(
	function (f, xs) {
		var mf = F2(
			function (x, m) {
				return _elm_lang$core$Maybe$Just(
					function () {
						var _p35 = m;
						if (_p35.ctor === 'Nothing') {
							return x;
						} else {
							return A2(f, x, _p35._0);
						}
					}());
			});
		return A3(_elm_lang$core$List$foldr, mf, _elm_lang$core$Maybe$Nothing, xs);
	});
var _elm_community$list_extra$List_Extra$foldl1 = F2(
	function (f, xs) {
		var mf = F2(
			function (x, m) {
				return _elm_lang$core$Maybe$Just(
					function () {
						var _p36 = m;
						if (_p36.ctor === 'Nothing') {
							return x;
						} else {
							return A2(f, _p36._0, x);
						}
					}());
			});
		return A3(_elm_lang$core$List$foldl, mf, _elm_lang$core$Maybe$Nothing, xs);
	});
var _elm_community$list_extra$List_Extra$interweaveHelp = F3(
	function (l1, l2, acc) {
		interweaveHelp:
		while (true) {
			var _p37 = {ctor: '_Tuple2', _0: l1, _1: l2};
			_v24_1:
			do {
				if (_p37._0.ctor === '::') {
					if (_p37._1.ctor === '::') {
						var _v25 = _p37._0._1,
							_v26 = _p37._1._1,
							_v27 = A2(
							_elm_lang$core$Basics_ops['++'],
							acc,
							{
								ctor: '::',
								_0: _p37._0._0,
								_1: {
									ctor: '::',
									_0: _p37._1._0,
									_1: {ctor: '[]'}
								}
							});
						l1 = _v25;
						l2 = _v26;
						acc = _v27;
						continue interweaveHelp;
					} else {
						break _v24_1;
					}
				} else {
					if (_p37._1.ctor === '[]') {
						break _v24_1;
					} else {
						return A2(_elm_lang$core$Basics_ops['++'], acc, _p37._1);
					}
				}
			} while(false);
			return A2(_elm_lang$core$Basics_ops['++'], acc, _p37._0);
		}
	});
var _elm_community$list_extra$List_Extra$interweave = F2(
	function (l1, l2) {
		return A3(
			_elm_community$list_extra$List_Extra$interweaveHelp,
			l1,
			l2,
			{ctor: '[]'});
	});
var _elm_community$list_extra$List_Extra$permutations = function (xs_) {
	var _p38 = xs_;
	if (_p38.ctor === '[]') {
		return {
			ctor: '::',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		};
	} else {
		var f = function (_p39) {
			var _p40 = _p39;
			return A2(
				_elm_lang$core$List$map,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					})(_p40._0),
				_elm_community$list_extra$List_Extra$permutations(_p40._1));
		};
		return A2(
			_elm_lang$core$List$concatMap,
			f,
			_elm_community$list_extra$List_Extra$select(_p38));
	}
};
var _elm_community$list_extra$List_Extra$isPermutationOf = F2(
	function (permut, xs) {
		return A2(
			_elm_lang$core$List$member,
			permut,
			_elm_community$list_extra$List_Extra$permutations(xs));
	});
var _elm_community$list_extra$List_Extra$subsequencesNonEmpty = function (xs) {
	var _p41 = xs;
	if (_p41.ctor === '[]') {
		return {ctor: '[]'};
	} else {
		var _p42 = _p41._0;
		var f = F2(
			function (ys, r) {
				return {
					ctor: '::',
					_0: ys,
					_1: {
						ctor: '::',
						_0: {ctor: '::', _0: _p42, _1: ys},
						_1: r
					}
				};
			});
		return {
			ctor: '::',
			_0: {
				ctor: '::',
				_0: _p42,
				_1: {ctor: '[]'}
			},
			_1: A3(
				_elm_lang$core$List$foldr,
				f,
				{ctor: '[]'},
				_elm_community$list_extra$List_Extra$subsequencesNonEmpty(_p41._1))
		};
	}
};
var _elm_community$list_extra$List_Extra$subsequences = function (xs) {
	return {
		ctor: '::',
		_0: {ctor: '[]'},
		_1: _elm_community$list_extra$List_Extra$subsequencesNonEmpty(xs)
	};
};
var _elm_community$list_extra$List_Extra$isSubsequenceOf = F2(
	function (subseq, xs) {
		return A2(
			_elm_lang$core$List$member,
			subseq,
			_elm_community$list_extra$List_Extra$subsequences(xs));
	});
var _elm_community$list_extra$List_Extra$transpose = function (ll) {
	transpose:
	while (true) {
		var _p43 = ll;
		if (_p43.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p43._0.ctor === '[]') {
				var _v32 = _p43._1;
				ll = _v32;
				continue transpose;
			} else {
				var _p44 = _p43._1;
				var tails = A2(_elm_lang$core$List$filterMap, _elm_lang$core$List$tail, _p44);
				var heads = A2(_elm_lang$core$List$filterMap, _elm_lang$core$List$head, _p44);
				return {
					ctor: '::',
					_0: {ctor: '::', _0: _p43._0._0, _1: heads},
					_1: _elm_community$list_extra$List_Extra$transpose(
						{ctor: '::', _0: _p43._0._1, _1: tails})
				};
			}
		}
	}
};
var _elm_community$list_extra$List_Extra$intercalate = function (xs) {
	return function (_p45) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$intersperse, xs, _p45));
	};
};
var _elm_community$list_extra$List_Extra$filterNot = F2(
	function (pred, list) {
		return A2(
			_elm_lang$core$List$filter,
			function (_p46) {
				return !pred(_p46);
			},
			list);
	});
var _elm_community$list_extra$List_Extra$removeAt = F2(
	function (index, l) {
		if (_elm_lang$core$Native_Utils.cmp(index, 0) < 0) {
			return l;
		} else {
			var tail = _elm_lang$core$List$tail(
				A2(_elm_lang$core$List$drop, index, l));
			var head = A2(_elm_lang$core$List$take, index, l);
			var _p47 = tail;
			if (_p47.ctor === 'Nothing') {
				return l;
			} else {
				return A2(_elm_lang$core$List$append, head, _p47._0);
			}
		}
	});
var _elm_community$list_extra$List_Extra$singleton = function (x) {
	return {
		ctor: '::',
		_0: x,
		_1: {ctor: '[]'}
	};
};
var _elm_community$list_extra$List_Extra$stableSortWith = F2(
	function (pred, list) {
		var predWithIndex = F2(
			function (_p49, _p48) {
				var _p50 = _p49;
				var _p51 = _p48;
				var result = A2(pred, _p50._0, _p51._0);
				var _p52 = result;
				if (_p52.ctor === 'EQ') {
					return A2(_elm_lang$core$Basics$compare, _p50._1, _p51._1);
				} else {
					return result;
				}
			});
		var listWithIndex = A2(
			_elm_lang$core$List$indexedMap,
			F2(
				function (i, a) {
					return {ctor: '_Tuple2', _0: a, _1: i};
				}),
			list);
		return A2(
			_elm_lang$core$List$map,
			_elm_lang$core$Tuple$first,
			A2(_elm_lang$core$List$sortWith, predWithIndex, listWithIndex));
	});
var _elm_community$list_extra$List_Extra$setAt = F3(
	function (index, value, l) {
		if (_elm_lang$core$Native_Utils.cmp(index, 0) < 0) {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var tail = _elm_lang$core$List$tail(
				A2(_elm_lang$core$List$drop, index, l));
			var head = A2(_elm_lang$core$List$take, index, l);
			var _p53 = tail;
			if (_p53.ctor === 'Nothing') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(
					A2(
						_elm_lang$core$List$append,
						head,
						{ctor: '::', _0: value, _1: _p53._0}));
			}
		}
	});
var _elm_community$list_extra$List_Extra$remove = F2(
	function (x, xs) {
		var _p54 = xs;
		if (_p54.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p56 = _p54._1;
			var _p55 = _p54._0;
			return _elm_lang$core$Native_Utils.eq(x, _p55) ? _p56 : {
				ctor: '::',
				_0: _p55,
				_1: A2(_elm_community$list_extra$List_Extra$remove, x, _p56)
			};
		}
	});
var _elm_community$list_extra$List_Extra$updateIfIndex = F3(
	function (predicate, update, list) {
		return A2(
			_elm_lang$core$List$indexedMap,
			F2(
				function (i, x) {
					return predicate(i) ? update(x) : x;
				}),
			list);
	});
var _elm_community$list_extra$List_Extra$updateAt = F3(
	function (index, update, list) {
		return ((_elm_lang$core$Native_Utils.cmp(index, 0) < 0) || (_elm_lang$core$Native_Utils.cmp(
			index,
			_elm_lang$core$List$length(list)) > -1)) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
			A3(
				_elm_community$list_extra$List_Extra$updateIfIndex,
				F2(
					function (x, y) {
						return _elm_lang$core$Native_Utils.eq(x, y);
					})(index),
				update,
				list));
	});
var _elm_community$list_extra$List_Extra$updateIf = F3(
	function (predicate, update, list) {
		return A2(
			_elm_lang$core$List$map,
			function (item) {
				return predicate(item) ? update(item) : item;
			},
			list);
	});
var _elm_community$list_extra$List_Extra$replaceIf = F3(
	function (predicate, replacement, list) {
		return A3(
			_elm_community$list_extra$List_Extra$updateIf,
			predicate,
			_elm_lang$core$Basics$always(replacement),
			list);
	});
var _elm_community$list_extra$List_Extra$findIndices = function (p) {
	return function (_p57) {
		return A2(
			_elm_lang$core$List$map,
			_elm_lang$core$Tuple$first,
			A2(
				_elm_lang$core$List$filter,
				function (_p58) {
					var _p59 = _p58;
					return p(_p59._1);
				},
				A2(
					_elm_lang$core$List$indexedMap,
					F2(
						function (v0, v1) {
							return {ctor: '_Tuple2', _0: v0, _1: v1};
						}),
					_p57)));
	};
};
var _elm_community$list_extra$List_Extra$findIndex = function (p) {
	return function (_p60) {
		return _elm_lang$core$List$head(
			A2(_elm_community$list_extra$List_Extra$findIndices, p, _p60));
	};
};
var _elm_community$list_extra$List_Extra$elemIndices = function (x) {
	return _elm_community$list_extra$List_Extra$findIndices(
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.eq(x, y);
			})(x));
};
var _elm_community$list_extra$List_Extra$elemIndex = function (x) {
	return _elm_community$list_extra$List_Extra$findIndex(
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.eq(x, y);
			})(x));
};
var _elm_community$list_extra$List_Extra$find = F2(
	function (predicate, list) {
		find:
		while (true) {
			var _p61 = list;
			if (_p61.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p62 = _p61._0;
				if (predicate(_p62)) {
					return _elm_lang$core$Maybe$Just(_p62);
				} else {
					var _v41 = predicate,
						_v42 = _p61._1;
					predicate = _v41;
					list = _v42;
					continue find;
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$notMember = function (x) {
	return function (_p63) {
		return !A2(_elm_lang$core$List$member, x, _p63);
	};
};
var _elm_community$list_extra$List_Extra$andThen = _elm_lang$core$List$concatMap;
var _elm_community$list_extra$List_Extra$lift2 = F3(
	function (f, la, lb) {
		return A2(
			_elm_community$list_extra$List_Extra$andThen,
			function (a) {
				return A2(
					_elm_community$list_extra$List_Extra$andThen,
					function (b) {
						return {
							ctor: '::',
							_0: A2(f, a, b),
							_1: {ctor: '[]'}
						};
					},
					lb);
			},
			la);
	});
var _elm_community$list_extra$List_Extra$lift3 = F4(
	function (f, la, lb, lc) {
		return A2(
			_elm_community$list_extra$List_Extra$andThen,
			function (a) {
				return A2(
					_elm_community$list_extra$List_Extra$andThen,
					function (b) {
						return A2(
							_elm_community$list_extra$List_Extra$andThen,
							function (c) {
								return {
									ctor: '::',
									_0: A3(f, a, b, c),
									_1: {ctor: '[]'}
								};
							},
							lc);
					},
					lb);
			},
			la);
	});
var _elm_community$list_extra$List_Extra$lift4 = F5(
	function (f, la, lb, lc, ld) {
		return A2(
			_elm_community$list_extra$List_Extra$andThen,
			function (a) {
				return A2(
					_elm_community$list_extra$List_Extra$andThen,
					function (b) {
						return A2(
							_elm_community$list_extra$List_Extra$andThen,
							function (c) {
								return A2(
									_elm_community$list_extra$List_Extra$andThen,
									function (d) {
										return {
											ctor: '::',
											_0: A4(f, a, b, c, d),
											_1: {ctor: '[]'}
										};
									},
									ld);
							},
							lc);
					},
					lb);
			},
			la);
	});
var _elm_community$list_extra$List_Extra$andMap = F2(
	function (l, fl) {
		return A3(
			_elm_lang$core$List$map2,
			F2(
				function (x, y) {
					return x(y);
				}),
			fl,
			l);
	});
var _elm_community$list_extra$List_Extra$uniqueHelp = F3(
	function (f, existing, remaining) {
		uniqueHelp:
		while (true) {
			var _p64 = remaining;
			if (_p64.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				var _p66 = _p64._1;
				var _p65 = _p64._0;
				var computedFirst = f(_p65);
				if (A2(_elm_lang$core$Set$member, computedFirst, existing)) {
					var _v44 = f,
						_v45 = existing,
						_v46 = _p66;
					f = _v44;
					existing = _v45;
					remaining = _v46;
					continue uniqueHelp;
				} else {
					return {
						ctor: '::',
						_0: _p65,
						_1: A3(
							_elm_community$list_extra$List_Extra$uniqueHelp,
							f,
							A2(_elm_lang$core$Set$insert, computedFirst, existing),
							_p66)
					};
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$uniqueBy = F2(
	function (f, list) {
		return A3(_elm_community$list_extra$List_Extra$uniqueHelp, f, _elm_lang$core$Set$empty, list);
	});
var _elm_community$list_extra$List_Extra$allDifferentBy = F2(
	function (f, list) {
		return _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$List$length(list),
			_elm_lang$core$List$length(
				A2(_elm_community$list_extra$List_Extra$uniqueBy, f, list)));
	});
var _elm_community$list_extra$List_Extra$allDifferent = function (list) {
	return A2(_elm_community$list_extra$List_Extra$allDifferentBy, _elm_lang$core$Basics$identity, list);
};
var _elm_community$list_extra$List_Extra$unique = function (list) {
	return A3(_elm_community$list_extra$List_Extra$uniqueHelp, _elm_lang$core$Basics$identity, _elm_lang$core$Set$empty, list);
};
var _elm_community$list_extra$List_Extra$dropWhile = F2(
	function (predicate, list) {
		dropWhile:
		while (true) {
			var _p67 = list;
			if (_p67.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				if (predicate(_p67._0)) {
					var _v48 = predicate,
						_v49 = _p67._1;
					predicate = _v48;
					list = _v49;
					continue dropWhile;
				} else {
					return list;
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$takeWhile = function (predicate) {
	var takeWhileMemo = F2(
		function (memo, list) {
			takeWhileMemo:
			while (true) {
				var _p68 = list;
				if (_p68.ctor === '[]') {
					return _elm_lang$core$List$reverse(memo);
				} else {
					var _p69 = _p68._0;
					if (predicate(_p69)) {
						var _v51 = {ctor: '::', _0: _p69, _1: memo},
							_v52 = _p68._1;
						memo = _v51;
						list = _v52;
						continue takeWhileMemo;
					} else {
						return _elm_lang$core$List$reverse(memo);
					}
				}
			}
		});
	return takeWhileMemo(
		{ctor: '[]'});
};
var _elm_community$list_extra$List_Extra$span = F2(
	function (p, xs) {
		return {
			ctor: '_Tuple2',
			_0: A2(_elm_community$list_extra$List_Extra$takeWhile, p, xs),
			_1: A2(_elm_community$list_extra$List_Extra$dropWhile, p, xs)
		};
	});
var _elm_community$list_extra$List_Extra$break = function (p) {
	return _elm_community$list_extra$List_Extra$span(
		function (_p70) {
			return !p(_p70);
		});
};
var _elm_community$list_extra$List_Extra$groupWhile = F2(
	function (eq, xs_) {
		var _p71 = xs_;
		if (_p71.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p73 = _p71._0;
			var _p72 = A2(
				_elm_community$list_extra$List_Extra$span,
				eq(_p73),
				_p71._1);
			var ys = _p72._0;
			var zs = _p72._1;
			return {
				ctor: '::',
				_0: {ctor: '::', _0: _p73, _1: ys},
				_1: A2(_elm_community$list_extra$List_Extra$groupWhile, eq, zs)
			};
		}
	});
var _elm_community$list_extra$List_Extra$group = _elm_community$list_extra$List_Extra$groupWhile(
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.eq(x, y);
		}));
var _elm_community$list_extra$List_Extra$minimumBy = F2(
	function (f, ls) {
		var minBy = F2(
			function (x, _p74) {
				var _p75 = _p74;
				var _p76 = _p75._1;
				var fx = f(x);
				return (_elm_lang$core$Native_Utils.cmp(fx, _p76) < 0) ? {ctor: '_Tuple2', _0: x, _1: fx} : {ctor: '_Tuple2', _0: _p75._0, _1: _p76};
			});
		var _p77 = ls;
		if (_p77.ctor === '::') {
			if (_p77._1.ctor === '[]') {
				return _elm_lang$core$Maybe$Just(_p77._0);
			} else {
				var _p78 = _p77._0;
				return _elm_lang$core$Maybe$Just(
					_elm_lang$core$Tuple$first(
						A3(
							_elm_lang$core$List$foldl,
							minBy,
							{
								ctor: '_Tuple2',
								_0: _p78,
								_1: f(_p78)
							},
							_p77._1)));
			}
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_community$list_extra$List_Extra$maximumBy = F2(
	function (f, ls) {
		var maxBy = F2(
			function (x, _p79) {
				var _p80 = _p79;
				var _p81 = _p80._1;
				var fx = f(x);
				return (_elm_lang$core$Native_Utils.cmp(fx, _p81) > 0) ? {ctor: '_Tuple2', _0: x, _1: fx} : {ctor: '_Tuple2', _0: _p80._0, _1: _p81};
			});
		var _p82 = ls;
		if (_p82.ctor === '::') {
			if (_p82._1.ctor === '[]') {
				return _elm_lang$core$Maybe$Just(_p82._0);
			} else {
				var _p83 = _p82._0;
				return _elm_lang$core$Maybe$Just(
					_elm_lang$core$Tuple$first(
						A3(
							_elm_lang$core$List$foldl,
							maxBy,
							{
								ctor: '_Tuple2',
								_0: _p83,
								_1: f(_p83)
							},
							_p82._1)));
			}
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_community$list_extra$List_Extra$uncons = function (xs) {
	var _p84 = xs;
	if (_p84.ctor === '[]') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(
			{ctor: '_Tuple2', _0: _p84._0, _1: _p84._1});
	}
};
var _elm_community$list_extra$List_Extra$swapAt = F3(
	function (index1, index2, l) {
		swapAt:
		while (true) {
			if (_elm_lang$core$Native_Utils.eq(index1, index2)) {
				return _elm_lang$core$Maybe$Just(l);
			} else {
				if (_elm_lang$core$Native_Utils.cmp(index1, index2) > 0) {
					var _v59 = index2,
						_v60 = index1,
						_v61 = l;
					index1 = _v59;
					index2 = _v60;
					l = _v61;
					continue swapAt;
				} else {
					if (_elm_lang$core$Native_Utils.cmp(index1, 0) < 0) {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						var _p85 = A2(_elm_community$list_extra$List_Extra$splitAt, index1, l);
						var part1 = _p85._0;
						var tail1 = _p85._1;
						var _p86 = A2(_elm_community$list_extra$List_Extra$splitAt, index2 - index1, tail1);
						var head2 = _p86._0;
						var tail2 = _p86._1;
						return A3(
							_elm_lang$core$Maybe$map2,
							F2(
								function (_p88, _p87) {
									var _p89 = _p88;
									var _p90 = _p87;
									return _elm_lang$core$List$concat(
										{
											ctor: '::',
											_0: part1,
											_1: {
												ctor: '::',
												_0: {ctor: '::', _0: _p90._0, _1: _p89._1},
												_1: {
													ctor: '::',
													_0: {ctor: '::', _0: _p89._0, _1: _p90._1},
													_1: {ctor: '[]'}
												}
											}
										});
								}),
							_elm_community$list_extra$List_Extra$uncons(head2),
							_elm_community$list_extra$List_Extra$uncons(tail2));
					}
				}
			}
		}
	});
var _elm_community$list_extra$List_Extra$iterate = F2(
	function (f, x) {
		var _p91 = f(x);
		if (_p91.ctor === 'Just') {
			return {
				ctor: '::',
				_0: x,
				_1: A2(_elm_community$list_extra$List_Extra$iterate, f, _p91._0)
			};
		} else {
			return {
				ctor: '::',
				_0: x,
				_1: {ctor: '[]'}
			};
		}
	});
var _elm_community$list_extra$List_Extra$getAt = F2(
	function (idx, xs) {
		return (_elm_lang$core$Native_Utils.cmp(idx, 0) < 0) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$List$head(
			A2(_elm_lang$core$List$drop, idx, xs));
	});
var _elm_community$list_extra$List_Extra_ops = _elm_community$list_extra$List_Extra_ops || {};
_elm_community$list_extra$List_Extra_ops['!!'] = _elm_lang$core$Basics$flip(_elm_community$list_extra$List_Extra$getAt);
var _elm_community$list_extra$List_Extra$init = function () {
	var maybe = F2(
		function (d, f) {
			return function (_p92) {
				return A2(
					_elm_lang$core$Maybe$withDefault,
					d,
					A2(_elm_lang$core$Maybe$map, f, _p92));
			};
		});
	return A2(
		_elm_lang$core$List$foldr,
		function (x) {
			return function (_p93) {
				return _elm_lang$core$Maybe$Just(
					A3(
						maybe,
						{ctor: '[]'},
						F2(
							function (x, y) {
								return {ctor: '::', _0: x, _1: y};
							})(x),
						_p93));
			};
		},
		_elm_lang$core$Maybe$Nothing);
}();
var _elm_community$list_extra$List_Extra$last = _elm_community$list_extra$List_Extra$foldl1(
	_elm_lang$core$Basics$flip(_elm_lang$core$Basics$always));

var _rtfeldman$hex$Hex$toString = function (num) {
	return _elm_lang$core$String$fromList(
		(_elm_lang$core$Native_Utils.cmp(num, 0) < 0) ? {
			ctor: '::',
			_0: _elm_lang$core$Native_Utils.chr('-'),
			_1: A2(
				_rtfeldman$hex$Hex$unsafePositiveToDigits,
				{ctor: '[]'},
				_elm_lang$core$Basics$negate(num))
		} : A2(
			_rtfeldman$hex$Hex$unsafePositiveToDigits,
			{ctor: '[]'},
			num));
};
var _rtfeldman$hex$Hex$unsafePositiveToDigits = F2(
	function (digits, num) {
		unsafePositiveToDigits:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(num, 16) < 0) {
				return {
					ctor: '::',
					_0: _rtfeldman$hex$Hex$unsafeToDigit(num),
					_1: digits
				};
			} else {
				var _v0 = {
					ctor: '::',
					_0: _rtfeldman$hex$Hex$unsafeToDigit(
						A2(_elm_lang$core$Basics_ops['%'], num, 16)),
					_1: digits
				},
					_v1 = (num / 16) | 0;
				digits = _v0;
				num = _v1;
				continue unsafePositiveToDigits;
			}
		}
	});
var _rtfeldman$hex$Hex$unsafeToDigit = function (num) {
	var _p0 = num;
	switch (_p0) {
		case 0:
			return _elm_lang$core$Native_Utils.chr('0');
		case 1:
			return _elm_lang$core$Native_Utils.chr('1');
		case 2:
			return _elm_lang$core$Native_Utils.chr('2');
		case 3:
			return _elm_lang$core$Native_Utils.chr('3');
		case 4:
			return _elm_lang$core$Native_Utils.chr('4');
		case 5:
			return _elm_lang$core$Native_Utils.chr('5');
		case 6:
			return _elm_lang$core$Native_Utils.chr('6');
		case 7:
			return _elm_lang$core$Native_Utils.chr('7');
		case 8:
			return _elm_lang$core$Native_Utils.chr('8');
		case 9:
			return _elm_lang$core$Native_Utils.chr('9');
		case 10:
			return _elm_lang$core$Native_Utils.chr('a');
		case 11:
			return _elm_lang$core$Native_Utils.chr('b');
		case 12:
			return _elm_lang$core$Native_Utils.chr('c');
		case 13:
			return _elm_lang$core$Native_Utils.chr('d');
		case 14:
			return _elm_lang$core$Native_Utils.chr('e');
		case 15:
			return _elm_lang$core$Native_Utils.chr('f');
		default:
			return _elm_lang$core$Native_Utils.crashCase(
				'Hex',
				{
					start: {line: 138, column: 5},
					end: {line: 188, column: 84}
				},
				_p0)(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'Tried to convert ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_rtfeldman$hex$Hex$toString(num),
						' to hexadecimal.')));
	}
};
var _rtfeldman$hex$Hex$fromStringHelp = F3(
	function (position, chars, accumulated) {
		var _p2 = chars;
		if (_p2.ctor === '[]') {
			return _elm_lang$core$Result$Ok(accumulated);
		} else {
			var recurse = function (additional) {
				return A3(
					_rtfeldman$hex$Hex$fromStringHelp,
					position - 1,
					_p2._1,
					accumulated + (additional * Math.pow(16, position)));
			};
			var _p3 = _p2._0;
			switch (_p3.valueOf()) {
				case '0':
					return recurse(0);
				case '1':
					return recurse(1);
				case '2':
					return recurse(2);
				case '3':
					return recurse(3);
				case '4':
					return recurse(4);
				case '5':
					return recurse(5);
				case '6':
					return recurse(6);
				case '7':
					return recurse(7);
				case '8':
					return recurse(8);
				case '9':
					return recurse(9);
				case 'a':
					return recurse(10);
				case 'b':
					return recurse(11);
				case 'c':
					return recurse(12);
				case 'd':
					return recurse(13);
				case 'e':
					return recurse(14);
				case 'f':
					return recurse(15);
				default:
					return _elm_lang$core$Result$Err(
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(_p3),
							' is not a valid hexadecimal character.'));
			}
		}
	});
var _rtfeldman$hex$Hex$fromString = function (str) {
	if (_elm_lang$core$String$isEmpty(str)) {
		return _elm_lang$core$Result$Err('Empty strings are not valid hexadecimal strings.');
	} else {
		var formatError = function (err) {
			return A2(
				_elm_lang$core$String$join,
				' ',
				{
					ctor: '::',
					_0: _elm_lang$core$Basics$toString(str),
					_1: {
						ctor: '::',
						_0: 'is not a valid hexadecimal string because',
						_1: {
							ctor: '::',
							_0: err,
							_1: {ctor: '[]'}
						}
					}
				});
		};
		var result = function () {
			if (A2(_elm_lang$core$String$startsWith, '-', str)) {
				var list = A2(
					_elm_lang$core$Maybe$withDefault,
					{ctor: '[]'},
					_elm_lang$core$List$tail(
						_elm_lang$core$String$toList(str)));
				return A2(
					_elm_lang$core$Result$map,
					_elm_lang$core$Basics$negate,
					A3(
						_rtfeldman$hex$Hex$fromStringHelp,
						_elm_lang$core$List$length(list) - 1,
						list,
						0));
			} else {
				return A3(
					_rtfeldman$hex$Hex$fromStringHelp,
					_elm_lang$core$String$length(str) - 1,
					_elm_lang$core$String$toList(str),
					0);
			}
		}();
		return A2(_elm_lang$core$Result$mapError, formatError, result);
	}
};

var _Bogdanp$elm_ast$Ast_Expression$op = F2(
	function (ops, n) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			{ctor: '_Tuple2', _0: _Bogdanp$elm_ast$Ast_BinOp$L, _1: 9},
			A2(_elm_lang$core$Dict$get, n, ops));
	});
var _Bogdanp$elm_ast$Ast_Expression$assoc = F2(
	function (ops, n) {
		return _elm_lang$core$Tuple$first(
			A2(_Bogdanp$elm_ast$Ast_Expression$op, ops, n));
	});
var _Bogdanp$elm_ast$Ast_Expression$level = F2(
	function (ops, n) {
		return _elm_lang$core$Tuple$second(
			A2(_Bogdanp$elm_ast$Ast_Expression$op, ops, n));
	});
var _Bogdanp$elm_ast$Ast_Expression$hasLevel = F3(
	function (ops, l, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Utils.eq(
			A2(_Bogdanp$elm_ast$Ast_Expression$level, ops, _p1._0),
			l);
	});
var _Bogdanp$elm_ast$Ast_Expression$findAssoc = F3(
	function (ops, l, eops) {
		var lops = A2(
			_elm_lang$core$List$filter,
			A2(_Bogdanp$elm_ast$Ast_Expression$hasLevel, ops, l),
			eops);
		var assocs = A2(
			_elm_lang$core$List$map,
			function (_p2) {
				return A2(
					_Bogdanp$elm_ast$Ast_Expression$assoc,
					ops,
					_elm_lang$core$Tuple$first(_p2));
			},
			lops);
		var error = function (issue) {
			var operators = A2(
				_elm_lang$core$String$join,
				' and ',
				A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$first, lops));
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'conflicting ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					issue,
					A2(_elm_lang$core$Basics_ops['++'], ' for operators ', operators)));
		};
		if (A2(
			_elm_lang$core$List$all,
			F2(
				function (x, y) {
					return _elm_lang$core$Native_Utils.eq(x, y);
				})(_Bogdanp$elm_ast$Ast_BinOp$L),
			assocs)) {
			return _elm_community$parser_combinators$Combine$succeed(_Bogdanp$elm_ast$Ast_BinOp$L);
		} else {
			if (A2(
				_elm_lang$core$List$all,
				F2(
					function (x, y) {
						return _elm_lang$core$Native_Utils.eq(x, y);
					})(_Bogdanp$elm_ast$Ast_BinOp$R),
				assocs)) {
				return _elm_community$parser_combinators$Combine$succeed(_Bogdanp$elm_ast$Ast_BinOp$R);
			} else {
				if (A2(
					_elm_lang$core$List$all,
					F2(
						function (x, y) {
							return _elm_lang$core$Native_Utils.eq(x, y);
						})(_Bogdanp$elm_ast$Ast_BinOp$N),
					assocs)) {
					var _p3 = assocs;
					if ((_p3.ctor === '::') && (_p3._1.ctor === '[]')) {
						return _elm_community$parser_combinators$Combine$succeed(_Bogdanp$elm_ast$Ast_BinOp$N);
					} else {
						return _elm_community$parser_combinators$Combine$fail(
							error('precedence'));
					}
				} else {
					return _elm_community$parser_combinators$Combine$fail(
						error('associativity'));
				}
			}
		}
	});
var _Bogdanp$elm_ast$Ast_Expression$Stop = function (a) {
	return {ctor: 'Stop', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$Cont = function (a) {
	return {ctor: 'Cont', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$BinOp = F3(
	function (a, b, c) {
		return {ctor: 'BinOp', _0: a, _1: b, _2: c};
	});
var _Bogdanp$elm_ast$Ast_Expression$Application = F2(
	function (a, b) {
		return {ctor: 'Application', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Expression$Lambda = F2(
	function (a, b) {
		return {ctor: 'Lambda', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Expression$Case = F2(
	function (a, b) {
		return {ctor: 'Case', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Expression$Let = F2(
	function (a, b) {
		return {ctor: 'Let', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Expression$If = F3(
	function (a, b, c) {
		return {ctor: 'If', _0: a, _1: b, _2: c};
	});
var _Bogdanp$elm_ast$Ast_Expression$RecordUpdate = F2(
	function (a, b) {
		return {ctor: 'RecordUpdate', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Expression$Record = function (a) {
	return {ctor: 'Record', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$AccessFunction = function (a) {
	return {ctor: 'AccessFunction', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$accessFunction = A2(
	_elm_community$parser_combinators$Combine_ops['<$>'],
	_Bogdanp$elm_ast$Ast_Expression$AccessFunction,
	A2(
		_elm_community$parser_combinators$Combine_ops['*>'],
		_elm_community$parser_combinators$Combine$string('.'),
		_Bogdanp$elm_ast$Ast_Helpers$loName));
var _Bogdanp$elm_ast$Ast_Expression$Access = F2(
	function (a, b) {
		return {ctor: 'Access', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Expression$Tuple = function (a) {
	return {ctor: 'Tuple', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$List = function (a) {
	return {ctor: 'List', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$Variable = function (a) {
	return {ctor: 'Variable', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$variable = A2(
	_elm_community$parser_combinators$Combine_ops['<$>'],
	_Bogdanp$elm_ast$Ast_Expression$Variable,
	_elm_community$parser_combinators$Combine$choice(
		{
			ctor: '::',
			_0: A2(_elm_community$parser_combinators$Combine_ops['<$>'], _elm_community$list_extra$List_Extra$singleton, _Bogdanp$elm_ast$Ast_Helpers$emptyTuple),
			_1: {
				ctor: '::',
				_0: A2(_elm_community$parser_combinators$Combine_ops['<$>'], _elm_community$list_extra$List_Extra$singleton, _Bogdanp$elm_ast$Ast_Helpers$loName),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_community$parser_combinators$Combine$sepBy1,
						_elm_community$parser_combinators$Combine$string('.'),
						_Bogdanp$elm_ast$Ast_Helpers$upName),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_community$parser_combinators$Combine_ops['<$>'],
							_elm_community$list_extra$List_Extra$singleton,
							_elm_community$parser_combinators$Combine$parens(_Bogdanp$elm_ast$Ast_Helpers$operator)),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_community$parser_combinators$Combine_ops['<$>'],
								_elm_community$list_extra$List_Extra$singleton,
								_elm_community$parser_combinators$Combine$parens(
									_elm_community$parser_combinators$Combine$regex(',+'))),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}));
var _Bogdanp$elm_ast$Ast_Expression$access = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(_elm_community$parser_combinators$Combine_ops['<$>'], _Bogdanp$elm_ast$Ast_Expression$Access, _Bogdanp$elm_ast$Ast_Expression$variable),
	_elm_community$parser_combinators$Combine$many1(
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			_elm_community$parser_combinators$Combine$string('.'),
			_Bogdanp$elm_ast$Ast_Helpers$loName)));
var _Bogdanp$elm_ast$Ast_Expression$simplifiedRecord = _elm_community$parser_combinators$Combine$lazy(
	function (_p4) {
		var _p5 = _p4;
		return A2(
			_elm_community$parser_combinators$Combine_ops['<$>'],
			_Bogdanp$elm_ast$Ast_Expression$Record,
			_elm_community$parser_combinators$Combine$braces(
				_Bogdanp$elm_ast$Ast_Helpers$commaSeparated(
					A2(
						_elm_community$parser_combinators$Combine_ops['<$>'],
						function (a) {
							return {
								ctor: '_Tuple2',
								_0: a,
								_1: _Bogdanp$elm_ast$Ast_Expression$Variable(
									{
										ctor: '::',
										_0: a,
										_1: {ctor: '[]'}
									})
							};
						},
						_Bogdanp$elm_ast$Ast_Helpers$loName))));
	});
var _Bogdanp$elm_ast$Ast_Expression$joinL = F2(
	function (es, ops) {
		joinL:
		while (true) {
			var _p6 = {ctor: '_Tuple2', _0: es, _1: ops};
			_v3_2:
			do {
				if ((_p6.ctor === '_Tuple2') && (_p6._0.ctor === '::')) {
					if (_p6._0._1.ctor === '[]') {
						if (_p6._1.ctor === '[]') {
							return _elm_community$parser_combinators$Combine$succeed(_p6._0._0);
						} else {
							break _v3_2;
						}
					} else {
						if (_p6._1.ctor === '::') {
							var _v4 = {
								ctor: '::',
								_0: A3(
									_Bogdanp$elm_ast$Ast_Expression$BinOp,
									_Bogdanp$elm_ast$Ast_Expression$Variable(
										{
											ctor: '::',
											_0: _p6._1._0,
											_1: {ctor: '[]'}
										}),
									_p6._0._0,
									_p6._0._1._0),
								_1: _p6._0._1._1
							},
								_v5 = _p6._1._1;
							es = _v4;
							ops = _v5;
							continue joinL;
						} else {
							break _v3_2;
						}
					}
				} else {
					break _v3_2;
				}
			} while(false);
			return _elm_community$parser_combinators$Combine$fail('');
		}
	});
var _Bogdanp$elm_ast$Ast_Expression$joinR = F2(
	function (es, ops) {
		var _p7 = {ctor: '_Tuple2', _0: es, _1: ops};
		_v6_2:
		do {
			if ((_p7.ctor === '_Tuple2') && (_p7._0.ctor === '::')) {
				if (_p7._0._1.ctor === '[]') {
					if (_p7._1.ctor === '[]') {
						return _elm_community$parser_combinators$Combine$succeed(_p7._0._0);
					} else {
						break _v6_2;
					}
				} else {
					if (_p7._1.ctor === '::') {
						return A2(
							_elm_community$parser_combinators$Combine$andThen,
							function (e) {
								return _elm_community$parser_combinators$Combine$succeed(
									A3(
										_Bogdanp$elm_ast$Ast_Expression$BinOp,
										_Bogdanp$elm_ast$Ast_Expression$Variable(
											{
												ctor: '::',
												_0: _p7._1._0,
												_1: {ctor: '[]'}
											}),
										_p7._0._0,
										e));
							},
							A2(
								_Bogdanp$elm_ast$Ast_Expression$joinR,
								{ctor: '::', _0: _p7._0._1._0, _1: _p7._0._1._1},
								_p7._1._1));
					} else {
						break _v6_2;
					}
				}
			} else {
				break _v6_2;
			}
		} while(false);
		return _elm_community$parser_combinators$Combine$fail('');
	});
var _Bogdanp$elm_ast$Ast_Expression$split = F4(
	function (ops, l, e, eops) {
		var _p8 = eops;
		if (_p8.ctor === '[]') {
			return _elm_community$parser_combinators$Combine$succeed(e);
		} else {
			return A2(
				_elm_community$parser_combinators$Combine$andThen,
				function (assoc) {
					return A2(
						_elm_community$parser_combinators$Combine$andThen,
						function (es) {
							var ops_ = A2(
								_elm_lang$core$List$filterMap,
								function (x) {
									return A3(_Bogdanp$elm_ast$Ast_Expression$hasLevel, ops, l, x) ? _elm_lang$core$Maybe$Just(
										_elm_lang$core$Tuple$first(x)) : _elm_lang$core$Maybe$Nothing;
								},
								eops);
							var _p9 = assoc;
							if (_p9.ctor === 'R') {
								return A2(_Bogdanp$elm_ast$Ast_Expression$joinR, es, ops_);
							} else {
								return A2(_Bogdanp$elm_ast$Ast_Expression$joinL, es, ops_);
							}
						},
						_elm_community$parser_combinators$Combine$sequence(
							A4(_Bogdanp$elm_ast$Ast_Expression$splitLevel, ops, l, e, eops)));
				},
				A3(_Bogdanp$elm_ast$Ast_Expression$findAssoc, ops, l, eops));
		}
	});
var _Bogdanp$elm_ast$Ast_Expression$splitLevel = F4(
	function (ops, l, e, eops) {
		var _p10 = A2(
			_elm_community$list_extra$List_Extra$break,
			A2(_Bogdanp$elm_ast$Ast_Expression$hasLevel, ops, l),
			eops);
		if (_p10._1.ctor === '::') {
			return {
				ctor: '::',
				_0: A4(_Bogdanp$elm_ast$Ast_Expression$split, ops, l + 1, e, _p10._0),
				_1: A4(_Bogdanp$elm_ast$Ast_Expression$splitLevel, ops, l, _p10._1._0._1, _p10._1._1)
			};
		} else {
			return {
				ctor: '::',
				_0: A4(_Bogdanp$elm_ast$Ast_Expression$split, ops, l + 1, e, _p10._0),
				_1: {ctor: '[]'}
			};
		}
	});
var _Bogdanp$elm_ast$Ast_Expression$Float = function (a) {
	return {ctor: 'Float', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$float = A2(_elm_community$parser_combinators$Combine_ops['<$>'], _Bogdanp$elm_ast$Ast_Expression$Float, _elm_community$parser_combinators$Combine_Num$float);
var _Bogdanp$elm_ast$Ast_Expression$Integer = function (a) {
	return {ctor: 'Integer', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$integer = A2(_elm_community$parser_combinators$Combine_ops['<$>'], _Bogdanp$elm_ast$Ast_Expression$Integer, _elm_community$parser_combinators$Combine_Num$int);
var _Bogdanp$elm_ast$Ast_Expression$String = function (a) {
	return {ctor: 'String', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$string = function () {
	var multiString = A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		function (_p11) {
			return _Bogdanp$elm_ast$Ast_Expression$String(
				_elm_lang$core$String$concat(_p11));
		},
		A2(
			_elm_community$parser_combinators$Combine_ops['<*'],
			A2(
				_elm_community$parser_combinators$Combine_ops['*>'],
				_elm_community$parser_combinators$Combine$string('\"\"\"'),
				_elm_community$parser_combinators$Combine$many(
					_elm_community$parser_combinators$Combine$regex('[^\"]*'))),
			_elm_community$parser_combinators$Combine$string('\"\"\"')));
	var singleString = A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		_Bogdanp$elm_ast$Ast_Expression$String,
		A2(
			_elm_community$parser_combinators$Combine_ops['<*'],
			A2(
				_elm_community$parser_combinators$Combine_ops['*>'],
				_elm_community$parser_combinators$Combine$string('\"'),
				_elm_community$parser_combinators$Combine$regex('(\\\\\\\\|\\\\\"|[^\"\n])*')),
			_elm_community$parser_combinators$Combine$string('\"')));
	return A2(_elm_community$parser_combinators$Combine_ops['<|>'], multiString, singleString);
}();
var _Bogdanp$elm_ast$Ast_Expression$Character = function (a) {
	return {ctor: 'Character', _0: a};
};
var _Bogdanp$elm_ast$Ast_Expression$character = A2(
	_elm_community$parser_combinators$Combine_ops['<$>'],
	_Bogdanp$elm_ast$Ast_Expression$Character,
	A2(
		_Bogdanp$elm_ast$Ast_Helpers$between_,
		_elm_community$parser_combinators$Combine$string('\''),
		A2(
			_elm_community$parser_combinators$Combine_ops['<|>'],
			A2(
				_elm_community$parser_combinators$Combine_ops['>>='],
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					_elm_community$parser_combinators$Combine$string('\\'),
					_elm_community$parser_combinators$Combine$regex('(n|t|r|\\\\|x..)')),
				function (a) {
					var _p12 = _elm_lang$core$String$uncons(a);
					_v10_6:
					do {
						if (_p12.ctor === 'Just') {
							if (_p12._0.ctor === '_Tuple2') {
								switch (_p12._0._0.valueOf()) {
									case 'n':
										if (_p12._0._1 === '') {
											return _elm_community$parser_combinators$Combine$succeed(
												_elm_lang$core$Native_Utils.chr('\n'));
										} else {
											break _v10_6;
										}
									case 't':
										if (_p12._0._1 === '') {
											return _elm_community$parser_combinators$Combine$succeed(
												_elm_lang$core$Native_Utils.chr('\t'));
										} else {
											break _v10_6;
										}
									case 'r':
										if (_p12._0._1 === '') {
											return _elm_community$parser_combinators$Combine$succeed(
												_elm_lang$core$Native_Utils.chr('\r'));
										} else {
											break _v10_6;
										}
									case '\\':
										if (_p12._0._1 === '') {
											return _elm_community$parser_combinators$Combine$succeed(
												_elm_lang$core$Native_Utils.chr('\\'));
										} else {
											break _v10_6;
										}
									case '0':
										if (_p12._0._1 === '') {
											return _elm_community$parser_combinators$Combine$succeed(
												_elm_lang$core$Native_Utils.chr(' '));
										} else {
											break _v10_6;
										}
									case 'x':
										return A2(
											_elm_lang$core$Result$withDefault,
											_elm_community$parser_combinators$Combine$fail('Invalid charcode'),
											A2(
												_elm_lang$core$Result$map,
												_elm_community$parser_combinators$Combine$succeed,
												A2(
													_elm_lang$core$Result$map,
													_elm_lang$core$Char$fromCode,
													_rtfeldman$hex$Hex$fromString(
														_elm_lang$core$String$toLower(_p12._0._1)))));
									default:
										break _v10_6;
								}
							} else {
								break _v10_6;
							}
						} else {
							return _elm_community$parser_combinators$Combine$fail('No character');
						}
					} while(false);
					return _elm_community$parser_combinators$Combine$fail(
						A2(
							_elm_lang$core$Basics_ops['++'],
							'No such character as \\',
							_elm_lang$core$Basics$toString(_p12._0)));
				}),
			_elm_community$parser_combinators$Combine_Char$anyChar)));
var _Bogdanp$elm_ast$Ast_Expression$term = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p13) {
			var _p14 = _p13;
			return _elm_community$parser_combinators$Combine$choice(
				{
					ctor: '::',
					_0: _Bogdanp$elm_ast$Ast_Expression$character,
					_1: {
						ctor: '::',
						_0: _Bogdanp$elm_ast$Ast_Expression$string,
						_1: {
							ctor: '::',
							_0: _Bogdanp$elm_ast$Ast_Expression$float,
							_1: {
								ctor: '::',
								_0: _Bogdanp$elm_ast$Ast_Expression$integer,
								_1: {
									ctor: '::',
									_0: _Bogdanp$elm_ast$Ast_Expression$access,
									_1: {
										ctor: '::',
										_0: _Bogdanp$elm_ast$Ast_Expression$accessFunction,
										_1: {
											ctor: '::',
											_0: _Bogdanp$elm_ast$Ast_Expression$variable,
											_1: {
												ctor: '::',
												_0: _Bogdanp$elm_ast$Ast_Expression$list(ops),
												_1: {
													ctor: '::',
													_0: _Bogdanp$elm_ast$Ast_Expression$tuple(ops),
													_1: {
														ctor: '::',
														_0: _Bogdanp$elm_ast$Ast_Expression$recordUpdate(ops),
														_1: {
															ctor: '::',
															_0: _Bogdanp$elm_ast$Ast_Expression$record(ops),
															_1: {
																ctor: '::',
																_0: _Bogdanp$elm_ast$Ast_Expression$simplifiedRecord,
																_1: {
																	ctor: '::',
																	_0: _elm_community$parser_combinators$Combine$parens(
																		A2(
																			_Bogdanp$elm_ast$Ast_Helpers$between_,
																			_elm_community$parser_combinators$Combine$whitespace,
																			_Bogdanp$elm_ast$Ast_Expression$expression(ops))),
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				});
		});
};
var _Bogdanp$elm_ast$Ast_Expression$expression = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p15) {
			var _p16 = _p15;
			return _elm_community$parser_combinators$Combine$choice(
				{
					ctor: '::',
					_0: _Bogdanp$elm_ast$Ast_Expression$letExpression(ops),
					_1: {
						ctor: '::',
						_0: _Bogdanp$elm_ast$Ast_Expression$caseExpression(ops),
						_1: {
							ctor: '::',
							_0: _Bogdanp$elm_ast$Ast_Expression$ifExpression(ops),
							_1: {
								ctor: '::',
								_0: _Bogdanp$elm_ast$Ast_Expression$lambda(ops),
								_1: {
									ctor: '::',
									_0: _Bogdanp$elm_ast$Ast_Expression$binary(ops),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				});
		});
};
var _Bogdanp$elm_ast$Ast_Expression$binary = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p17) {
			var _p18 = _p17;
			var next = A2(
				_elm_community$parser_combinators$Combine$andThen,
				function (op) {
					return A2(
						_elm_community$parser_combinators$Combine$andThen,
						function (e) {
							var _p19 = e;
							if (_p19.ctor === 'Cont') {
								return A2(
									_elm_community$parser_combinators$Combine_ops['<$>'],
									F2(
										function (x, y) {
											return {ctor: '::', _0: x, _1: y};
										})(
										{ctor: '_Tuple2', _0: op, _1: _p19._0}),
									collect);
							} else {
								return _elm_community$parser_combinators$Combine$succeed(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: op, _1: _p19._0},
										_1: {ctor: '[]'}
									});
							}
						},
						_elm_community$parser_combinators$Combine$choice(
							{
								ctor: '::',
								_0: A2(
									_elm_community$parser_combinators$Combine_ops['<$>'],
									_Bogdanp$elm_ast$Ast_Expression$Cont,
									_Bogdanp$elm_ast$Ast_Expression$application(ops)),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_community$parser_combinators$Combine_ops['<$>'],
										_Bogdanp$elm_ast$Ast_Expression$Stop,
										_Bogdanp$elm_ast$Ast_Expression$expression(ops)),
									_1: {ctor: '[]'}
								}
							}));
				},
				A2(
					_Bogdanp$elm_ast$Ast_Helpers$between_,
					_elm_community$parser_combinators$Combine$whitespace,
					_elm_community$parser_combinators$Combine$choice(
						{
							ctor: '::',
							_0: _Bogdanp$elm_ast$Ast_Helpers$operator,
							_1: {
								ctor: '::',
								_0: _Bogdanp$elm_ast$Ast_Helpers$symbol_('as'),
								_1: {ctor: '[]'}
							}
						})));
			var collect = A2(
				_elm_community$parser_combinators$Combine_ops['<|>'],
				next,
				_elm_community$parser_combinators$Combine$succeed(
					{ctor: '[]'}));
			return A2(
				_elm_community$parser_combinators$Combine$andThen,
				function (e) {
					return A2(
						_elm_community$parser_combinators$Combine$andThen,
						function (eops) {
							return A4(_Bogdanp$elm_ast$Ast_Expression$split, ops, 0, e, eops);
						},
						collect);
				},
				_Bogdanp$elm_ast$Ast_Expression$application(ops));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$application = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p20) {
			var _p21 = _p20;
			return A2(
				_elm_community$parser_combinators$Combine$chainl,
				A2(
					_elm_community$parser_combinators$Combine_ops['<$'],
					_Bogdanp$elm_ast$Ast_Expression$Application,
					_Bogdanp$elm_ast$Ast_Expression$spacesOrIndentedNewline(ops)),
				_Bogdanp$elm_ast$Ast_Expression$term(ops));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$spacesOrIndentedNewline = function (ops) {
	var startsBinding = A2(
		_elm_community$parser_combinators$Combine$or,
		_Bogdanp$elm_ast$Ast_Expression$letBinding(ops),
		_Bogdanp$elm_ast$Ast_Expression$caseBinding(ops));
	var failAtBinding = A2(
		_elm_community$parser_combinators$Combine$andThen,
		function (x) {
			var _p22 = x;
			if (_p22.ctor === 'Just') {
				return _elm_community$parser_combinators$Combine$fail('next line starts a new case or let binding');
			} else {
				return _elm_community$parser_combinators$Combine$succeed('');
			}
		},
		_elm_community$parser_combinators$Combine$maybe(startsBinding));
	return A2(
		_elm_community$parser_combinators$Combine$or,
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			A2(
				_elm_community$parser_combinators$Combine_ops['*>'],
				A2(_elm_community$parser_combinators$Combine_ops['*>'], _Bogdanp$elm_ast$Ast_Helpers$spaces, _elm_community$parser_combinators$Combine_Char$newline),
				_Bogdanp$elm_ast$Ast_Helpers$spaces_),
			_elm_community$parser_combinators$Combine$lookAhead(failAtBinding)),
		_Bogdanp$elm_ast$Ast_Helpers$spaces_);
};
var _Bogdanp$elm_ast$Ast_Expression$caseBinding = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p23) {
			var _p24 = _p23;
			return A2(
				_elm_community$parser_combinators$Combine_ops['<*>'],
				A2(
					_elm_community$parser_combinators$Combine_ops['<$>'],
					F2(
						function (v0, v1) {
							return {ctor: '_Tuple2', _0: v0, _1: v1};
						}),
					A2(
						_elm_community$parser_combinators$Combine_ops['*>'],
						_elm_community$parser_combinators$Combine$whitespace,
						_Bogdanp$elm_ast$Ast_Expression$expression(ops))),
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					_Bogdanp$elm_ast$Ast_Helpers$symbol('->'),
					_Bogdanp$elm_ast$Ast_Expression$expression(ops)));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$letBinding = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p25) {
			var _p26 = _p25;
			return A2(
				_elm_community$parser_combinators$Combine_ops['<*>'],
				A2(
					_elm_community$parser_combinators$Combine_ops['<$>'],
					F2(
						function (v0, v1) {
							return {ctor: '_Tuple2', _0: v0, _1: v1};
						}),
					A2(
						_Bogdanp$elm_ast$Ast_Helpers$between_,
						_elm_community$parser_combinators$Combine$whitespace,
						_Bogdanp$elm_ast$Ast_Expression$expression(ops))),
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					_Bogdanp$elm_ast$Ast_Helpers$symbol('='),
					_Bogdanp$elm_ast$Ast_Expression$expression(ops)));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$caseExpression = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p27) {
			var _p28 = _p27;
			return A2(
				_elm_community$parser_combinators$Combine_ops['<*>'],
				A2(
					_elm_community$parser_combinators$Combine_ops['<$>'],
					_Bogdanp$elm_ast$Ast_Expression$Case,
					A2(
						_elm_community$parser_combinators$Combine_ops['*>'],
						_Bogdanp$elm_ast$Ast_Helpers$symbol('case'),
						_Bogdanp$elm_ast$Ast_Expression$expression(ops))),
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					_Bogdanp$elm_ast$Ast_Helpers$symbol('of'),
					_elm_community$parser_combinators$Combine$many1(
						_Bogdanp$elm_ast$Ast_Expression$caseBinding(ops))));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$ifExpression = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p29) {
			var _p30 = _p29;
			return A2(
				_elm_community$parser_combinators$Combine_ops['<*>'],
				A2(
					_elm_community$parser_combinators$Combine_ops['<*>'],
					A2(
						_elm_community$parser_combinators$Combine_ops['<$>'],
						_Bogdanp$elm_ast$Ast_Expression$If,
						A2(
							_elm_community$parser_combinators$Combine_ops['*>'],
							_Bogdanp$elm_ast$Ast_Helpers$symbol('if'),
							_Bogdanp$elm_ast$Ast_Expression$expression(ops))),
					A2(
						_elm_community$parser_combinators$Combine_ops['*>'],
						_Bogdanp$elm_ast$Ast_Helpers$symbol('then'),
						_Bogdanp$elm_ast$Ast_Expression$expression(ops))),
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					_Bogdanp$elm_ast$Ast_Helpers$symbol('else'),
					_Bogdanp$elm_ast$Ast_Expression$expression(ops)));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$lambda = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p31) {
			var _p32 = _p31;
			return A2(
				_elm_community$parser_combinators$Combine_ops['<*>'],
				A2(
					_elm_community$parser_combinators$Combine_ops['<$>'],
					_Bogdanp$elm_ast$Ast_Expression$Lambda,
					A2(
						_elm_community$parser_combinators$Combine_ops['*>'],
						_Bogdanp$elm_ast$Ast_Helpers$symbol('\\'),
						_elm_community$parser_combinators$Combine$many(
							A2(
								_Bogdanp$elm_ast$Ast_Helpers$between_,
								_Bogdanp$elm_ast$Ast_Helpers$spaces,
								_Bogdanp$elm_ast$Ast_Expression$term(ops))))),
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					_Bogdanp$elm_ast$Ast_Helpers$symbol('->'),
					_Bogdanp$elm_ast$Ast_Expression$expression(ops)));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$letExpression = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p33) {
			var _p34 = _p33;
			return A2(
				_elm_community$parser_combinators$Combine_ops['<*>'],
				A2(
					_elm_community$parser_combinators$Combine_ops['<$>'],
					_Bogdanp$elm_ast$Ast_Expression$Let,
					A2(
						_elm_community$parser_combinators$Combine_ops['*>'],
						_Bogdanp$elm_ast$Ast_Helpers$symbol_('let'),
						_elm_community$parser_combinators$Combine$many1(
							_Bogdanp$elm_ast$Ast_Expression$letBinding(ops)))),
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					_Bogdanp$elm_ast$Ast_Helpers$symbol('in'),
					_Bogdanp$elm_ast$Ast_Expression$expression(ops)));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$list = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p35) {
			var _p36 = _p35;
			return A2(
				_elm_community$parser_combinators$Combine_ops['<$>'],
				_Bogdanp$elm_ast$Ast_Expression$List,
				_elm_community$parser_combinators$Combine$brackets(
					_Bogdanp$elm_ast$Ast_Helpers$commaSeparated_(
						_Bogdanp$elm_ast$Ast_Expression$expression(ops))));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$record = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p37) {
			var _p38 = _p37;
			return A2(
				_elm_community$parser_combinators$Combine_ops['<$>'],
				_Bogdanp$elm_ast$Ast_Expression$Record,
				_elm_community$parser_combinators$Combine$braces(
					_Bogdanp$elm_ast$Ast_Helpers$commaSeparated(
						A2(
							_elm_community$parser_combinators$Combine_ops['<*>'],
							A2(
								_elm_community$parser_combinators$Combine_ops['<$>'],
								F2(
									function (v0, v1) {
										return {ctor: '_Tuple2', _0: v0, _1: v1};
									}),
								_Bogdanp$elm_ast$Ast_Helpers$loName),
							A2(
								_elm_community$parser_combinators$Combine_ops['*>'],
								_Bogdanp$elm_ast$Ast_Helpers$symbol('='),
								_Bogdanp$elm_ast$Ast_Expression$expression(ops))))));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$recordUpdate = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p39) {
			var _p40 = _p39;
			return A2(
				_elm_community$parser_combinators$Combine_ops['<*>'],
				A2(
					_elm_community$parser_combinators$Combine_ops['<$>'],
					_Bogdanp$elm_ast$Ast_Expression$RecordUpdate,
					A2(
						_elm_community$parser_combinators$Combine_ops['*>'],
						_Bogdanp$elm_ast$Ast_Helpers$symbol('{'),
						_Bogdanp$elm_ast$Ast_Helpers$loName)),
				A2(
					_elm_community$parser_combinators$Combine_ops['<*'],
					A2(
						_elm_community$parser_combinators$Combine_ops['*>'],
						_Bogdanp$elm_ast$Ast_Helpers$symbol('|'),
						_Bogdanp$elm_ast$Ast_Helpers$commaSeparated(
							A2(
								_elm_community$parser_combinators$Combine_ops['<*>'],
								A2(
									_elm_community$parser_combinators$Combine_ops['<$>'],
									F2(
										function (v0, v1) {
											return {ctor: '_Tuple2', _0: v0, _1: v1};
										}),
									_Bogdanp$elm_ast$Ast_Helpers$loName),
								A2(
									_elm_community$parser_combinators$Combine_ops['*>'],
									_Bogdanp$elm_ast$Ast_Helpers$symbol('='),
									_Bogdanp$elm_ast$Ast_Expression$expression(ops))))),
					_Bogdanp$elm_ast$Ast_Helpers$symbol('}')));
		});
};
var _Bogdanp$elm_ast$Ast_Expression$tuple = function (ops) {
	return _elm_community$parser_combinators$Combine$lazy(
		function (_p41) {
			var _p42 = _p41;
			return A2(
				_elm_community$parser_combinators$Combine_ops['<$>'],
				_Bogdanp$elm_ast$Ast_Expression$Tuple,
				A2(
					_elm_community$parser_combinators$Combine_ops['>>='],
					_elm_community$parser_combinators$Combine$parens(
						_Bogdanp$elm_ast$Ast_Helpers$commaSeparated_(
							_Bogdanp$elm_ast$Ast_Expression$expression(ops))),
					function (a) {
						var _p43 = a;
						if ((_p43.ctor === '::') && (_p43._1.ctor === '[]')) {
							return _elm_community$parser_combinators$Combine$fail('No single tuples');
						} else {
							return _elm_community$parser_combinators$Combine$succeed(_p43);
						}
					}));
		});
};

var _Bogdanp$elm_ast$Ast_Statement$TypeExport = F2(
	function (a, b) {
		return {ctor: 'TypeExport', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Statement$FunctionExport = function (a) {
	return {ctor: 'FunctionExport', _0: a};
};
var _Bogdanp$elm_ast$Ast_Statement$functionExport = A2(
	_elm_community$parser_combinators$Combine_ops['<$>'],
	_Bogdanp$elm_ast$Ast_Statement$FunctionExport,
	_elm_community$parser_combinators$Combine$choice(
		{
			ctor: '::',
			_0: _Bogdanp$elm_ast$Ast_Helpers$functionName,
			_1: {
				ctor: '::',
				_0: _elm_community$parser_combinators$Combine$parens(_Bogdanp$elm_ast$Ast_Helpers$operator),
				_1: {ctor: '[]'}
			}
		}));
var _Bogdanp$elm_ast$Ast_Statement$SubsetExport = function (a) {
	return {ctor: 'SubsetExport', _0: a};
};
var _Bogdanp$elm_ast$Ast_Statement$constructorSubsetExports = A2(
	_elm_community$parser_combinators$Combine_ops['<$>'],
	_Bogdanp$elm_ast$Ast_Statement$SubsetExport,
	_Bogdanp$elm_ast$Ast_Helpers$commaSeparated(
		A2(_elm_community$parser_combinators$Combine_ops['<$>'], _Bogdanp$elm_ast$Ast_Statement$FunctionExport, _Bogdanp$elm_ast$Ast_Helpers$upName)));
var _Bogdanp$elm_ast$Ast_Statement$AllExport = {ctor: 'AllExport'};
var _Bogdanp$elm_ast$Ast_Statement$allExport = A2(
	_elm_community$parser_combinators$Combine_ops['<$'],
	_Bogdanp$elm_ast$Ast_Statement$AllExport,
	_Bogdanp$elm_ast$Ast_Helpers$symbol('..'));
var _Bogdanp$elm_ast$Ast_Statement$constructorExports = _elm_community$parser_combinators$Combine$maybe(
	_elm_community$parser_combinators$Combine$parens(
		_elm_community$parser_combinators$Combine$choice(
			{
				ctor: '::',
				_0: _Bogdanp$elm_ast$Ast_Statement$allExport,
				_1: {
					ctor: '::',
					_0: _Bogdanp$elm_ast$Ast_Statement$constructorSubsetExports,
					_1: {ctor: '[]'}
				}
			})));
var _Bogdanp$elm_ast$Ast_Statement$typeExport = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		_Bogdanp$elm_ast$Ast_Statement$TypeExport,
		A2(_elm_community$parser_combinators$Combine_ops['<*'], _Bogdanp$elm_ast$Ast_Helpers$upName, _Bogdanp$elm_ast$Ast_Helpers$spaces)),
	_Bogdanp$elm_ast$Ast_Statement$constructorExports);
var _Bogdanp$elm_ast$Ast_Statement$subsetExport = A2(
	_elm_community$parser_combinators$Combine_ops['<$>'],
	_Bogdanp$elm_ast$Ast_Statement$SubsetExport,
	_Bogdanp$elm_ast$Ast_Helpers$commaSeparated(
		A2(_elm_community$parser_combinators$Combine$or, _Bogdanp$elm_ast$Ast_Statement$typeExport, _Bogdanp$elm_ast$Ast_Statement$functionExport)));
var _Bogdanp$elm_ast$Ast_Statement$exports = _elm_community$parser_combinators$Combine$parens(
	_elm_community$parser_combinators$Combine$choice(
		{
			ctor: '::',
			_0: _Bogdanp$elm_ast$Ast_Statement$allExport,
			_1: {
				ctor: '::',
				_0: _Bogdanp$elm_ast$Ast_Statement$subsetExport,
				_1: {ctor: '[]'}
			}
		}));
var _Bogdanp$elm_ast$Ast_Statement$TypeApplication = F2(
	function (a, b) {
		return {ctor: 'TypeApplication', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Statement$typeApplication = A2(
	_elm_community$parser_combinators$Combine_ops['<$'],
	_Bogdanp$elm_ast$Ast_Statement$TypeApplication,
	_Bogdanp$elm_ast$Ast_Helpers$symbol('->'));
var _Bogdanp$elm_ast$Ast_Statement$TypeTuple = function (a) {
	return {ctor: 'TypeTuple', _0: a};
};
var _Bogdanp$elm_ast$Ast_Statement$TypeRecord = function (a) {
	return {ctor: 'TypeRecord', _0: a};
};
var _Bogdanp$elm_ast$Ast_Statement$TypeRecordConstructor = F2(
	function (a, b) {
		return {ctor: 'TypeRecordConstructor', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Statement$TypeVariable = function (a) {
	return {ctor: 'TypeVariable', _0: a};
};
var _Bogdanp$elm_ast$Ast_Statement$typeVariable = A2(
	_elm_community$parser_combinators$Combine_ops['<$>'],
	_Bogdanp$elm_ast$Ast_Statement$TypeVariable,
	_elm_community$parser_combinators$Combine$regex('[a-z]+(\\w|_)*'));
var _Bogdanp$elm_ast$Ast_Statement$TypeConstructor = F2(
	function (a, b) {
		return {ctor: 'TypeConstructor', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Statement$typeConstant = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		_Bogdanp$elm_ast$Ast_Statement$TypeConstructor,
		A2(
			_elm_community$parser_combinators$Combine$sepBy1,
			_elm_community$parser_combinators$Combine$string('.'),
			_Bogdanp$elm_ast$Ast_Helpers$upName)),
	_elm_community$parser_combinators$Combine$succeed(
		{ctor: '[]'}));
var _Bogdanp$elm_ast$Ast_Statement$typeConstructor = _elm_community$parser_combinators$Combine$lazy(
	function (_p0) {
		var _p1 = _p0;
		return A2(
			_elm_community$parser_combinators$Combine_ops['<*>'],
			A2(
				_elm_community$parser_combinators$Combine_ops['<$>'],
				_Bogdanp$elm_ast$Ast_Statement$TypeConstructor,
				A2(
					_elm_community$parser_combinators$Combine$sepBy1,
					_elm_community$parser_combinators$Combine$string('.'),
					_Bogdanp$elm_ast$Ast_Helpers$upName)),
			_elm_community$parser_combinators$Combine$many(_Bogdanp$elm_ast$Ast_Statement$typeParameter));
	});
var _Bogdanp$elm_ast$Ast_Statement$typeParameter = _elm_community$parser_combinators$Combine$lazy(
	function (_p2) {
		var _p3 = _p2;
		return A2(
			_Bogdanp$elm_ast$Ast_Helpers$between_,
			A2(
				_elm_community$parser_combinators$Combine$or,
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					A2(_elm_community$parser_combinators$Combine_ops['*>'], _Bogdanp$elm_ast$Ast_Helpers$spaces, _elm_community$parser_combinators$Combine_Char$newline),
					_Bogdanp$elm_ast$Ast_Helpers$spaces_),
				_Bogdanp$elm_ast$Ast_Helpers$spaces),
			_elm_community$parser_combinators$Combine$choice(
				{
					ctor: '::',
					_0: _Bogdanp$elm_ast$Ast_Statement$typeVariable,
					_1: {
						ctor: '::',
						_0: _Bogdanp$elm_ast$Ast_Statement$typeConstant,
						_1: {
							ctor: '::',
							_0: _Bogdanp$elm_ast$Ast_Statement$typeRecordConstructor,
							_1: {
								ctor: '::',
								_0: _Bogdanp$elm_ast$Ast_Statement$typeRecord,
								_1: {
									ctor: '::',
									_0: _Bogdanp$elm_ast$Ast_Statement$typeTuple,
									_1: {
										ctor: '::',
										_0: _elm_community$parser_combinators$Combine$parens(_Bogdanp$elm_ast$Ast_Statement$typeAnnotation),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}));
	});
var _Bogdanp$elm_ast$Ast_Statement$typeAnnotation = _elm_community$parser_combinators$Combine$lazy(
	function (_p4) {
		var _p5 = _p4;
		return A2(_elm_community$parser_combinators$Combine$chainr, _Bogdanp$elm_ast$Ast_Statement$typeApplication, _Bogdanp$elm_ast$Ast_Statement$type_);
	});
var _Bogdanp$elm_ast$Ast_Statement$type_ = _elm_community$parser_combinators$Combine$lazy(
	function (_p6) {
		var _p7 = _p6;
		return A2(
			_Bogdanp$elm_ast$Ast_Helpers$between_,
			_Bogdanp$elm_ast$Ast_Helpers$spaces,
			_elm_community$parser_combinators$Combine$choice(
				{
					ctor: '::',
					_0: _Bogdanp$elm_ast$Ast_Statement$typeConstructor,
					_1: {
						ctor: '::',
						_0: _Bogdanp$elm_ast$Ast_Statement$typeVariable,
						_1: {
							ctor: '::',
							_0: _Bogdanp$elm_ast$Ast_Statement$typeRecordConstructor,
							_1: {
								ctor: '::',
								_0: _Bogdanp$elm_ast$Ast_Statement$typeRecord,
								_1: {
									ctor: '::',
									_0: _Bogdanp$elm_ast$Ast_Statement$typeTuple,
									_1: {
										ctor: '::',
										_0: _elm_community$parser_combinators$Combine$parens(_Bogdanp$elm_ast$Ast_Statement$typeAnnotation),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}));
	});
var _Bogdanp$elm_ast$Ast_Statement$typeRecord = _elm_community$parser_combinators$Combine$lazy(
	function (_p8) {
		var _p9 = _p8;
		return _elm_community$parser_combinators$Combine$braces(
			A2(_elm_community$parser_combinators$Combine_ops['<$>'], _Bogdanp$elm_ast$Ast_Statement$TypeRecord, _Bogdanp$elm_ast$Ast_Statement$typeRecordPairs));
	});
var _Bogdanp$elm_ast$Ast_Statement$typeRecordPairs = _elm_community$parser_combinators$Combine$lazy(
	function (_p10) {
		var _p11 = _p10;
		return _Bogdanp$elm_ast$Ast_Helpers$commaSeparated_(_Bogdanp$elm_ast$Ast_Statement$typeRecordPair);
	});
var _Bogdanp$elm_ast$Ast_Statement$typeRecordPair = _elm_community$parser_combinators$Combine$lazy(
	function (_p12) {
		var _p13 = _p12;
		return A2(
			_elm_community$parser_combinators$Combine_ops['<*>'],
			A2(
				_elm_community$parser_combinators$Combine_ops['<$>'],
				F2(
					function (v0, v1) {
						return {ctor: '_Tuple2', _0: v0, _1: v1};
					}),
				A2(
					_elm_community$parser_combinators$Combine_ops['<*'],
					_Bogdanp$elm_ast$Ast_Helpers$loName,
					_Bogdanp$elm_ast$Ast_Helpers$symbol(':'))),
			_Bogdanp$elm_ast$Ast_Statement$typeAnnotation);
	});
var _Bogdanp$elm_ast$Ast_Statement$typeRecordConstructor = _elm_community$parser_combinators$Combine$lazy(
	function (_p14) {
		var _p15 = _p14;
		return _elm_community$parser_combinators$Combine$braces(
			A2(
				_elm_community$parser_combinators$Combine_ops['<*>'],
				A2(
					_elm_community$parser_combinators$Combine_ops['<$>'],
					_Bogdanp$elm_ast$Ast_Statement$TypeRecordConstructor,
					A2(_Bogdanp$elm_ast$Ast_Helpers$between_, _Bogdanp$elm_ast$Ast_Helpers$spaces, _Bogdanp$elm_ast$Ast_Statement$typeVariable)),
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					_Bogdanp$elm_ast$Ast_Helpers$symbol('|'),
					_Bogdanp$elm_ast$Ast_Statement$typeRecordPairs)));
	});
var _Bogdanp$elm_ast$Ast_Statement$typeTuple = _elm_community$parser_combinators$Combine$lazy(
	function (_p16) {
		var _p17 = _p16;
		return A2(
			_elm_community$parser_combinators$Combine_ops['<$>'],
			_Bogdanp$elm_ast$Ast_Statement$TypeTuple,
			_elm_community$parser_combinators$Combine$parens(
				_Bogdanp$elm_ast$Ast_Helpers$commaSeparated_(_Bogdanp$elm_ast$Ast_Statement$type_)));
	});
var _Bogdanp$elm_ast$Ast_Statement$Comment = function (a) {
	return {ctor: 'Comment', _0: a};
};
var _Bogdanp$elm_ast$Ast_Statement$singleLineComment = A2(
	_elm_community$parser_combinators$Combine_ops['<$>'],
	_Bogdanp$elm_ast$Ast_Statement$Comment,
	A2(
		_elm_community$parser_combinators$Combine_ops['<*'],
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			_elm_community$parser_combinators$Combine$string('--'),
			_elm_community$parser_combinators$Combine$regex('.*')),
		_elm_community$parser_combinators$Combine$whitespace));
var _Bogdanp$elm_ast$Ast_Statement$multiLineComment = A2(
	_elm_community$parser_combinators$Combine_ops['<$>'],
	function (_p18) {
		return _Bogdanp$elm_ast$Ast_Statement$Comment(
			_elm_lang$core$String$fromList(_p18));
	},
	A2(
		_elm_community$parser_combinators$Combine_ops['*>'],
		_elm_community$parser_combinators$Combine$string('{-'),
		A2(
			_elm_community$parser_combinators$Combine$manyTill,
			_elm_community$parser_combinators$Combine_Char$anyChar,
			_elm_community$parser_combinators$Combine$string('-}'))));
var _Bogdanp$elm_ast$Ast_Statement$comment = A2(_elm_community$parser_combinators$Combine_ops['<|>'], _Bogdanp$elm_ast$Ast_Statement$singleLineComment, _Bogdanp$elm_ast$Ast_Statement$multiLineComment);
var _Bogdanp$elm_ast$Ast_Statement$InfixDeclaration = F3(
	function (a, b, c) {
		return {ctor: 'InfixDeclaration', _0: a, _1: b, _2: c};
	});
var _Bogdanp$elm_ast$Ast_Statement$infixDeclaration = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<*>'],
		A2(
			_elm_community$parser_combinators$Combine_ops['<$>'],
			_Bogdanp$elm_ast$Ast_Statement$InfixDeclaration,
			_elm_community$parser_combinators$Combine$choice(
				{
					ctor: '::',
					_0: A2(
						_elm_community$parser_combinators$Combine_ops['<$'],
						_Bogdanp$elm_ast$Ast_BinOp$L,
						_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('infixl')),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_community$parser_combinators$Combine_ops['<$'],
							_Bogdanp$elm_ast$Ast_BinOp$R,
							_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('infixr')),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_community$parser_combinators$Combine_ops['<$'],
								_Bogdanp$elm_ast$Ast_BinOp$N,
								_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('infix')),
							_1: {ctor: '[]'}
						}
					}
				})),
		A2(_elm_community$parser_combinators$Combine_ops['*>'], _Bogdanp$elm_ast$Ast_Helpers$spaces, _elm_community$parser_combinators$Combine_Num$int)),
	A2(
		_elm_community$parser_combinators$Combine_ops['*>'],
		_Bogdanp$elm_ast$Ast_Helpers$spaces,
		A2(_elm_community$parser_combinators$Combine_ops['<|>'], _Bogdanp$elm_ast$Ast_Helpers$loName, _Bogdanp$elm_ast$Ast_Helpers$operator)));
var _Bogdanp$elm_ast$Ast_Statement$infixStatements = function () {
	var statements = A2(
		_elm_community$parser_combinators$Combine_ops['<*'],
		_elm_community$parser_combinators$Combine$many(
			A2(
				_elm_community$parser_combinators$Combine_ops['<*'],
				_elm_community$parser_combinators$Combine$choice(
					{
						ctor: '::',
						_0: A2(_elm_community$parser_combinators$Combine_ops['<$>'], _elm_lang$core$Maybe$Just, _Bogdanp$elm_ast$Ast_Statement$infixDeclaration),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_community$parser_combinators$Combine_ops['<$'],
								_elm_lang$core$Maybe$Nothing,
								_elm_community$parser_combinators$Combine$regex('.*')),
							_1: {ctor: '[]'}
						}
					}),
				_elm_community$parser_combinators$Combine$whitespace)),
		_elm_community$parser_combinators$Combine$end);
	return A2(
		_elm_community$parser_combinators$Combine$andThen,
		function (xs) {
			return _elm_community$parser_combinators$Combine$succeed(
				A2(_elm_lang$core$List$filterMap, _elm_lang$core$Basics$identity, xs));
		},
		statements);
}();
var _Bogdanp$elm_ast$Ast_Statement$opTable = function (ops) {
	var collect = F2(
		function (s, d) {
			var _p19 = s;
			if (_p19.ctor === 'InfixDeclaration') {
				return A3(
					_elm_lang$core$Dict$insert,
					_p19._2,
					{ctor: '_Tuple2', _0: _p19._0, _1: _p19._1},
					d);
			} else {
				return _elm_lang$core$Native_Utils.crashCase(
					'Ast.Statement',
					{
						start: {line: 414, column: 13},
						end: {line: 419, column: 45}
					},
					_p19)('impossible');
			}
		});
	return A2(
		_elm_community$parser_combinators$Combine$andThen,
		function (xs) {
			return _elm_community$parser_combinators$Combine$succeed(
				A3(_elm_lang$core$List$foldr, collect, ops, xs));
		},
		_Bogdanp$elm_ast$Ast_Statement$infixStatements);
};
var _Bogdanp$elm_ast$Ast_Statement$FunctionDeclaration = F3(
	function (a, b, c) {
		return {ctor: 'FunctionDeclaration', _0: a, _1: b, _2: c};
	});
var _Bogdanp$elm_ast$Ast_Statement$functionDeclaration = function (ops) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<*>'],
		A2(
			_elm_community$parser_combinators$Combine_ops['<*>'],
			A2(
				_elm_community$parser_combinators$Combine_ops['<$>'],
				_Bogdanp$elm_ast$Ast_Statement$FunctionDeclaration,
				_elm_community$parser_combinators$Combine$choice(
					{
						ctor: '::',
						_0: _Bogdanp$elm_ast$Ast_Helpers$loName,
						_1: {
							ctor: '::',
							_0: _elm_community$parser_combinators$Combine$parens(_Bogdanp$elm_ast$Ast_Helpers$operator),
							_1: {ctor: '[]'}
						}
					})),
			_elm_community$parser_combinators$Combine$many(
				A2(
					_Bogdanp$elm_ast$Ast_Helpers$between_,
					_elm_community$parser_combinators$Combine$whitespace,
					_Bogdanp$elm_ast$Ast_Expression$term(ops)))),
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			A2(
				_elm_community$parser_combinators$Combine_ops['*>'],
				_Bogdanp$elm_ast$Ast_Helpers$symbol('='),
				_elm_community$parser_combinators$Combine$whitespace),
			_Bogdanp$elm_ast$Ast_Expression$expression(ops)));
};
var _Bogdanp$elm_ast$Ast_Statement$FunctionTypeDeclaration = F2(
	function (a, b) {
		return {ctor: 'FunctionTypeDeclaration', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Statement$functionTypeDeclaration = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		_Bogdanp$elm_ast$Ast_Statement$FunctionTypeDeclaration,
		A2(
			_elm_community$parser_combinators$Combine_ops['<*'],
			_elm_community$parser_combinators$Combine$choice(
				{
					ctor: '::',
					_0: _Bogdanp$elm_ast$Ast_Helpers$loName,
					_1: {
						ctor: '::',
						_0: _elm_community$parser_combinators$Combine$parens(_Bogdanp$elm_ast$Ast_Helpers$operator),
						_1: {ctor: '[]'}
					}
				}),
			_Bogdanp$elm_ast$Ast_Helpers$symbol(':'))),
	_Bogdanp$elm_ast$Ast_Statement$typeAnnotation);
var _Bogdanp$elm_ast$Ast_Statement$PortDeclaration = F3(
	function (a, b, c) {
		return {ctor: 'PortDeclaration', _0: a, _1: b, _2: c};
	});
var _Bogdanp$elm_ast$Ast_Statement$portDeclaration = function (ops) {
	return A2(
		_elm_community$parser_combinators$Combine_ops['<*>'],
		A2(
			_elm_community$parser_combinators$Combine_ops['<*>'],
			A2(
				_elm_community$parser_combinators$Combine_ops['<$>'],
				_Bogdanp$elm_ast$Ast_Statement$PortDeclaration,
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('port'),
					_Bogdanp$elm_ast$Ast_Helpers$loName)),
			_elm_community$parser_combinators$Combine$many(
				A2(_Bogdanp$elm_ast$Ast_Helpers$between_, _Bogdanp$elm_ast$Ast_Helpers$spaces, _Bogdanp$elm_ast$Ast_Helpers$loName))),
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			_Bogdanp$elm_ast$Ast_Helpers$symbol('='),
			_Bogdanp$elm_ast$Ast_Expression$expression(ops)));
};
var _Bogdanp$elm_ast$Ast_Statement$PortTypeDeclaration = F2(
	function (a, b) {
		return {ctor: 'PortTypeDeclaration', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Statement$portTypeDeclaration = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		_Bogdanp$elm_ast$Ast_Statement$PortTypeDeclaration,
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('port'),
			_Bogdanp$elm_ast$Ast_Helpers$loName)),
	A2(
		_elm_community$parser_combinators$Combine_ops['*>'],
		_Bogdanp$elm_ast$Ast_Helpers$symbol(':'),
		_Bogdanp$elm_ast$Ast_Statement$typeAnnotation));
var _Bogdanp$elm_ast$Ast_Statement$TypeDeclaration = F2(
	function (a, b) {
		return {ctor: 'TypeDeclaration', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Statement$typeDeclaration = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		_Bogdanp$elm_ast$Ast_Statement$TypeDeclaration,
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('type'),
			_Bogdanp$elm_ast$Ast_Statement$type_)),
	A2(
		_elm_community$parser_combinators$Combine_ops['*>'],
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			_elm_community$parser_combinators$Combine$whitespace,
			_Bogdanp$elm_ast$Ast_Helpers$symbol('=')),
		A2(
			_elm_community$parser_combinators$Combine$sepBy1,
			_Bogdanp$elm_ast$Ast_Helpers$symbol('|'),
			A2(_Bogdanp$elm_ast$Ast_Helpers$between_, _elm_community$parser_combinators$Combine$whitespace, _Bogdanp$elm_ast$Ast_Statement$typeConstructor))));
var _Bogdanp$elm_ast$Ast_Statement$TypeAliasDeclaration = F2(
	function (a, b) {
		return {ctor: 'TypeAliasDeclaration', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Statement$typeAliasDeclaration = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		_Bogdanp$elm_ast$Ast_Statement$TypeAliasDeclaration,
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			A2(
				_elm_community$parser_combinators$Combine_ops['*>'],
				_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('type'),
				_Bogdanp$elm_ast$Ast_Helpers$symbol('alias')),
			_Bogdanp$elm_ast$Ast_Statement$type_)),
	A2(
		_elm_community$parser_combinators$Combine_ops['*>'],
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			_elm_community$parser_combinators$Combine$whitespace,
			_Bogdanp$elm_ast$Ast_Helpers$symbol('=')),
		_Bogdanp$elm_ast$Ast_Statement$typeAnnotation));
var _Bogdanp$elm_ast$Ast_Statement$ImportStatement = F3(
	function (a, b, c) {
		return {ctor: 'ImportStatement', _0: a, _1: b, _2: c};
	});
var _Bogdanp$elm_ast$Ast_Statement$importStatement = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<*>'],
		A2(
			_elm_community$parser_combinators$Combine_ops['<$>'],
			_Bogdanp$elm_ast$Ast_Statement$ImportStatement,
			A2(
				_elm_community$parser_combinators$Combine_ops['*>'],
				_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('import'),
				_Bogdanp$elm_ast$Ast_Helpers$moduleName)),
		_elm_community$parser_combinators$Combine$maybe(
			A2(
				_elm_community$parser_combinators$Combine_ops['*>'],
				_Bogdanp$elm_ast$Ast_Helpers$symbol('as'),
				_Bogdanp$elm_ast$Ast_Helpers$upName))),
	_elm_community$parser_combinators$Combine$maybe(
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			_Bogdanp$elm_ast$Ast_Helpers$symbol('exposing'),
			_Bogdanp$elm_ast$Ast_Statement$exports)));
var _Bogdanp$elm_ast$Ast_Statement$EffectModuleDeclaration = F3(
	function (a, b, c) {
		return {ctor: 'EffectModuleDeclaration', _0: a, _1: b, _2: c};
	});
var _Bogdanp$elm_ast$Ast_Statement$effectModuleDeclaration = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<*>'],
		A2(
			_elm_community$parser_combinators$Combine_ops['<$>'],
			_Bogdanp$elm_ast$Ast_Statement$EffectModuleDeclaration,
			A2(
				_elm_community$parser_combinators$Combine_ops['*>'],
				A2(
					_elm_community$parser_combinators$Combine_ops['*>'],
					_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('effect'),
					_Bogdanp$elm_ast$Ast_Helpers$symbol('module')),
				_Bogdanp$elm_ast$Ast_Helpers$moduleName)),
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			_Bogdanp$elm_ast$Ast_Helpers$symbol('where'),
			_elm_community$parser_combinators$Combine$braces(
				_Bogdanp$elm_ast$Ast_Helpers$commaSeparated(
					A2(
						_elm_community$parser_combinators$Combine_ops['<*>'],
						A2(
							_elm_community$parser_combinators$Combine_ops['<$>'],
							F2(
								function (v0, v1) {
									return {ctor: '_Tuple2', _0: v0, _1: v1};
								}),
							_Bogdanp$elm_ast$Ast_Helpers$loName),
						A2(
							_elm_community$parser_combinators$Combine_ops['*>'],
							_Bogdanp$elm_ast$Ast_Helpers$symbol('='),
							_Bogdanp$elm_ast$Ast_Helpers$upName)))))),
	A2(
		_elm_community$parser_combinators$Combine_ops['*>'],
		_Bogdanp$elm_ast$Ast_Helpers$symbol('exposing'),
		_Bogdanp$elm_ast$Ast_Statement$exports));
var _Bogdanp$elm_ast$Ast_Statement$PortModuleDeclaration = F2(
	function (a, b) {
		return {ctor: 'PortModuleDeclaration', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Statement$portModuleDeclaration = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		_Bogdanp$elm_ast$Ast_Statement$PortModuleDeclaration,
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			A2(
				_elm_community$parser_combinators$Combine_ops['*>'],
				_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('port'),
				_Bogdanp$elm_ast$Ast_Helpers$symbol('module')),
			_Bogdanp$elm_ast$Ast_Helpers$moduleName)),
	A2(
		_elm_community$parser_combinators$Combine_ops['*>'],
		_Bogdanp$elm_ast$Ast_Helpers$symbol('exposing'),
		_Bogdanp$elm_ast$Ast_Statement$exports));
var _Bogdanp$elm_ast$Ast_Statement$ModuleDeclaration = F2(
	function (a, b) {
		return {ctor: 'ModuleDeclaration', _0: a, _1: b};
	});
var _Bogdanp$elm_ast$Ast_Statement$moduleDeclaration = A2(
	_elm_community$parser_combinators$Combine_ops['<*>'],
	A2(
		_elm_community$parser_combinators$Combine_ops['<$>'],
		_Bogdanp$elm_ast$Ast_Statement$ModuleDeclaration,
		A2(
			_elm_community$parser_combinators$Combine_ops['*>'],
			_Bogdanp$elm_ast$Ast_Helpers$initialSymbol('module'),
			_Bogdanp$elm_ast$Ast_Helpers$moduleName)),
	A2(
		_elm_community$parser_combinators$Combine_ops['*>'],
		_Bogdanp$elm_ast$Ast_Helpers$symbol('exposing'),
		_Bogdanp$elm_ast$Ast_Statement$exports));
var _Bogdanp$elm_ast$Ast_Statement$statement = function (ops) {
	return _elm_community$parser_combinators$Combine$choice(
		{
			ctor: '::',
			_0: _Bogdanp$elm_ast$Ast_Statement$portModuleDeclaration,
			_1: {
				ctor: '::',
				_0: _Bogdanp$elm_ast$Ast_Statement$effectModuleDeclaration,
				_1: {
					ctor: '::',
					_0: _Bogdanp$elm_ast$Ast_Statement$moduleDeclaration,
					_1: {
						ctor: '::',
						_0: _Bogdanp$elm_ast$Ast_Statement$importStatement,
						_1: {
							ctor: '::',
							_0: _Bogdanp$elm_ast$Ast_Statement$typeAliasDeclaration,
							_1: {
								ctor: '::',
								_0: _Bogdanp$elm_ast$Ast_Statement$typeDeclaration,
								_1: {
									ctor: '::',
									_0: _Bogdanp$elm_ast$Ast_Statement$portTypeDeclaration,
									_1: {
										ctor: '::',
										_0: _Bogdanp$elm_ast$Ast_Statement$portDeclaration(ops),
										_1: {
											ctor: '::',
											_0: _Bogdanp$elm_ast$Ast_Statement$functionTypeDeclaration,
											_1: {
												ctor: '::',
												_0: _Bogdanp$elm_ast$Ast_Statement$functionDeclaration(ops),
												_1: {
													ctor: '::',
													_0: _Bogdanp$elm_ast$Ast_Statement$infixDeclaration,
													_1: {
														ctor: '::',
														_0: _Bogdanp$elm_ast$Ast_Statement$comment,
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _Bogdanp$elm_ast$Ast_Statement$statements = function (ops) {
	return A2(
		_elm_community$parser_combinators$Combine$manyTill,
		A2(
			_elm_community$parser_combinators$Combine_ops['<*'],
			A2(
				_elm_community$parser_combinators$Combine_ops['*>'],
				_elm_community$parser_combinators$Combine$whitespace,
				_Bogdanp$elm_ast$Ast_Statement$statement(ops)),
			_elm_community$parser_combinators$Combine$whitespace),
		_elm_community$parser_combinators$Combine$end);
};

var _Bogdanp$elm_ast$Ast$parseModule = function (ops) {
	return _elm_community$parser_combinators$Combine$parse(
		_Bogdanp$elm_ast$Ast_Statement$statements(ops));
};
var _Bogdanp$elm_ast$Ast$parseOpTable = function (ops) {
	return _elm_community$parser_combinators$Combine$parse(
		_Bogdanp$elm_ast$Ast_Statement$opTable(ops));
};
var _Bogdanp$elm_ast$Ast$parse = function (input) {
	var _p0 = A2(_Bogdanp$elm_ast$Ast$parseOpTable, _Bogdanp$elm_ast$Ast_BinOp$operators, input);
	if (_p0.ctor === 'Ok') {
		return A2(_Bogdanp$elm_ast$Ast$parseModule, _p0._0._2, input);
	} else {
		return _elm_lang$core$Result$Err(_p0._0);
	}
};
var _Bogdanp$elm_ast$Ast$parseStatement = function (ops) {
	return _elm_community$parser_combinators$Combine$parse(
		A2(
			_elm_community$parser_combinators$Combine_ops['<*'],
			_Bogdanp$elm_ast$Ast_Statement$statement(ops),
			_elm_community$parser_combinators$Combine$end));
};
var _Bogdanp$elm_ast$Ast$parseExpression = function (ops) {
	return _elm_community$parser_combinators$Combine$parse(
		A2(
			_elm_community$parser_combinators$Combine_ops['<*'],
			_Bogdanp$elm_ast$Ast_Expression$expression(ops),
			_elm_community$parser_combinators$Combine$end));
};

var _elm_community$dict_extra$Dict_Extra$find = F2(
	function (predicate, dict) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, acc) {
					var _p0 = acc;
					if (_p0.ctor === 'Just') {
						return acc;
					} else {
						return A2(predicate, k, v) ? _elm_lang$core$Maybe$Just(
							{ctor: '_Tuple2', _0: k, _1: v}) : _elm_lang$core$Maybe$Nothing;
					}
				}),
			_elm_lang$core$Maybe$Nothing,
			dict);
	});
var _elm_community$dict_extra$Dict_Extra$invert = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldl,
		F3(
			function (k, v, acc) {
				return A3(_elm_lang$core$Dict$insert, v, k, acc);
			}),
		_elm_lang$core$Dict$empty,
		dict);
};
var _elm_community$dict_extra$Dict_Extra$filterMap = F2(
	function (f, dict) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, acc) {
					var _p1 = A2(f, k, v);
					if (_p1.ctor === 'Just') {
						return A3(_elm_lang$core$Dict$insert, k, _p1._0, acc);
					} else {
						return acc;
					}
				}),
			_elm_lang$core$Dict$empty,
			dict);
	});
var _elm_community$dict_extra$Dict_Extra$mapKeys = F2(
	function (keyMapper, dict) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, acc) {
					return A3(
						_elm_lang$core$Dict$insert,
						keyMapper(k),
						v,
						acc);
				}),
			_elm_lang$core$Dict$empty,
			dict);
	});
var _elm_community$dict_extra$Dict_Extra$keepOnly = F2(
	function (set, dict) {
		return A3(
			_elm_lang$core$Set$foldl,
			F2(
				function (k, acc) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						acc,
						A2(
							_elm_lang$core$Maybe$map,
							function (v) {
								return A3(_elm_lang$core$Dict$insert, k, v, acc);
							},
							A2(_elm_lang$core$Dict$get, k, dict)));
				}),
			_elm_lang$core$Dict$empty,
			set);
	});
var _elm_community$dict_extra$Dict_Extra$removeMany = F2(
	function (set, dict) {
		return A3(_elm_lang$core$Set$foldl, _elm_lang$core$Dict$remove, dict, set);
	});
var _elm_community$dict_extra$Dict_Extra$removeWhen = F2(
	function (pred, dict) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, v) {
					return !A2(pred, k, v);
				}),
			dict);
	});
var _elm_community$dict_extra$Dict_Extra$fromListBy = F2(
	function (keyfn, xs) {
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (x, acc) {
					return A3(
						_elm_lang$core$Dict$insert,
						keyfn(x),
						x,
						acc);
				}),
			_elm_lang$core$Dict$empty,
			xs);
	});
var _elm_community$dict_extra$Dict_Extra$groupBy = F2(
	function (keyfn, list) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return A3(
						_elm_lang$core$Dict$update,
						keyfn(x),
						function (_p2) {
							return _elm_lang$core$Maybe$Just(
								A2(
									_elm_lang$core$Maybe$withDefault,
									{
										ctor: '::',
										_0: x,
										_1: {ctor: '[]'}
									},
									A2(
										_elm_lang$core$Maybe$map,
										F2(
											function (x, y) {
												return {ctor: '::', _0: x, _1: y};
											})(x),
										_p2)));
						},
						acc);
				}),
			_elm_lang$core$Dict$empty,
			list);
	});

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$http$Native_Http = function() {


// ENCODING AND DECODING

function encodeUri(string)
{
	return encodeURIComponent(string);
}

function decodeUri(string)
{
	try
	{
		return _elm_lang$core$Maybe$Just(decodeURIComponent(string));
	}
	catch(e)
	{
		return _elm_lang$core$Maybe$Nothing;
	}
}


// SEND REQUEST

function toTask(request, maybeProgress)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var xhr = new XMLHttpRequest();

		configureProgress(xhr, maybeProgress);

		xhr.addEventListener('error', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NetworkError' }));
		});
		xhr.addEventListener('timeout', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'Timeout' }));
		});
		xhr.addEventListener('load', function() {
			callback(handleResponse(xhr, request.expect.responseToResult));
		});

		try
		{
			xhr.open(request.method, request.url, true);
		}
		catch (e)
		{
			return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'BadUrl', _0: request.url }));
		}

		configureRequest(xhr, request);
		send(xhr, request.body);

		return function() { xhr.abort(); };
	});
}

function configureProgress(xhr, maybeProgress)
{
	if (maybeProgress.ctor === 'Nothing')
	{
		return;
	}

	xhr.addEventListener('progress', function(event) {
		if (!event.lengthComputable)
		{
			return;
		}
		_elm_lang$core$Native_Scheduler.rawSpawn(maybeProgress._0({
			bytes: event.loaded,
			bytesExpected: event.total
		}));
	});
}

function configureRequest(xhr, request)
{
	function setHeader(pair)
	{
		xhr.setRequestHeader(pair._0, pair._1);
	}

	A2(_elm_lang$core$List$map, setHeader, request.headers);
	xhr.responseType = request.expect.responseType;
	xhr.withCredentials = request.withCredentials;

	if (request.timeout.ctor === 'Just')
	{
		xhr.timeout = request.timeout._0;
	}
}

function send(xhr, body)
{
	switch (body.ctor)
	{
		case 'EmptyBody':
			xhr.send();
			return;

		case 'StringBody':
			xhr.setRequestHeader('Content-Type', body._0);
			xhr.send(body._1);
			return;

		case 'FormDataBody':
			xhr.send(body._0);
			return;
	}
}


// RESPONSES

function handleResponse(xhr, responseToResult)
{
	var response = toResponse(xhr);

	if (xhr.status < 200 || 300 <= xhr.status)
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadStatus',
			_0: response
		});
	}

	var result = responseToResult(response);

	if (result.ctor === 'Ok')
	{
		return _elm_lang$core$Native_Scheduler.succeed(result._0);
	}
	else
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadPayload',
			_0: result._0,
			_1: response
		});
	}
}

function toResponse(xhr)
{
	return {
		status: { code: xhr.status, message: xhr.statusText },
		headers: parseHeaders(xhr.getAllResponseHeaders()),
		url: xhr.responseURL,
		body: xhr.response
	};
}

function parseHeaders(rawHeaders)
{
	var headers = _elm_lang$core$Dict$empty;

	if (!rawHeaders)
	{
		return headers;
	}

	var headerPairs = rawHeaders.split('\u000d\u000a');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf('\u003a\u0020');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3(_elm_lang$core$Dict$update, key, function(oldValue) {
				if (oldValue.ctor === 'Just')
				{
					return _elm_lang$core$Maybe$Just(value + ', ' + oldValue._0);
				}
				return _elm_lang$core$Maybe$Just(value);
			}, headers);
		}
	}

	return headers;
}


// EXPECTORS

function expectStringResponse(responseToResult)
{
	return {
		responseType: 'text',
		responseToResult: responseToResult
	};
}

function mapExpect(func, expect)
{
	return {
		responseType: expect.responseType,
		responseToResult: function(response) {
			var convertedResponse = expect.responseToResult(response);
			return A2(_elm_lang$core$Result$map, func, convertedResponse);
		}
	};
}


// BODY

function multipart(parts)
{
	var formData = new FormData();

	while (parts.ctor !== '[]')
	{
		var part = parts._0;
		formData.append(part._0, part._1);
		parts = parts._1;
	}

	return { ctor: 'FormDataBody', _0: formData };
}

return {
	toTask: F2(toTask),
	expectStringResponse: expectStringResponse,
	mapExpect: F2(mapExpect),
	multipart: multipart,
	encodeUri: encodeUri,
	decodeUri: decodeUri
};

}();

var _elm_lang$http$Http_Internal$map = F2(
	function (func, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				expect: A2(_elm_lang$http$Native_Http.mapExpect, func, request.expect)
			});
	});
var _elm_lang$http$Http_Internal$RawRequest = F7(
	function (a, b, c, d, e, f, g) {
		return {method: a, headers: b, url: c, body: d, expect: e, timeout: f, withCredentials: g};
	});
var _elm_lang$http$Http_Internal$Request = function (a) {
	return {ctor: 'Request', _0: a};
};
var _elm_lang$http$Http_Internal$Expect = {ctor: 'Expect'};
var _elm_lang$http$Http_Internal$FormDataBody = {ctor: 'FormDataBody'};
var _elm_lang$http$Http_Internal$StringBody = F2(
	function (a, b) {
		return {ctor: 'StringBody', _0: a, _1: b};
	});
var _elm_lang$http$Http_Internal$EmptyBody = {ctor: 'EmptyBody'};
var _elm_lang$http$Http_Internal$Header = F2(
	function (a, b) {
		return {ctor: 'Header', _0: a, _1: b};
	});

var _elm_lang$http$Http$decodeUri = _elm_lang$http$Native_Http.decodeUri;
var _elm_lang$http$Http$encodeUri = _elm_lang$http$Native_Http.encodeUri;
var _elm_lang$http$Http$expectStringResponse = _elm_lang$http$Native_Http.expectStringResponse;
var _elm_lang$http$Http$expectJson = function (decoder) {
	return _elm_lang$http$Http$expectStringResponse(
		function (response) {
			return A2(_elm_lang$core$Json_Decode$decodeString, decoder, response.body);
		});
};
var _elm_lang$http$Http$expectString = _elm_lang$http$Http$expectStringResponse(
	function (response) {
		return _elm_lang$core$Result$Ok(response.body);
	});
var _elm_lang$http$Http$multipartBody = _elm_lang$http$Native_Http.multipart;
var _elm_lang$http$Http$stringBody = _elm_lang$http$Http_Internal$StringBody;
var _elm_lang$http$Http$jsonBody = function (value) {
	return A2(
		_elm_lang$http$Http_Internal$StringBody,
		'application/json',
		A2(_elm_lang$core$Json_Encode$encode, 0, value));
};
var _elm_lang$http$Http$emptyBody = _elm_lang$http$Http_Internal$EmptyBody;
var _elm_lang$http$Http$header = _elm_lang$http$Http_Internal$Header;
var _elm_lang$http$Http$request = _elm_lang$http$Http_Internal$Request;
var _elm_lang$http$Http$post = F3(
	function (url, body, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'POST',
				headers: {ctor: '[]'},
				url: url,
				body: body,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$get = F2(
	function (url, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'GET',
				headers: {ctor: '[]'},
				url: url,
				body: _elm_lang$http$Http$emptyBody,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$getString = function (url) {
	return _elm_lang$http$Http$request(
		{
			method: 'GET',
			headers: {ctor: '[]'},
			url: url,
			body: _elm_lang$http$Http$emptyBody,
			expect: _elm_lang$http$Http$expectString,
			timeout: _elm_lang$core$Maybe$Nothing,
			withCredentials: false
		});
};
var _elm_lang$http$Http$toTask = function (_p0) {
	var _p1 = _p0;
	return A2(_elm_lang$http$Native_Http.toTask, _p1._0, _elm_lang$core$Maybe$Nothing);
};
var _elm_lang$http$Http$send = F2(
	function (resultToMessage, request) {
		return A2(
			_elm_lang$core$Task$attempt,
			resultToMessage,
			_elm_lang$http$Http$toTask(request));
	});
var _elm_lang$http$Http$Response = F4(
	function (a, b, c, d) {
		return {url: a, status: b, headers: c, body: d};
	});
var _elm_lang$http$Http$BadPayload = F2(
	function (a, b) {
		return {ctor: 'BadPayload', _0: a, _1: b};
	});
var _elm_lang$http$Http$BadStatus = function (a) {
	return {ctor: 'BadStatus', _0: a};
};
var _elm_lang$http$Http$NetworkError = {ctor: 'NetworkError'};
var _elm_lang$http$Http$Timeout = {ctor: 'Timeout'};
var _elm_lang$http$Http$BadUrl = function (a) {
	return {ctor: 'BadUrl', _0: a};
};
var _elm_lang$http$Http$StringPart = F2(
	function (a, b) {
		return {ctor: 'StringPart', _0: a, _1: b};
	});
var _elm_lang$http$Http$stringPart = _elm_lang$http$Http$StringPart;

var _user$project$Helper$indent = function (count) {
	return A2(
		_elm_lang$core$String$join,
		'',
		A2(_elm_lang$core$List$repeat, count, '    '));
};
var _user$project$Helper$decapitalize = function (str) {
	var _p0 = _elm_lang$core$String$uncons(str);
	if (_p0.ctor === 'Just') {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$String$toLower(
				_elm_lang$core$String$fromChar(_p0._0._0)),
			_p0._0._1);
	} else {
		return '';
	}
};
var _user$project$Helper$last = function (list) {
	return _elm_lang$core$List$head(
		_elm_lang$core$List$reverse(list));
};
var _user$project$Helper$dropLast = function (list) {
	return _elm_lang$core$List$reverse(
		A2(
			_elm_lang$core$Maybe$withDefault,
			{ctor: '[]'},
			_elm_lang$core$List$tail(
				_elm_lang$core$List$reverse(list))));
};
var _user$project$Helper$isCapitalized = function (str) {
	var firstChar = A3(_elm_lang$core$String$slice, 0, 1, str);
	return _elm_lang$core$Native_Utils.eq(firstChar, '') ? false : _elm_lang$core$Native_Utils.eq(
		firstChar,
		A3(
			_elm_lang$core$String$slice,
			0,
			1,
			_elm_lang$core$String$toUpper(str)));
};
var _user$project$Helper$infixRegex = _elm_lang$core$Regex$regex('^[~!@#\\$%\\^&\\*\\-\\+=:\\|\\\\<>\\.\\?\\/]+$');
var _user$project$Helper$isInfix = _elm_lang$core$Regex$contains(_user$project$Helper$infixRegex);
var _user$project$Helper$holeToken = '?';

var _user$project$Indexer$unencloseParentheses = function (str) {
	var dropLength = (A2(_elm_lang$core$String$startsWith, '(', str) && A2(_elm_lang$core$String$endsWith, ')', str)) ? 1 : 0;
	return A2(
		_elm_lang$core$String$dropRight,
		dropLength,
		A2(_elm_lang$core$String$dropLeft, dropLength, str));
};
var _user$project$Indexer$getModuleAndSymbolName = function (_p0) {
	var _p1 = _p0;
	var _p4 = _p1.fullName;
	var _p2 = _p1.kind;
	if (_p2.ctor === 'KindModule') {
		return {ctor: '_Tuple2', _0: _p4, _1: _elm_lang$core$Maybe$Nothing};
	} else {
		var parts = _elm_lang$core$List$reverse(
			A2(_elm_lang$core$String$split, '.', _p4));
		var symbolName = A2(
			_elm_lang$core$Maybe$withDefault,
			'',
			_elm_lang$core$List$head(parts));
		var moduleName = A2(
			_elm_lang$core$String$join,
			'.',
			_elm_lang$core$List$reverse(
				A2(
					_elm_lang$core$Maybe$withDefault,
					{ctor: '[]'},
					_elm_lang$core$List$tail(parts))));
		return {
			ctor: '_Tuple2',
			_0: (!_elm_lang$core$Native_Utils.eq(moduleName, '')) ? moduleName : symbolName,
			_1: function () {
				if (!_elm_lang$core$Native_Utils.eq(moduleName, '')) {
					var _p3 = _p1.caseTipe;
					if (_p3.ctor === 'Just') {
						return _elm_lang$core$Maybe$Just(
							A2(
								_elm_lang$core$Basics_ops['++'],
								_p3._0,
								A2(
									_elm_lang$core$Basics_ops['++'],
									'(',
									A2(_elm_lang$core$Basics_ops['++'], symbolName, ')'))));
					} else {
						return _elm_lang$core$Maybe$Just(symbolName);
					}
				} else {
					return _elm_lang$core$Maybe$Nothing;
				}
			}()
		};
	}
};
var _user$project$Indexer$getModuleName = function (fullName) {
	return A2(
		_elm_lang$core$String$join,
		'.',
		_user$project$Helper$dropLast(
			A2(_elm_lang$core$String$split, '.', fullName)));
};
var _user$project$Indexer$getLastName = function (fullName) {
	return A3(
		_elm_lang$core$List$foldl,
		_elm_lang$core$Basics$always,
		'',
		A2(_elm_lang$core$String$split, '.', fullName));
};
var _user$project$Indexer$isExposed = F2(
	function (name, exposed) {
		var _p5 = exposed;
		switch (_p5.ctor) {
			case 'None':
				return false;
			case 'Some':
				return A2(_elm_lang$core$Set$member, name, _p5._0);
			default:
				return true;
		}
	});
var _user$project$Indexer$getModuleLocalName = F3(
	function (moduleName, alias, name) {
		var _p6 = alias;
		if (_p6.ctor === 'Just') {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_p6._0,
				A2(_elm_lang$core$Basics_ops['++'], '.', name));
		} else {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				moduleName,
				A2(_elm_lang$core$Basics_ops['++'], '.', name));
		}
	});
var _user$project$Indexer$getTipeCaseTypeAnnotation = F2(
	function (tipeCase, tipe) {
		return A2(
			_elm_lang$core$String$join,
			' -> ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				tipeCase.args,
				{
					ctor: '::',
					_0: (_elm_lang$core$Native_Utils.cmp(
						_elm_lang$core$List$length(tipe.args),
						0) > 0) ? A2(
						_elm_lang$core$Basics_ops['++'],
						tipe.tipe,
						A2(
							_elm_lang$core$Basics_ops['++'],
							' ',
							A2(_elm_lang$core$String$join, ' ', tipe.args))) : tipe.tipe,
					_1: {ctor: '[]'}
				}));
	});
var _user$project$Indexer$isDecoderTipe = function (tipeString) {
	var _p7 = _elm_lang$core$List$head(
		A2(_elm_lang$core$String$split, ' ', tipeString));
	if (_p7.ctor === 'Just') {
		return _elm_lang$core$Native_Utils.eq(
			_user$project$Indexer$getLastName(_p7._0),
			'Decoder');
	} else {
		return false;
	}
};
var _user$project$Indexer$isRecordString = function (tipeString) {
	return A2(_elm_lang$core$String$startsWith, '{', tipeString) && A2(_elm_lang$core$String$endsWith, '}', tipeString);
};
var _user$project$Indexer$valueToHintable = function (value) {
	return {
		ctor: '_Tuple2',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _user$project$Indexer$tipeToValue = function (_p8) {
	var _p9 = _p8;
	return {
		name: _p9.name,
		comment: _p9.comment,
		tipe: _p9.tipe,
		args: _elm_lang$core$Maybe$Just(_p9.args),
		associativity: _elm_lang$core$Maybe$Nothing,
		precedence: _elm_lang$core$Maybe$Nothing
	};
};
var _user$project$Indexer$tipeToHintable = function (tipe) {
	return {
		ctor: '_Tuple2',
		_0: _user$project$Indexer$tipeToValue(tipe),
		_1: tipe.cases
	};
};
var _user$project$Indexer$getRecordArgParts = function (recordString) {
	var _p10 = A3(_elm_lang$core$String$slice, 1, -1, recordString);
	if (_p10 === '') {
		return {ctor: '[]'};
	} else {
		return A2(
			_elm_lang$core$List$map,
			_elm_lang$core$String$trim,
			A2(_elm_lang$core$String$split, ',', _p10));
	}
};
var _user$project$Indexer$getCharAndRest = function (str) {
	var _p11 = _elm_lang$core$String$uncons(str);
	if (_p11.ctor === 'Just') {
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$String$fromChar(_p11._0._0),
			_1: _p11._0._1
		};
	} else {
		return {ctor: '_Tuple2', _0: '', _1: ''};
	}
};
var _user$project$Indexer$getTuplePartsRecur = F4(
	function (str, acc, parts, _p12) {
		getTuplePartsRecur:
		while (true) {
			var _p13 = _p12;
			var _p19 = _p13._0;
			var _p18 = _p13._1;
			var _p14 = str;
			if (_p14 === '') {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					parts,
					{
						ctor: '::',
						_0: _elm_lang$core$String$trim(acc),
						_1: {ctor: '[]'}
					});
			} else {
				var _p15 = _user$project$Indexer$getCharAndRest(str);
				var thisChar = _p15._0;
				var thisRest = _p15._1;
				if (_elm_lang$core$Native_Utils.eq(_p19, 0) && (_elm_lang$core$Native_Utils.eq(_p18, 0) && _elm_lang$core$Native_Utils.eq(thisChar, ','))) {
					var _v11 = thisRest,
						_v12 = '',
						_v13 = A2(
						_elm_lang$core$Basics_ops['++'],
						parts,
						{
							ctor: '::',
							_0: _elm_lang$core$String$trim(acc),
							_1: {ctor: '[]'}
						}),
						_v14 = {ctor: '_Tuple2', _0: 0, _1: 0};
					str = _v11;
					acc = _v12;
					parts = _v13;
					_p12 = _v14;
					continue getTuplePartsRecur;
				} else {
					var _p16 = function () {
						var _p17 = thisChar;
						switch (_p17) {
							case '(':
								return {ctor: '_Tuple2', _0: _p19 + 1, _1: _p18};
							case ')':
								return {ctor: '_Tuple2', _0: _p19 - 1, _1: _p18};
							case '{':
								return {ctor: '_Tuple2', _0: _p19, _1: _p18 + 1};
							case '}':
								return {ctor: '_Tuple2', _0: _p19, _1: _p18 - 1};
							default:
								return {ctor: '_Tuple2', _0: _p19, _1: _p18};
						}
					}();
					var updatedOpenParentheses = _p16._0;
					var updatedOpenBraces = _p16._1;
					if ((_elm_lang$core$Native_Utils.cmp(updatedOpenParentheses, 0) < 0) || (_elm_lang$core$Native_Utils.cmp(updatedOpenBraces, 0) < 0)) {
						return {ctor: '[]'};
					} else {
						var _v16 = thisRest,
							_v17 = A2(_elm_lang$core$Basics_ops['++'], acc, thisChar),
							_v18 = parts,
							_v19 = {ctor: '_Tuple2', _0: updatedOpenParentheses, _1: updatedOpenBraces};
						str = _v16;
						acc = _v17;
						parts = _v18;
						_p12 = _v19;
						continue getTuplePartsRecur;
					}
				}
			}
		}
	});
var _user$project$Indexer$getTupleParts = function (tupleString) {
	var _p20 = A3(_elm_lang$core$String$slice, 1, -1, tupleString);
	if (_p20 === '') {
		return {ctor: '[]'};
	} else {
		return A4(
			_user$project$Indexer$getTuplePartsRecur,
			_p20,
			'',
			{ctor: '[]'},
			{ctor: '_Tuple2', _0: 0, _1: 0});
	}
};
var _user$project$Indexer$getRecordTipePartsRecur = F5(
	function (str, _p22, lookingForTipe, parts, _p21) {
		getRecordTipePartsRecur:
		while (true) {
			var _p23 = _p22;
			var _p33 = _p23._1;
			var _p32 = _p23._0;
			var _p24 = _p21;
			var _p31 = _p24._0;
			var _p30 = _p24._1;
			var _p25 = str;
			if (_p25 === '') {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					parts,
					{
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: _elm_lang$core$String$trim(_p32),
							_1: _elm_lang$core$String$trim(_p33)
						},
						_1: {ctor: '[]'}
					});
			} else {
				var _p26 = _user$project$Indexer$getCharAndRest(str);
				var thisChar = _p26._0;
				var thisRest = _p26._1;
				if (_elm_lang$core$Native_Utils.eq(_p31, 0) && (_elm_lang$core$Native_Utils.eq(_p30, 0) && _elm_lang$core$Native_Utils.eq(thisChar, ','))) {
					var _v24 = thisRest,
						_v25 = {ctor: '_Tuple2', _0: '', _1: ''},
						_v26 = false,
						_v27 = A2(
						_elm_lang$core$Basics_ops['++'],
						parts,
						{
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _elm_lang$core$String$trim(_p32),
								_1: _elm_lang$core$String$trim(_p33)
							},
							_1: {ctor: '[]'}
						}),
						_v28 = {ctor: '_Tuple2', _0: 0, _1: 0};
					str = _v24;
					_p22 = _v25;
					lookingForTipe = _v26;
					parts = _v27;
					_p21 = _v28;
					continue getRecordTipePartsRecur;
				} else {
					if (_elm_lang$core$Native_Utils.eq(_p31, 0) && (_elm_lang$core$Native_Utils.eq(_p30, 0) && _elm_lang$core$Native_Utils.eq(thisChar, ':'))) {
						var _v29 = thisRest,
							_v30 = {ctor: '_Tuple2', _0: _p32, _1: ''},
							_v31 = true,
							_v32 = parts,
							_v33 = {ctor: '_Tuple2', _0: 0, _1: 0};
						str = _v29;
						_p22 = _v30;
						lookingForTipe = _v31;
						parts = _v32;
						_p21 = _v33;
						continue getRecordTipePartsRecur;
					} else {
						var _p27 = lookingForTipe ? {
							ctor: '_Tuple2',
							_0: _p32,
							_1: A2(_elm_lang$core$Basics_ops['++'], _p33, thisChar)
						} : {
							ctor: '_Tuple2',
							_0: A2(_elm_lang$core$Basics_ops['++'], _p32, thisChar),
							_1: _p33
						};
						var updatedFieldAcc = _p27._0;
						var updatedTipeAcc = _p27._1;
						var _p28 = function () {
							var _p29 = thisChar;
							switch (_p29) {
								case '(':
									return {ctor: '_Tuple2', _0: _p31 + 1, _1: _p30};
								case ')':
									return {ctor: '_Tuple2', _0: _p31 - 1, _1: _p30};
								case '{':
									return {ctor: '_Tuple2', _0: _p31, _1: _p30 + 1};
								case '}':
									return {ctor: '_Tuple2', _0: _p31, _1: _p30 - 1};
								default:
									return {ctor: '_Tuple2', _0: _p31, _1: _p30};
							}
						}();
						var updatedOpenParentheses = _p28._0;
						var updatedOpenBraces = _p28._1;
						if ((_elm_lang$core$Native_Utils.cmp(updatedOpenParentheses, 0) < 0) || (_elm_lang$core$Native_Utils.cmp(updatedOpenBraces, 0) < 0)) {
							return {ctor: '[]'};
						} else {
							var _v35 = thisRest,
								_v36 = {ctor: '_Tuple2', _0: updatedFieldAcc, _1: updatedTipeAcc},
								_v37 = lookingForTipe,
								_v38 = parts,
								_v39 = {ctor: '_Tuple2', _0: updatedOpenParentheses, _1: updatedOpenBraces};
							str = _v35;
							_p22 = _v36;
							lookingForTipe = _v37;
							parts = _v38;
							_p21 = _v39;
							continue getRecordTipePartsRecur;
						}
					}
				}
			}
		}
	});
var _user$project$Indexer$getRecordTipeParts = function (tipeString) {
	var _p34 = A3(_elm_lang$core$String$slice, 1, -1, tipeString);
	if (_p34 === '') {
		return {ctor: '[]'};
	} else {
		return A5(
			_user$project$Indexer$getRecordTipePartsRecur,
			_p34,
			{ctor: '_Tuple2', _0: '', _1: ''},
			false,
			{ctor: '[]'},
			{ctor: '_Tuple2', _0: 0, _1: 0});
	}
};
var _user$project$Indexer$getRecordTipeFieldNames = function (tipeString) {
	return A2(
		_elm_lang$core$List$map,
		_elm_lang$core$Tuple$first,
		_user$project$Indexer$getRecordTipeParts(tipeString));
};
var _user$project$Indexer$getRecordTipeFieldTipes = function (tipeString) {
	return A2(
		_elm_lang$core$List$map,
		_elm_lang$core$Tuple$second,
		_user$project$Indexer$getRecordTipeParts(tipeString));
};
var _user$project$Indexer$getTipePartsRecur = F4(
	function (str, acc, parts, _p35) {
		getTipePartsRecur:
		while (true) {
			var _p36 = _p35;
			var _p42 = _p36._0;
			var _p41 = _p36._1;
			if (_elm_lang$core$Native_Utils.eq(str, '')) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					parts,
					{
						ctor: '::',
						_0: _elm_lang$core$String$trim(acc),
						_1: {ctor: '[]'}
					});
			} else {
				var _p37 = _user$project$Indexer$getCharAndRest(str);
				var thisChar = _p37._0;
				var thisRest = _p37._1;
				var _p38 = _user$project$Indexer$getCharAndRest(thisRest);
				var nextChar = _p38._0;
				var nextRest = _p38._1;
				if (_elm_lang$core$Native_Utils.eq(_p42, 0) && (_elm_lang$core$Native_Utils.eq(_p41, 0) && (_elm_lang$core$Native_Utils.eq(thisChar, '-') && _elm_lang$core$Native_Utils.eq(nextChar, '>')))) {
					var _v42 = nextRest,
						_v43 = '',
						_v44 = A2(
						_elm_lang$core$Basics_ops['++'],
						parts,
						{
							ctor: '::',
							_0: _elm_lang$core$String$trim(acc),
							_1: {ctor: '[]'}
						}),
						_v45 = {ctor: '_Tuple2', _0: 0, _1: 0};
					str = _v42;
					acc = _v43;
					parts = _v44;
					_p35 = _v45;
					continue getTipePartsRecur;
				} else {
					var _p39 = function () {
						var _p40 = thisChar;
						switch (_p40) {
							case '(':
								return {ctor: '_Tuple2', _0: _p42 + 1, _1: _p41};
							case ')':
								return {ctor: '_Tuple2', _0: _p42 - 1, _1: _p41};
							case '{':
								return {ctor: '_Tuple2', _0: _p42, _1: _p41 + 1};
							case '}':
								return {ctor: '_Tuple2', _0: _p42, _1: _p41 - 1};
							default:
								return {ctor: '_Tuple2', _0: _p42, _1: _p41};
						}
					}();
					var updatedOpenParentheses = _p39._0;
					var updatedOpenBraces = _p39._1;
					if ((_elm_lang$core$Native_Utils.cmp(updatedOpenParentheses, 0) < 0) || (_elm_lang$core$Native_Utils.cmp(updatedOpenBraces, 0) < 0)) {
						return {ctor: '[]'};
					} else {
						var _v47 = thisRest,
							_v48 = A2(_elm_lang$core$Basics_ops['++'], acc, thisChar),
							_v49 = parts,
							_v50 = {ctor: '_Tuple2', _0: updatedOpenParentheses, _1: updatedOpenBraces};
						str = _v47;
						acc = _v48;
						parts = _v49;
						_p35 = _v50;
						continue getTipePartsRecur;
					}
				}
			}
		}
	});
var _user$project$Indexer$getArgsPartsRecur = F4(
	function (str, acc, parts, _p43) {
		getArgsPartsRecur:
		while (true) {
			var _p44 = _p43;
			var _p50 = _p44._0;
			var _p49 = _p44._1;
			var _p45 = str;
			if (_p45 === '') {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					parts,
					{
						ctor: '::',
						_0: _elm_lang$core$String$trim(acc),
						_1: {ctor: '[]'}
					});
			} else {
				var _p46 = _user$project$Indexer$getCharAndRest(str);
				var thisChar = _p46._0;
				var thisRest = _p46._1;
				if (_elm_lang$core$Native_Utils.eq(_p50, 0) && (_elm_lang$core$Native_Utils.eq(_p49, 0) && _elm_lang$core$Native_Utils.eq(thisChar, ' '))) {
					var _v53 = thisRest,
						_v54 = '',
						_v55 = A2(
						_elm_lang$core$Basics_ops['++'],
						parts,
						{
							ctor: '::',
							_0: _elm_lang$core$String$trim(acc),
							_1: {ctor: '[]'}
						}),
						_v56 = {ctor: '_Tuple2', _0: 0, _1: 0};
					str = _v53;
					acc = _v54;
					parts = _v55;
					_p43 = _v56;
					continue getArgsPartsRecur;
				} else {
					var _p47 = function () {
						var _p48 = thisChar;
						switch (_p48) {
							case '(':
								return {ctor: '_Tuple2', _0: _p50 + 1, _1: _p49};
							case ')':
								return {ctor: '_Tuple2', _0: _p50 - 1, _1: _p49};
							case '{':
								return {ctor: '_Tuple2', _0: _p50, _1: _p49 + 1};
							case '}':
								return {ctor: '_Tuple2', _0: _p50, _1: _p49 - 1};
							default:
								return {ctor: '_Tuple2', _0: _p50, _1: _p49};
						}
					}();
					var updatedOpenParentheses = _p47._0;
					var updatedOpenBraces = _p47._1;
					if ((_elm_lang$core$Native_Utils.cmp(updatedOpenParentheses, 0) < 0) || (_elm_lang$core$Native_Utils.cmp(updatedOpenBraces, 0) < 0)) {
						return {ctor: '[]'};
					} else {
						var _v58 = thisRest,
							_v59 = A2(_elm_lang$core$Basics_ops['++'], acc, thisChar),
							_v60 = parts,
							_v61 = {ctor: '_Tuple2', _0: updatedOpenParentheses, _1: updatedOpenBraces};
						str = _v58;
						acc = _v59;
						parts = _v60;
						_p43 = _v61;
						continue getArgsPartsRecur;
					}
				}
			}
		}
	});
var _user$project$Indexer$getArgsParts = function (argsString) {
	var _p51 = argsString;
	if (_p51 === '') {
		return {ctor: '[]'};
	} else {
		var _p52 = _p51;
		var args = A4(
			_user$project$Indexer$getArgsPartsRecur,
			_p52,
			'',
			{ctor: '[]'},
			{ctor: '_Tuple2', _0: 0, _1: 0});
		return A2(_elm_lang$core$List$member, '->', args) ? {
			ctor: '::',
			_0: _p52,
			_1: {ctor: '[]'}
		} : args;
	}
};
var _user$project$Indexer$filePathSeparator = ' > ';
var _user$project$Indexer$symbolKindToString = function (kind) {
	var _p53 = kind;
	switch (_p53.ctor) {
		case 'KindDefault':
			return 'default';
		case 'KindTypeAlias':
			return 'type alias';
		case 'KindType':
			return 'type';
		case 'KindTypeCase':
			return 'type case';
		case 'KindModule':
			return 'module';
		default:
			return 'variable';
	}
};
var _user$project$Indexer$encodeAssociativity = function (associativity) {
	var _p54 = associativity;
	if (_p54.ctor === 'Just') {
		switch (_p54._0.ctor) {
			case 'LeftAssociative':
				return _elm_lang$core$Maybe$Just('left');
			case 'RightAssociative':
				return _elm_lang$core$Maybe$Just('right');
			default:
				return _elm_lang$core$Maybe$Just('non');
		}
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _user$project$Indexer$encodeSymbol = function (symbol) {
	return {
		fullName: symbol.fullName,
		sourcePath: symbol.sourcePath,
		tipe: symbol.tipe,
		caseTipe: symbol.caseTipe,
		kind: _user$project$Indexer$symbolKindToString(symbol.kind)
	};
};
var _user$project$Indexer$optionalTaskSequence = function (list) {
	var _p55 = list;
	if (_p55.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		var _p56 = _p55._1;
		return A2(
			_elm_lang$core$Task$onError,
			function (value) {
				return A2(
					_elm_lang$core$Task$map,
					F2(
						function (x, y) {
							return {ctor: '::', _0: x, _1: y};
						})(
						_elm_lang$core$Result$Err(value)),
					_user$project$Indexer$optionalTaskSequence(_p56));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (value) {
					return A2(
						_elm_lang$core$Task$map,
						F2(
							function (x, y) {
								return {ctor: '::', _0: x, _1: y};
							})(
							_elm_lang$core$Result$Ok(value)),
						_user$project$Indexer$optionalTaskSequence(_p56));
				},
				_p55._0));
	}
};
var _user$project$Indexer$packageDocsPrefix = 'http://package.elm-lang.org/packages/';
var _user$project$Indexer$toPackageUri = function (_p57) {
	var _p58 = _p57;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_user$project$Indexer$packageDocsPrefix,
		A2(
			_elm_lang$core$Basics_ops['++'],
			_p58._0,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'/',
				A2(_elm_lang$core$Basics_ops['++'], _p58._1, '/'))));
};
var _user$project$Indexer$dotToHyphen = function (string) {
	return A2(
		_elm_lang$core$String$map,
		function (ch) {
			return _elm_lang$core$Native_Utils.eq(
				ch,
				_elm_lang$core$Native_Utils.chr('.')) ? _elm_lang$core$Native_Utils.chr('-') : ch;
		},
		string);
};
var _user$project$Indexer$isPackageSourcePath = function (sourcePath) {
	return A2(_elm_lang$core$String$startsWith, _user$project$Indexer$packageDocsPrefix, sourcePath);
};
var _user$project$Indexer$isProjectSourcePath = function (sourcePath) {
	return !_user$project$Indexer$isPackageSourcePath(sourcePath);
};
var _user$project$Indexer$formatSourcePath = F2(
	function (_p59, valueName) {
		var _p60 = _p59;
		var _p61 = _p60.sourcePath;
		var anchor = _elm_lang$core$Native_Utils.eq(valueName, '') ? '' : A2(_elm_lang$core$Basics_ops['++'], '#', valueName);
		return _user$project$Indexer$isPackageSourcePath(_p61) ? A2(
			_elm_lang$core$Basics_ops['++'],
			_p61,
			A2(
				_elm_lang$core$Basics_ops['++'],
				_user$project$Indexer$dotToHyphen(_p60.name),
				anchor)) : _p61;
	});
var _user$project$Indexer$nameToHints = F5(
	function (moduleDocs, _p63, activeFilePath, kind, _p62) {
		var _p64 = _p63;
		var _p65 = _p62;
		var _p67 = _p65._0.name;
		var moduleLocalName = A3(_user$project$Indexer$getModuleLocalName, moduleDocs.name, _p64.alias, _p67);
		var hint = {
			name: _p67,
			moduleName: moduleDocs.name,
			sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, _p67),
			comment: _p65._0.comment,
			tipe: _p65._0.tipe,
			args: function () {
				var _p66 = _p65._0.args;
				if (_p66.ctor === 'Just') {
					return _p66._0;
				} else {
					return {ctor: '[]'};
				}
			}(),
			caseTipe: _elm_lang$core$Maybe$Nothing,
			cases: _p65._1,
			associativity: _p65._0.associativity,
			precedence: _p65._0.precedence,
			kind: kind,
			isImported: true
		};
		var isInActiveModule = _elm_lang$core$Native_Utils.eq(activeFilePath, hint.sourcePath);
		return isInActiveModule ? {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _p67, _1: hint},
			_1: {ctor: '[]'}
		} : (A2(_user$project$Indexer$isExposed, _p67, _p64.exposed) ? {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _p67, _1: hint},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: moduleLocalName, _1: hint},
				_1: {ctor: '[]'}
			}
		} : {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: moduleLocalName, _1: hint},
			_1: {ctor: '[]'}
		});
	});
var _user$project$Indexer$getFileContentsOfProject = F2(
	function (projectDirectory, projectFileContentsDict) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			_elm_lang$core$Dict$empty,
			A2(_elm_lang$core$Dict$get, projectDirectory, projectFileContentsDict));
	});
var _user$project$Indexer$getProjectModuleDocs = F2(
	function (projectDirectory, projectFileContentsDict) {
		return A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.moduleDocs;
			},
			_elm_lang$core$Dict$values(
				A2(_user$project$Indexer$getFileContentsOfProject, projectDirectory, projectFileContentsDict)));
	});
var _user$project$Indexer$getHintFullName = function (hint) {
	var _p68 = hint.moduleName;
	if (_p68 === '') {
		return hint.name;
	} else {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			hint.moduleName,
			A2(_elm_lang$core$Basics_ops['++'], '.', hint.name));
	}
};
var _user$project$Indexer$getTupleStringFromParts = function (parts) {
	var _p69 = _elm_lang$core$List$length(parts);
	switch (_p69) {
		case 0:
			return '()';
		case 1:
			return _elm_lang$core$String$concat(parts);
		default:
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'( ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(_elm_lang$core$String$join, ', ', parts),
					' )'));
	}
};
var _user$project$Indexer$argSeparatorRegex = _elm_lang$core$Regex$regex('\\s+|\\(|\\)|\\.|,|-|>');
var _user$project$Indexer$tipeToVar = function (tipeString) {
	return _user$project$Helper$decapitalize(
		_elm_lang$core$String$concat(
			_elm_lang$core$List$reverse(
				A3(_elm_lang$core$Regex$split, _elm_lang$core$Regex$All, _user$project$Indexer$argSeparatorRegex, tipeString))));
};
var _user$project$Indexer$getTipeCaseAlignedArgTipes = F3(
	function (tipeArgs, tipeAnnotationArgs, tipeCaseArgs) {
		var tipeArgsDict = _elm_lang$core$Dict$fromList(
			A3(
				_elm_lang$core$List$map2,
				F2(
					function (v0, v1) {
						return {ctor: '_Tuple2', _0: v0, _1: v1};
					}),
				tipeArgs,
				tipeAnnotationArgs));
		return A2(
			_elm_lang$core$List$map,
			function (argTipe) {
				var _p70 = A2(_elm_lang$core$Dict$get, argTipe, tipeArgsDict);
				if (_p70.ctor === 'Just') {
					return _p70._0;
				} else {
					return argTipe;
				}
			},
			tipeCaseArgs);
	});
var _user$project$Indexer$typeConstructorToNameAndArgs = function (tipeString) {
	var tipeParts = _user$project$Indexer$getArgsParts(tipeString);
	var tipeName = A2(
		_elm_lang$core$Maybe$withDefault,
		'',
		_elm_lang$core$List$head(tipeParts));
	var tipeArgs = A2(
		_elm_lang$core$Maybe$withDefault,
		{ctor: '[]'},
		_elm_lang$core$List$tail(tipeParts));
	return {ctor: '_Tuple2', _0: tipeName, _1: tipeArgs};
};
var _user$project$Indexer$formatDecoderEncoderFunctionBody = function (str) {
	return A2(
		_elm_lang$core$String$join,
		'\n',
		A2(
			_elm_lang$core$List$indexedMap,
			F2(
				function (index, line) {
					return _elm_lang$core$Native_Utils.eq(index, 0) ? line : A2(
						_elm_lang$core$Basics_ops['++'],
						_user$project$Helper$indent(1),
						line);
				}),
			A2(
				_elm_lang$core$List$filter,
				function (line) {
					return !_elm_lang$core$Native_Utils.eq(
						_elm_lang$core$String$trim(line),
						'');
				},
				A2(
					_elm_lang$core$String$split,
					'\n',
					_user$project$Indexer$unencloseParentheses(str)))));
};
var _user$project$Indexer$superTipes = {
	ctor: '::',
	_0: 'number',
	_1: {
		ctor: '::',
		_0: 'appendable',
		_1: {
			ctor: '::',
			_0: 'comparable',
			_1: {ctor: '[]'}
		}
	}
};
var _user$project$Indexer$isTypeClass = function (tipeString) {
	return A2(_elm_lang$core$List$member, tipeString, _user$project$Indexer$superTipes);
};
var _user$project$Indexer$primitiveTipes = A2(
	_elm_lang$core$Basics_ops['++'],
	_user$project$Indexer$superTipes,
	{
		ctor: '::',
		_0: 'Int',
		_1: {
			ctor: '::',
			_0: 'Float',
			_1: {
				ctor: '::',
				_0: 'Bool',
				_1: {
					ctor: '::',
					_0: 'String',
					_1: {ctor: '[]'}
				}
			}
		}
	});
var _user$project$Indexer$isPrimitiveTipe = function (tipeString) {
	return A2(_elm_lang$core$List$member, tipeString, _user$project$Indexer$primitiveTipes);
};
var _user$project$Indexer$getSuggestionsForImport = F5(
	function (partial, isFiltered, maybeActiveFile, projectFileContentsDict, projectPackageDocs) {
		var _p71 = maybeActiveFile;
		if (_p71.ctor === 'Just') {
			var suggestions = A2(
				_elm_lang$core$List$map,
				function (_p72) {
					var _p73 = _p72;
					var _p75 = _p73.sourcePath;
					var _p74 = _p73.name;
					return {
						name: _p74,
						comment: _p73.comment,
						sourcePath: _user$project$Indexer$isPackageSourcePath(_p75) ? A2(
							_elm_lang$core$Basics_ops['++'],
							_p75,
							_user$project$Indexer$dotToHyphen(_p74)) : ''
					};
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(_user$project$Indexer$getProjectModuleDocs, _p71._0.projectDirectory, projectFileContentsDict),
					projectPackageDocs));
			return isFiltered ? A2(
				_elm_lang$core$List$sortBy,
				function (_) {
					return _.name;
				},
				A2(
					_elm_lang$core$List$filter,
					function (_p76) {
						var _p77 = _p76;
						return A2(_elm_lang$core$String$startsWith, partial, _p77.name);
					},
					suggestions)) : suggestions;
		} else {
			return {ctor: '[]'};
		}
	});
var _user$project$Indexer$sortHintsByName = _elm_lang$core$List$sortBy(
	function (_) {
		return _.name;
	});
var _user$project$Indexer$compressTipeRegex = _elm_lang$core$Regex$regex('\\s*(->|:|,)\\s*|(\\{|\\()\\s*|\\s*(\\}|\\))');
var _user$project$Indexer$compressTipeString = A3(
	_elm_lang$core$Regex$replace,
	_elm_lang$core$Regex$All,
	_user$project$Indexer$compressTipeRegex,
	function (_p78) {
		var _p79 = _p78;
		return _elm_lang$core$String$trim(_p79.match);
	});
var _user$project$Indexer$filterHintsFunction = F5(
	function (isRegex, isTypeSignature, testString, name, fieldValue) {
		var startsWithName = A2(_elm_lang$core$String$startsWith, testString, name);
		if ((isRegex && A2(_elm_lang$core$String$startsWith, '/', testString)) || (isTypeSignature && A2(_elm_lang$core$String$startsWith, ':', testString))) {
			var formattedFieldValue = isTypeSignature ? _user$project$Indexer$compressTipeString(fieldValue) : fieldValue;
			var strippedTestString = A2(_elm_lang$core$String$dropLeft, 1, testString);
			var _p80 = function () {
				if (isTypeSignature) {
					var _p81 = function () {
						var _p82 = A2(_elm_lang$core$String$split, '__', strippedTestString);
						if (((_p82.ctor === '::') && (_p82._1.ctor === '::')) && (_p82._1._1.ctor === '[]')) {
							return {
								ctor: '_Tuple2',
								_0: _p82._1._0,
								_1: _elm_lang$core$Maybe$Just(_p82._0)
							};
						} else {
							return {ctor: '_Tuple2', _0: strippedTestString, _1: _elm_lang$core$Maybe$Nothing};
						}
					}();
					var testString1 = _p81._0;
					var maybeTestString2 = _p81._1;
					return {
						ctor: '_Tuple2',
						_0: _user$project$Indexer$compressTipeString(
							A4(
								_elm_lang$core$Regex$replace,
								_elm_lang$core$Regex$All,
								_elm_lang$core$Regex$regex('_'),
								function (_p83) {
									return ' ';
								},
								testString1)),
						_1: maybeTestString2
					};
				} else {
					return {ctor: '_Tuple2', _0: strippedTestString, _1: _elm_lang$core$Maybe$Nothing};
				}
			}();
			var fieldValueExpression = _p80._0;
			var nameExpression = _p80._1;
			return _elm_lang$core$Native_Utils.eq(fieldValueExpression, '') ? startsWithName : (startsWithName || (A2(
				_elm_lang$core$Regex$contains,
				_elm_lang$core$Regex$regex(fieldValueExpression),
				formattedFieldValue) && (_elm_lang$core$Native_Utils.eq(nameExpression, _elm_lang$core$Maybe$Nothing) || A2(
				_elm_lang$core$Regex$contains,
				_elm_lang$core$Regex$regex(
					A2(_elm_lang$core$Maybe$withDefault, '', nameExpression)),
				name))));
		} else {
			return startsWithName;
		}
	});
var _user$project$Indexer$filterTypeIncompatibleHints = F4(
	function (partial, isFiltered, isRegex, hints) {
		return _elm_lang$core$Native_Utils.eq(partial, '') ? {ctor: '[]'} : ((isFiltered || isRegex) ? A2(
			_elm_lang$core$List$filter,
			function (_p84) {
				var _p85 = _p84;
				var _p86 = _p85.name;
				return A5(_user$project$Indexer$filterHintsFunction, isRegex, false, partial, _p86, _p86);
			},
			hints) : hints);
	});
var _user$project$Indexer$filterHintsByPartial = F6(
	function (partial, maybeInferredTipe, isFiltered, isRegex, isTypeSignature, hints) {
		if (isFiltered || (isRegex || isTypeSignature)) {
			var filter = _elm_lang$core$List$filter(
				function (hint) {
					var fieldValue = isTypeSignature ? hint.tipe : hint.name;
					return A5(_user$project$Indexer$filterHintsFunction, isRegex, isTypeSignature, partial, hint.name, fieldValue);
				});
			var _p87 = maybeInferredTipe;
			if (_p87.ctor === 'Just') {
				return _elm_lang$core$Native_Utils.eq(partial, '') ? hints : filter(hints);
			} else {
				return filter(hints);
			}
		} else {
			return hints;
		}
	});
var _user$project$Indexer$areMatchingTypesRecur = F5(
	function (annotation1, annotation2, typeVariables1, typeVariables2, nextAnnotations) {
		return {ctor: '_Tuple3', _0: false, _1: _elm_lang$core$Dict$empty, _2: _elm_lang$core$Dict$empty};
	});
var _user$project$Indexer$parseTipeString = function (tipeString) {
	var _p88 = A2(
		_Bogdanp$elm_ast$Ast$parseStatement,
		_elm_lang$core$Dict$empty,
		A2(_elm_lang$core$Basics_ops['++'], 'x : ', tipeString));
	if (((((_p88.ctor === 'Ok') && (_p88._0.ctor === '_Tuple3')) && (_p88._0._0.ctor === '_Tuple0')) && (_p88._0._2.ctor === 'FunctionTypeDeclaration')) && (_p88._0._2._0 === 'x')) {
		return _elm_lang$core$Maybe$Just(_p88._0._2._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _user$project$Indexer$areMatchingTypes = F2(
	function (tipeString1, tipeString2) {
		var _p89 = {
			ctor: '_Tuple2',
			_0: _user$project$Indexer$parseTipeString(tipeString1),
			_1: _user$project$Indexer$parseTipeString(tipeString2)
		};
		if (_p89._0.ctor === 'Nothing') {
			return false;
		} else {
			if (_p89._1.ctor === 'Nothing') {
				return false;
			} else {
				var _p90 = A5(
					_user$project$Indexer$areMatchingTypesRecur,
					_p89._0._0,
					_p89._1._0,
					_elm_lang$core$Dict$empty,
					_elm_lang$core$Dict$empty,
					{ctor: '[]'});
				var result = _p90._0;
				var typeVariables1 = _p90._1;
				var typeVariables2 = _p90._2;
				return result;
			}
		}
	});
var _user$project$Indexer$isTupleString = function (tipeString) {
	if (_elm_lang$core$Native_Utils.eq(tipeString, '()')) {
		return true;
	} else {
		if (A2(_elm_lang$core$String$startsWith, '(', tipeString) && A2(_elm_lang$core$String$endsWith, ')', tipeString)) {
			var _p91 = _user$project$Indexer$parseTipeString(tipeString);
			if ((_p91.ctor === 'Just') && (_p91._0.ctor === 'TypeTuple')) {
				var _p92 = _p91._0._0;
				if ((_p92.ctor === '::') && (_p92._1.ctor === '[]')) {
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
};
var _user$project$Indexer$isFunctionTipe = function (tipeString) {
	var tipe = _user$project$Indexer$isTupleString(tipeString) ? A2(
		_elm_lang$core$Maybe$withDefault,
		'',
		_elm_lang$core$List$head(
			_user$project$Indexer$getTupleParts(tipeString))) : tipeString;
	return (!_elm_lang$core$Native_Utils.eq(tipe, '')) && ((!_user$project$Indexer$isRecordString(tipe)) && ((!_user$project$Indexer$isTupleString(tipe)) && (A2(_elm_lang$core$String$contains, '->', tipe) && _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$List$length(
			_user$project$Indexer$getArgsParts(tipe)),
		1))));
};
var _user$project$Indexer$getFunctionArgNameRecur = F2(
	function (argString, argNameCounters) {
		var updatePartNameAndArgNameCounters = F2(
			function (partName2, argNameCounters2) {
				var _p93 = A2(_elm_lang$core$Dict$get, partName2, argNameCounters2);
				if (_p93.ctor === 'Just') {
					var _p95 = _p93._0;
					return {
						ctor: '_Tuple2',
						_0: A2(
							_elm_lang$core$Basics_ops['++'],
							partName2,
							_elm_lang$core$Basics$toString(_p95 + 1)),
						_1: A3(
							_elm_lang$core$Dict$update,
							partName2,
							function (_p94) {
								return _elm_lang$core$Maybe$Just(_p95 + 1);
							},
							argNameCounters2)
					};
				} else {
					return {
						ctor: '_Tuple2',
						_0: partName2,
						_1: A3(_elm_lang$core$Dict$insert, partName2, 1, argNameCounters2)
					};
				}
			});
		if (_user$project$Indexer$isRecordString(argString)) {
			return A2(updatePartNameAndArgNameCounters, 'record', argNameCounters);
		} else {
			if (_user$project$Indexer$isTupleString(argString)) {
				var _p96 = A3(
					_elm_lang$core$List$foldl,
					F2(
						function (part, _p97) {
							var _p98 = _p97;
							var _p99 = A2(_user$project$Indexer$getFunctionArgNameRecur, part, _p98._1);
							var partName = _p99._0;
							var updateArgNameCounters2 = _p99._1;
							return {
								ctor: '_Tuple2',
								_0: A2(
									_elm_lang$core$Basics_ops['++'],
									_p98._0,
									{
										ctor: '::',
										_0: partName,
										_1: {ctor: '[]'}
									}),
								_1: updateArgNameCounters2
							};
						}),
					{
						ctor: '_Tuple2',
						_0: {ctor: '[]'},
						_1: argNameCounters
					},
					_user$project$Indexer$getTupleParts(argString));
				var partNames = _p96._0;
				var updateArgNameCounters = _p96._1;
				return {
					ctor: '_Tuple2',
					_0: _user$project$Indexer$getTupleStringFromParts(partNames),
					_1: updateArgNameCounters
				};
			} else {
				if (_user$project$Indexer$isFunctionTipe(argString)) {
					return A2(updatePartNameAndArgNameCounters, 'function', argNameCounters);
				} else {
					return A2(
						updatePartNameAndArgNameCounters,
						_user$project$Indexer$tipeToVar(argString),
						argNameCounters);
				}
			}
		}
	});
var _user$project$Indexer$getDefaultArgNames = function (args) {
	var _p100 = A3(
		_elm_lang$core$List$foldl,
		F2(
			function (part, _p101) {
				var _p102 = _p101;
				var _p103 = A2(_user$project$Indexer$getFunctionArgNameRecur, part, _p102._1);
				var partName = _p103._0;
				var updatedArgNameCounters = _p103._1;
				return {
					ctor: '_Tuple2',
					_0: A2(
						_elm_lang$core$Basics_ops['++'],
						_p102._0,
						{
							ctor: '::',
							_0: partName,
							_1: {ctor: '[]'}
						}),
					_1: updatedArgNameCounters
				};
			}),
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: _elm_lang$core$Dict$empty
		},
		args);
	var argNames = _p100._0;
	return argNames;
};
var _user$project$Indexer$getTipeParts = function (tipeString) {
	var _p104 = tipeString;
	if (_p104 === '') {
		return {ctor: '[]'};
	} else {
		var _p105 = _p104;
		var tipe = _user$project$Indexer$isFunctionTipe(_p105) ? _user$project$Indexer$unencloseParentheses(_p105) : _p105;
		return A4(
			_user$project$Indexer$getTipePartsRecur,
			tipe,
			'',
			{ctor: '[]'},
			{ctor: '_Tuple2', _0: 0, _1: 0});
	}
};
var _user$project$Indexer$lastParameterTipe = function (tipeString) {
	var parts = _user$project$Indexer$getTipeParts(tipeString);
	var _p106 = _elm_lang$core$List$tail(parts);
	if (_p106.ctor === 'Just') {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			'',
			_user$project$Helper$last(
				_user$project$Helper$dropLast(parts)));
	} else {
		return '';
	}
};
var _user$project$Indexer$getParameterTipes = function (tipeString) {
	return _user$project$Helper$dropLast(
		_user$project$Indexer$getTipeParts(tipeString));
};
var _user$project$Indexer$getReturnTipe = function (tipeString) {
	return A2(
		_elm_lang$core$Maybe$withDefault,
		'',
		_user$project$Helper$last(
			_user$project$Indexer$getTipeParts(tipeString)));
};
var _user$project$Indexer$isEncoderTipe = function (tipeString) {
	return (_elm_lang$core$Native_Utils.eq(
		_user$project$Indexer$getLastName(
			_user$project$Indexer$getReturnTipe(tipeString)),
		'Value') && _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$List$length(
			_user$project$Indexer$getParameterTipes(tipeString)),
		1)) ? true : false;
};
var _user$project$Indexer$isComparableTipe = function (tipeString) {
	return false;
};
var _user$project$Indexer$isAppendableTipe = function (tipeString) {
	return A2(
		_elm_lang$core$List$member,
		_elm_lang$core$List$head(
			_user$project$Indexer$getArgsParts(tipeString)),
		{
			ctor: '::',
			_0: _elm_lang$core$Maybe$Just('appendable'),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Maybe$Just('String'),
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Maybe$Just('List'),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Indexer$isNumberTipe = function (tipeString) {
	return A2(
		_elm_lang$core$List$member,
		tipeString,
		{
			ctor: '::',
			_0: 'Int',
			_1: {
				ctor: '::',
				_0: 'Float',
				_1: {
					ctor: '::',
					_0: 'number',
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Indexer$isTipeVariable = function (tipeString) {
	return !_user$project$Helper$isCapitalized(tipeString);
};
var _user$project$Indexer$areTipesCompatibleRecur = F2(
	function (tipe1, tipe2) {
		areTipesCompatibleRecur:
		while (true) {
			if (_elm_lang$core$Native_Utils.eq(tipe1, tipe2)) {
				return true;
			} else {
				if (_elm_lang$core$Native_Utils.eq(tipe1, '') || _elm_lang$core$Native_Utils.eq(tipe2, '')) {
					return false;
				} else {
					var parts2 = _user$project$Indexer$getArgsParts(tipe2);
					var numParts2 = _elm_lang$core$List$length(parts2);
					var parts1 = _user$project$Indexer$getArgsParts(tipe1);
					var numParts1 = _elm_lang$core$List$length(parts1);
					if ((_user$project$Indexer$isFunctionTipe(tipe1) && (!_user$project$Indexer$isFunctionTipe(tipe2))) || (_user$project$Indexer$isFunctionTipe(tipe2) && (!_user$project$Indexer$isFunctionTipe(tipe1)))) {
						return false;
					} else {
						if (_elm_lang$core$Native_Utils.eq(numParts1, 1) && _elm_lang$core$Native_Utils.eq(numParts2, 1)) {
							return (_user$project$Indexer$isTipeVariable(tipe1) && _user$project$Indexer$isTipeVariable(tipe2)) || ((_user$project$Helper$isCapitalized(tipe1) && (_user$project$Indexer$isTipeVariable(tipe2) && (!_user$project$Indexer$isTypeClass(tipe2)))) || ((_user$project$Indexer$isNumberTipe(tipe1) && _elm_lang$core$Native_Utils.eq(tipe2, 'number')) || ((_user$project$Indexer$isAppendableTipe(tipe1) && _elm_lang$core$Native_Utils.eq(tipe2, 'appendable')) || (_user$project$Indexer$isComparableTipe(tipe1) && _elm_lang$core$Native_Utils.eq(tipe2, 'comparable')))));
						} else {
							if (_elm_lang$core$Native_Utils.eq(numParts2, 1) && (_user$project$Indexer$isTipeVariable(tipe2) && (!_user$project$Indexer$isTypeClass(tipe2)))) {
								return true;
							} else {
								var _p107 = {
									ctor: '_Tuple2',
									_0: _elm_lang$core$List$head(parts1),
									_1: _elm_lang$core$List$head(parts2)
								};
								if (((_p107.ctor === '_Tuple2') && (_p107._0.ctor === 'Just')) && (_p107._1.ctor === 'Just')) {
									if (_elm_lang$core$Native_Utils.eq(_p107._0._0, _p107._1._0)) {
										var _v91 = A2(
											_elm_lang$core$String$join,
											'',
											A2(
												_elm_lang$core$Maybe$withDefault,
												{ctor: '[]'},
												_elm_lang$core$List$tail(parts1))),
											_v92 = A2(
											_elm_lang$core$String$join,
											'',
											A2(
												_elm_lang$core$Maybe$withDefault,
												{ctor: '[]'},
												_elm_lang$core$List$tail(parts2)));
										tipe1 = _v91;
										tipe2 = _v92;
										continue areTipesCompatibleRecur;
									} else {
										return false;
									}
								} else {
									return false;
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$Indexer$partitionByTipe = F3(
	function (tipeString, preceedingToken, hint) {
		var returnTipe2 = _user$project$Indexer$getReturnTipe(hint.tipe);
		var returnTipe1 = _user$project$Indexer$getReturnTipe(tipeString);
		return (_elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$List$length(
				_user$project$Indexer$getTipeParts(tipeString)),
			_elm_lang$core$List$length(
				_user$project$Indexer$getTipeParts(hint.tipe))) < 1) && ((A2(_user$project$Indexer$areTipesCompatibleRecur, returnTipe1, returnTipe2) || A2(_user$project$Indexer$areTipesCompatibleRecur, returnTipe2, returnTipe1)) && function () {
			var _p108 = preceedingToken;
			if (_p108.ctor === 'Just') {
				var _p109 = _p108._0;
				if (_p109 === '|>') {
					var parameterTipe2 = _user$project$Indexer$lastParameterTipe(hint.tipe);
					var parameterTipe1 = _user$project$Indexer$lastParameterTipe(tipeString);
					return A2(_user$project$Indexer$areTipesCompatibleRecur, parameterTipe1, parameterTipe2) || A2(_user$project$Indexer$areTipesCompatibleRecur, parameterTipe2, parameterTipe1);
				} else {
					return true;
				}
			} else {
				return true;
			}
		}());
	});
var _user$project$Indexer$getTipeDistance = F2(
	function (tipe1, tipe2) {
		if (_elm_lang$core$Native_Utils.eq(tipe1, tipe2)) {
			return 0;
		} else {
			var parts2 = _user$project$Indexer$getArgsParts(tipe2);
			var numParts2 = _elm_lang$core$List$length(parts2);
			var parts1 = _user$project$Indexer$getArgsParts(tipe1);
			var numParts1 = _elm_lang$core$List$length(parts1);
			var genericTipePenalty = (_elm_lang$core$Native_Utils.eq(numParts2, 1) && (_user$project$Indexer$isTipeVariable(tipe2) && (!_user$project$Indexer$isTypeClass(tipe2)))) ? numParts1 : 0;
			return (_elm_lang$core$Native_Utils.eq(numParts1, numParts2) ? _elm_lang$core$List$sum(
				A3(
					_elm_lang$core$List$map2,
					F2(
						function (part1, part2) {
							return _elm_lang$core$Native_Utils.eq(part1, part2) ? 0 : 1;
						}),
					parts1,
					parts2)) : A2(_elm_lang$core$Basics$max, numParts1, numParts2)) + genericTipePenalty;
		}
	});
var _user$project$Indexer$sortHintsByScore = F3(
	function (tipeString, preceedingToken, hints) {
		return A2(
			_elm_lang$core$List$concatMap,
			function (group) {
				return _user$project$Indexer$sortHintsByName(
					A2(
						_elm_lang$core$List$map,
						function (_) {
							return _.hint;
						},
						group));
			},
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$second,
				A2(
					_elm_lang$core$List$sortWith,
					F2(
						function (a, b) {
							return A2(
								_elm_lang$core$Basics$compare,
								_elm_lang$core$Tuple$first(a),
								_elm_lang$core$Tuple$first(b));
						}),
					_elm_lang$core$Dict$toList(
						A2(
							_elm_community$dict_extra$Dict_Extra$groupBy,
							function (_) {
								return _.distance;
							},
							A2(
								_elm_lang$core$List$map,
								function (hint) {
									return {
										hint: hint,
										distance: A2(
											_user$project$Indexer$getTipeDistance,
											_user$project$Indexer$getReturnTipe(tipeString),
											_user$project$Indexer$getReturnTipe(hint.tipe)) + function () {
											var _p110 = preceedingToken;
											if (_p110.ctor === 'Just') {
												var _p111 = _p110._0;
												if (_p111 === '|>') {
													return A2(
														_user$project$Indexer$getTipeDistance,
														_user$project$Indexer$lastParameterTipe(tipeString),
														_user$project$Indexer$lastParameterTipe(hint.tipe));
												} else {
													return 0;
												}
											} else {
												return 0;
											}
										}()
									};
								},
								hints))))));
	});
var _user$project$Indexer$getHintsForToken = F2(
	function (maybeToken, tokens) {
		var _p112 = maybeToken;
		if (_p112.ctor === 'Just') {
			return A2(
				_elm_lang$core$Maybe$withDefault,
				{ctor: '[]'},
				A2(_elm_lang$core$Dict$get, _p112._0, tokens));
		} else {
			return {ctor: '[]'};
		}
	});
var _user$project$Indexer$getImportersForToken = F6(
	function (token, isCursorAtLastPartOfToken, maybeActiveFile, tokens, activeFileContents, projectFileContentsDict) {
		var _p113 = maybeActiveFile;
		if (_p113.ctor === 'Just') {
			var isImportAlias = A2(
				_elm_lang$core$List$member,
				token,
				A2(
					_elm_lang$core$List$filterMap,
					function (_) {
						return _.alias;
					},
					_elm_lang$core$Dict$values(activeFileContents.imports)));
			if (isImportAlias) {
				return {
					ctor: '::',
					_0: {
						ctor: '_Tuple4',
						_0: activeFileContents.moduleDocs.sourcePath,
						_1: true,
						_2: true,
						_3: {
							ctor: '::',
							_0: token,
							_1: {ctor: '[]'}
						}
					},
					_1: {ctor: '[]'}
				};
			} else {
				var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p113._0.projectDirectory, projectFileContentsDict);
				var hints = A2(
					_user$project$Indexer$getHintsForToken,
					_elm_lang$core$Maybe$Just(token),
					tokens);
				return A2(
					_elm_lang$core$List$concatMap,
					function (_p114) {
						var _p115 = _p114;
						var _p121 = _p115.moduleDocs;
						var _p120 = _p115.imports;
						var getSourcePathAndLocalNames = function (hint) {
							var isHintAModule = function (hint) {
								return _elm_lang$core$Native_Utils.eq(hint.moduleName, '') && _user$project$Helper$isCapitalized(hint.name);
							};
							var isHintThisModule = isHintAModule(hint) && _elm_lang$core$Native_Utils.eq(hint.name, _p121.name);
							var isHintAnImport = isHintAModule(hint) && (!_elm_lang$core$Native_Utils.eq(
								A2(_elm_lang$core$Dict$get, token, _p120),
								_elm_lang$core$Maybe$Nothing));
							if (isHintThisModule) {
								return _elm_lang$core$Maybe$Just(
									{
										ctor: '_Tuple4',
										_0: _p121.sourcePath,
										_1: true,
										_2: false,
										_3: {
											ctor: '::',
											_0: token,
											_1: {ctor: '[]'}
										}
									});
							} else {
								if (isHintAnImport) {
									return _elm_lang$core$Maybe$Just(
										{
											ctor: '_Tuple4',
											_0: _p121.sourcePath,
											_1: true,
											_2: false,
											_3: {
												ctor: '::',
												_0: hint.name,
												_1: {ctor: '[]'}
											}
										});
								} else {
									var _p116 = A2(_elm_lang$core$Dict$get, hint.moduleName, _p120);
									if (_p116.ctor === 'Just') {
										var _p119 = _p116._0.alias;
										var localNames = function () {
											var _p117 = {ctor: '_Tuple2', _0: _p119, _1: _p116._0.exposed};
											switch (_p117._1.ctor) {
												case 'None':
													if (_p117._0.ctor === 'Nothing') {
														return {
															ctor: '::',
															_0: A2(
																_elm_lang$core$Basics_ops['++'],
																hint.moduleName,
																A2(_elm_lang$core$Basics_ops['++'], '.', hint.name)),
															_1: {ctor: '[]'}
														};
													} else {
														return {
															ctor: '::',
															_0: A2(
																_elm_lang$core$Basics_ops['++'],
																_p117._0._0,
																A2(_elm_lang$core$Basics_ops['++'], '.', hint.name)),
															_1: {ctor: '[]'}
														};
													}
												case 'All':
													return {
														ctor: '::',
														_0: hint.name,
														_1: {
															ctor: '::',
															_0: A3(_user$project$Indexer$getModuleLocalName, hint.moduleName, _p119, hint.name),
															_1: {ctor: '[]'}
														}
													};
												default:
													return A2(_elm_lang$core$Set$member, hint.name, _p117._1._0) ? {
														ctor: '::',
														_0: hint.name,
														_1: {
															ctor: '::',
															_0: A3(_user$project$Indexer$getModuleLocalName, hint.moduleName, _p119, hint.name),
															_1: {ctor: '[]'}
														}
													} : {
														ctor: '::',
														_0: A3(_user$project$Indexer$getModuleLocalName, hint.moduleName, _p119, hint.name),
														_1: {ctor: '[]'}
													};
											}
										}();
										var names = _elm_lang$core$Set$toList(
											_elm_lang$core$Set$fromList(localNames));
										var _p118 = names;
										if (_p118.ctor === '[]') {
											return _elm_lang$core$Maybe$Nothing;
										} else {
											return _elm_lang$core$Maybe$Just(
												{ctor: '_Tuple4', _0: _p121.sourcePath, _1: false, _2: false, _3: names});
										}
									} else {
										var isHintInThisModule = _elm_lang$core$Native_Utils.eq(hint.moduleName, _p121.name);
										return isHintInThisModule ? _elm_lang$core$Maybe$Just(
											{
												ctor: '_Tuple4',
												_0: _p121.sourcePath,
												_1: false,
												_2: false,
												_3: {
													ctor: '::',
													_0: hint.name,
													_1: {ctor: '[]'}
												}
											}) : _elm_lang$core$Maybe$Nothing;
									}
								}
							}
						};
						return A2(_elm_lang$core$List$filterMap, getSourcePathAndLocalNames, hints);
					},
					_elm_lang$core$Dict$values(fileContentsDict));
			}
		} else {
			return {ctor: '[]'};
		}
	});
var _user$project$Indexer$constructCaseOf = F2(
	function (token, activeFileTokens) {
		var _p122 = _elm_lang$core$List$head(
			A2(
				_user$project$Indexer$getHintsForToken,
				_elm_lang$core$Maybe$Just(token),
				activeFileTokens));
		if (_p122.ctor === 'Just') {
			var _p130 = _p122._0;
			var _p123 = function () {
				var _p124 = _user$project$Indexer$typeConstructorToNameAndArgs(_p130.tipe);
				var name = _p124._0;
				var args = _p124._1;
				var _p125 = _elm_lang$core$List$head(args);
				if (_p125.ctor === 'Just') {
					if (_p125._0 === '->') {
						return {
							ctor: '_Tuple2',
							_0: _user$project$Indexer$getReturnTipe(_p130.tipe),
							_1: {ctor: '[]'}
						};
					} else {
						return {ctor: '_Tuple2', _0: name, _1: args};
					}
				} else {
					return {ctor: '_Tuple2', _0: name, _1: args};
				}
			}();
			var tokenTipeName = _p123._0;
			var tokenTipeArgs = _p123._1;
			var _p126 = function () {
				var _p127 = tokenTipeName;
				if (_p127 === 'Bool') {
					return {
						ctor: '_Tuple2',
						_0: {
							ctor: '::',
							_0: {
								name: 'True',
								args: {ctor: '[]'}
							},
							_1: {
								ctor: '::',
								_0: {
									name: 'False',
									args: {ctor: '[]'}
								},
								_1: {ctor: '[]'}
							}
						},
						_1: {ctor: '[]'}
					};
				} else {
					if (A2(
						_elm_lang$core$List$member,
						tokenTipeName,
						{
							ctor: '::',
							_0: 'Int',
							_1: {
								ctor: '::',
								_0: 'Float',
								_1: {
									ctor: '::',
									_0: 'number',
									_1: {ctor: '[]'}
								}
							}
						})) {
						return {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: {
									name: '|',
									args: {ctor: '[]'}
								},
								_1: {
									ctor: '::',
									_0: {
										name: '_',
										args: {ctor: '[]'}
									},
									_1: {ctor: '[]'}
								}
							},
							_1: {ctor: '[]'}
						};
					} else {
						if (A2(
							_elm_lang$core$List$member,
							tokenTipeName,
							{
								ctor: '::',
								_0: 'String',
								_1: {ctor: '[]'}
							})) {
							return {
								ctor: '_Tuple2',
								_0: {
									ctor: '::',
									_0: {
										name: '\"|\"',
										args: {ctor: '[]'}
									},
									_1: {
										ctor: '::',
										_0: {
											name: '_',
											args: {ctor: '[]'}
										},
										_1: {ctor: '[]'}
									}
								},
								_1: {ctor: '[]'}
							};
						} else {
							var _p128 = _elm_lang$core$List$head(
								A2(
									_elm_lang$core$List$filter,
									function (hint) {
										return _elm_lang$core$Native_Utils.cmp(
											_elm_lang$core$List$length(hint.cases),
											0) > 0;
									},
									A2(
										_user$project$Indexer$getHintsForToken,
										_elm_lang$core$Maybe$Just(tokenTipeName),
										activeFileTokens)));
							if (_p128.ctor === 'Just') {
								var _p129 = _p128._0;
								return {ctor: '_Tuple2', _0: _p129.cases, _1: _p129.args};
							} else {
								return {
									ctor: '_Tuple2',
									_0: {ctor: '[]'},
									_1: {ctor: '[]'}
								};
							}
						}
					}
				}
			}();
			var tipeCases = _p126._0;
			var tipeArgs = _p126._1;
			return (_elm_lang$core$Native_Utils.cmp(
				_elm_lang$core$List$length(tipeCases),
				0) > 0) ? _elm_lang$core$Maybe$Just(
				A2(
					_elm_lang$core$String$join,
					'\n\n',
					A2(
						_elm_lang$core$List$map,
						function (tipeCase) {
							var alignedArgs = A3(_user$project$Indexer$getTipeCaseAlignedArgTipes, tipeArgs, tokenTipeArgs, tipeCase.args);
							return A2(
								_elm_lang$core$Basics_ops['++'],
								tipeCase.name,
								A2(
									_elm_lang$core$Basics_ops['++'],
									(_elm_lang$core$Native_Utils.cmp(
										_elm_lang$core$List$length(alignedArgs),
										0) > 0) ? ' ' : '',
									A2(
										_elm_lang$core$Basics_ops['++'],
										A2(
											_elm_lang$core$String$join,
											' ',
											_user$project$Indexer$getDefaultArgNames(alignedArgs)),
										' ->\n    |')));
						},
						tipeCases))) : _elm_lang$core$Maybe$Nothing;
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _user$project$Indexer$getProjectPackageDocs = F3(
	function (maybeActiveFile, projectDependencies, packageDocs) {
		var _p131 = maybeActiveFile;
		if (_p131.ctor === 'Just') {
			var _p132 = A2(_elm_lang$core$Dict$get, _p131._0.projectDirectory, projectDependencies);
			if (_p132.ctor === 'Just') {
				var packageUris = A2(_elm_lang$core$List$map, _user$project$Indexer$toPackageUri, _p132._0);
				return A2(
					_elm_lang$core$List$filter,
					function (moduleDocs) {
						return A2(_elm_lang$core$List$member, moduleDocs.sourcePath, packageUris);
					},
					packageDocs);
			} else {
				return {ctor: '[]'};
			}
		} else {
			return {ctor: '[]'};
		}
	});
var _user$project$Indexer$truncateModuleComment = function (moduleDocs) {
	var truncatedComment = function () {
		var _p133 = _elm_lang$core$List$head(
			A2(_elm_lang$core$String$split, '\n\n', moduleDocs.comment));
		if (_p133.ctor === 'Just') {
			return _p133._0;
		} else {
			return '';
		}
	}();
	return _elm_lang$core$Native_Utils.update(
		moduleDocs,
		{comment: truncatedComment});
};
var _user$project$Indexer$updateFileContents = F4(
	function (filePath, projectDirectory, fileContents, projectFileContentsDict) {
		var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, projectDirectory, projectFileContentsDict);
		var updatedFileContentsDict = A3(
			_elm_lang$core$Dict$update,
			filePath,
			function (_p134) {
				return _elm_lang$core$Maybe$Just(fileContents);
			},
			fileContentsDict);
		return A3(
			_elm_lang$core$Dict$update,
			projectDirectory,
			function (_p135) {
				return _elm_lang$core$Maybe$Just(updatedFileContentsDict);
			},
			projectFileContentsDict);
	});
var _user$project$Indexer$emptyModuleDocs = {
	sourcePath: '',
	name: '',
	values: {
		aliases: {ctor: '[]'},
		tipes: {ctor: '[]'},
		values: {ctor: '[]'}
	},
	comment: ''
};
var _user$project$Indexer$emptyConfig = {showAliasesOfType: false};
var _user$project$Indexer$emptyModel = {
	packageDocs: {ctor: '[]'},
	projectFileContentsDict: _elm_lang$core$Dict$empty,
	activeFile: _elm_lang$core$Maybe$Nothing,
	activeFileTokens: _elm_lang$core$Dict$empty,
	activeToken: _elm_lang$core$Maybe$Nothing,
	activeTokenHints: {ctor: '[]'},
	activeTopLevel: _elm_lang$core$Maybe$Nothing,
	projectDependencies: _elm_lang$core$Dict$empty,
	config: _user$project$Indexer$emptyConfig,
	hintsCache: _elm_lang$core$Maybe$Nothing
};
var _user$project$Indexer$init = {ctor: '_Tuple2', _0: _user$project$Indexer$emptyModel, _1: _elm_lang$core$Platform_Cmd$none};
var _user$project$Indexer$activeTokenChangedSub = _elm_lang$core$Native_Platform.incomingPort(
	'activeTokenChangedSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return _elm_lang$core$Json_Decode$succeed(
						{ctor: '_Tuple2', _0: x0, _1: x1});
				},
				A2(
					_elm_lang$core$Json_Decode$index,
					1,
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(
			_elm_lang$core$Json_Decode$index,
			0,
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
						_1: {ctor: '[]'}
					}
				}))));
var _user$project$Indexer$activeFileChangedSub = _elm_lang$core$Native_Platform.incomingPort(
	'activeFileChangedSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (x2) {
							return _elm_lang$core$Json_Decode$succeed(
								{ctor: '_Tuple3', _0: x0, _1: x1, _2: x2});
						},
						A2(
							_elm_lang$core$Json_Decode$index,
							2,
							_elm_lang$core$Json_Decode$oneOf(
								{
									ctor: '::',
									_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
										_1: {ctor: '[]'}
									}
								})));
				},
				A2(
					_elm_lang$core$Json_Decode$index,
					1,
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(
			_elm_lang$core$Json_Decode$index,
			0,
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$Json_Decode$map,
							_elm_lang$core$Maybe$Just,
							A2(
								_elm_lang$core$Json_Decode$andThen,
								function (filePath) {
									return A2(
										_elm_lang$core$Json_Decode$andThen,
										function (projectDirectory) {
											return _elm_lang$core$Json_Decode$succeed(
												{filePath: filePath, projectDirectory: projectDirectory});
										},
										A2(_elm_lang$core$Json_Decode$field, 'projectDirectory', _elm_lang$core$Json_Decode$string));
								},
								A2(_elm_lang$core$Json_Decode$field, 'filePath', _elm_lang$core$Json_Decode$string))),
						_1: {ctor: '[]'}
					}
				}))));
var _user$project$Indexer$fileContentsChangedSub = _elm_lang$core$Native_Platform.incomingPort(
	'fileContentsChangedSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (x2) {
							return A2(
								_elm_lang$core$Json_Decode$andThen,
								function (x3) {
									return _elm_lang$core$Json_Decode$succeed(
										{ctor: '_Tuple4', _0: x0, _1: x1, _2: x2, _3: x3});
								},
								A2(
									_elm_lang$core$Json_Decode$index,
									3,
									_elm_lang$core$Json_Decode$list(
										A2(
											_elm_lang$core$Json_Decode$andThen,
											function (name) {
												return A2(
													_elm_lang$core$Json_Decode$andThen,
													function (alias) {
														return A2(
															_elm_lang$core$Json_Decode$andThen,
															function (exposed) {
																return _elm_lang$core$Json_Decode$succeed(
																	{name: name, alias: alias, exposed: exposed});
															},
															A2(
																_elm_lang$core$Json_Decode$field,
																'exposed',
																_elm_lang$core$Json_Decode$oneOf(
																	{
																		ctor: '::',
																		_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_elm_lang$core$Json_Decode$map,
																				_elm_lang$core$Maybe$Just,
																				_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)),
																			_1: {ctor: '[]'}
																		}
																	})));
													},
													A2(
														_elm_lang$core$Json_Decode$field,
														'alias',
														_elm_lang$core$Json_Decode$oneOf(
															{
																ctor: '::',
																_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
																_1: {
																	ctor: '::',
																	_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
																	_1: {ctor: '[]'}
																}
															})));
											},
											A2(_elm_lang$core$Json_Decode$field, 'name', _elm_lang$core$Json_Decode$string)))));
						},
						A2(
							_elm_lang$core$Json_Decode$index,
							2,
							A2(
								_elm_lang$core$Json_Decode$andThen,
								function (sourcePath) {
									return A2(
										_elm_lang$core$Json_Decode$andThen,
										function (name) {
											return A2(
												_elm_lang$core$Json_Decode$andThen,
												function (values) {
													return A2(
														_elm_lang$core$Json_Decode$andThen,
														function (comment) {
															return _elm_lang$core$Json_Decode$succeed(
																{sourcePath: sourcePath, name: name, values: values, comment: comment});
														},
														A2(_elm_lang$core$Json_Decode$field, 'comment', _elm_lang$core$Json_Decode$string));
												},
												A2(
													_elm_lang$core$Json_Decode$field,
													'values',
													A2(
														_elm_lang$core$Json_Decode$andThen,
														function (aliases) {
															return A2(
																_elm_lang$core$Json_Decode$andThen,
																function (tipes) {
																	return A2(
																		_elm_lang$core$Json_Decode$andThen,
																		function (values) {
																			return _elm_lang$core$Json_Decode$succeed(
																				{aliases: aliases, tipes: tipes, values: values});
																		},
																		A2(
																			_elm_lang$core$Json_Decode$field,
																			'values',
																			_elm_lang$core$Json_Decode$list(
																				A2(
																					_elm_lang$core$Json_Decode$andThen,
																					function (name) {
																						return A2(
																							_elm_lang$core$Json_Decode$andThen,
																							function (comment) {
																								return A2(
																									_elm_lang$core$Json_Decode$andThen,
																									function (tipe) {
																										return A2(
																											_elm_lang$core$Json_Decode$andThen,
																											function (args) {
																												return A2(
																													_elm_lang$core$Json_Decode$andThen,
																													function (associativity) {
																														return A2(
																															_elm_lang$core$Json_Decode$andThen,
																															function (precedence) {
																																return _elm_lang$core$Json_Decode$succeed(
																																	{name: name, comment: comment, tipe: tipe, args: args, associativity: associativity, precedence: precedence});
																															},
																															A2(
																																_elm_lang$core$Json_Decode$field,
																																'precedence',
																																_elm_lang$core$Json_Decode$oneOf(
																																	{
																																		ctor: '::',
																																		_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
																																		_1: {
																																			ctor: '::',
																																			_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$int),
																																			_1: {ctor: '[]'}
																																		}
																																	})));
																													},
																													A2(
																														_elm_lang$core$Json_Decode$field,
																														'associativity',
																														_elm_lang$core$Json_Decode$oneOf(
																															{
																																ctor: '::',
																																_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
																																_1: {
																																	ctor: '::',
																																	_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
																																	_1: {ctor: '[]'}
																																}
																															})));
																											},
																											A2(
																												_elm_lang$core$Json_Decode$field,
																												'args',
																												_elm_lang$core$Json_Decode$oneOf(
																													{
																														ctor: '::',
																														_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
																														_1: {
																															ctor: '::',
																															_0: A2(
																																_elm_lang$core$Json_Decode$map,
																																_elm_lang$core$Maybe$Just,
																																_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)),
																															_1: {ctor: '[]'}
																														}
																													})));
																									},
																									A2(_elm_lang$core$Json_Decode$field, 'tipe', _elm_lang$core$Json_Decode$string));
																							},
																							A2(_elm_lang$core$Json_Decode$field, 'comment', _elm_lang$core$Json_Decode$string));
																					},
																					A2(_elm_lang$core$Json_Decode$field, 'name', _elm_lang$core$Json_Decode$string)))));
																},
																A2(
																	_elm_lang$core$Json_Decode$field,
																	'tipes',
																	_elm_lang$core$Json_Decode$list(
																		A2(
																			_elm_lang$core$Json_Decode$andThen,
																			function (name) {
																				return A2(
																					_elm_lang$core$Json_Decode$andThen,
																					function (comment) {
																						return A2(
																							_elm_lang$core$Json_Decode$andThen,
																							function (tipe) {
																								return A2(
																									_elm_lang$core$Json_Decode$andThen,
																									function (args) {
																										return A2(
																											_elm_lang$core$Json_Decode$andThen,
																											function (cases) {
																												return _elm_lang$core$Json_Decode$succeed(
																													{name: name, comment: comment, tipe: tipe, args: args, cases: cases});
																											},
																											A2(
																												_elm_lang$core$Json_Decode$field,
																												'cases',
																												_elm_lang$core$Json_Decode$list(
																													A2(
																														_elm_lang$core$Json_Decode$andThen,
																														function (name) {
																															return A2(
																																_elm_lang$core$Json_Decode$andThen,
																																function (args) {
																																	return _elm_lang$core$Json_Decode$succeed(
																																		{name: name, args: args});
																																},
																																A2(
																																	_elm_lang$core$Json_Decode$field,
																																	'args',
																																	_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)));
																														},
																														A2(_elm_lang$core$Json_Decode$field, 'name', _elm_lang$core$Json_Decode$string)))));
																									},
																									A2(
																										_elm_lang$core$Json_Decode$field,
																										'args',
																										_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)));
																							},
																							A2(_elm_lang$core$Json_Decode$field, 'tipe', _elm_lang$core$Json_Decode$string));
																					},
																					A2(_elm_lang$core$Json_Decode$field, 'comment', _elm_lang$core$Json_Decode$string));
																			},
																			A2(_elm_lang$core$Json_Decode$field, 'name', _elm_lang$core$Json_Decode$string)))));
														},
														A2(
															_elm_lang$core$Json_Decode$field,
															'aliases',
															_elm_lang$core$Json_Decode$list(
																A2(
																	_elm_lang$core$Json_Decode$andThen,
																	function (name) {
																		return A2(
																			_elm_lang$core$Json_Decode$andThen,
																			function (comment) {
																				return A2(
																					_elm_lang$core$Json_Decode$andThen,
																					function (tipe) {
																						return A2(
																							_elm_lang$core$Json_Decode$andThen,
																							function (args) {
																								return A2(
																									_elm_lang$core$Json_Decode$andThen,
																									function (associativity) {
																										return A2(
																											_elm_lang$core$Json_Decode$andThen,
																											function (precedence) {
																												return _elm_lang$core$Json_Decode$succeed(
																													{name: name, comment: comment, tipe: tipe, args: args, associativity: associativity, precedence: precedence});
																											},
																											A2(
																												_elm_lang$core$Json_Decode$field,
																												'precedence',
																												_elm_lang$core$Json_Decode$oneOf(
																													{
																														ctor: '::',
																														_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
																														_1: {
																															ctor: '::',
																															_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$int),
																															_1: {ctor: '[]'}
																														}
																													})));
																									},
																									A2(
																										_elm_lang$core$Json_Decode$field,
																										'associativity',
																										_elm_lang$core$Json_Decode$oneOf(
																											{
																												ctor: '::',
																												_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
																												_1: {
																													ctor: '::',
																													_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
																													_1: {ctor: '[]'}
																												}
																											})));
																							},
																							A2(
																								_elm_lang$core$Json_Decode$field,
																								'args',
																								_elm_lang$core$Json_Decode$oneOf(
																									{
																										ctor: '::',
																										_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
																										_1: {
																											ctor: '::',
																											_0: A2(
																												_elm_lang$core$Json_Decode$map,
																												_elm_lang$core$Maybe$Just,
																												_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)),
																											_1: {ctor: '[]'}
																										}
																									})));
																					},
																					A2(_elm_lang$core$Json_Decode$field, 'tipe', _elm_lang$core$Json_Decode$string));
																			},
																			A2(_elm_lang$core$Json_Decode$field, 'comment', _elm_lang$core$Json_Decode$string));
																	},
																	A2(_elm_lang$core$Json_Decode$field, 'name', _elm_lang$core$Json_Decode$string)))))));
										},
										A2(_elm_lang$core$Json_Decode$field, 'name', _elm_lang$core$Json_Decode$string));
								},
								A2(_elm_lang$core$Json_Decode$field, 'sourcePath', _elm_lang$core$Json_Decode$string))));
				},
				A2(_elm_lang$core$Json_Decode$index, 1, _elm_lang$core$Json_Decode$string));
		},
		A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string)));
var _user$project$Indexer$fileContentsRemovedSub = _elm_lang$core$Native_Platform.incomingPort(
	'fileContentsRemovedSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return _elm_lang$core$Json_Decode$succeed(
						{ctor: '_Tuple2', _0: x0, _1: x1});
				},
				A2(_elm_lang$core$Json_Decode$index, 1, _elm_lang$core$Json_Decode$string));
		},
		A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string)));
var _user$project$Indexer$projectDependenciesChangedSub = _elm_lang$core$Native_Platform.incomingPort(
	'projectDependenciesChangedSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return _elm_lang$core$Json_Decode$succeed(
						{ctor: '_Tuple2', _0: x0, _1: x1});
				},
				A2(
					_elm_lang$core$Json_Decode$index,
					1,
					_elm_lang$core$Json_Decode$list(
						A2(
							_elm_lang$core$Json_Decode$andThen,
							function (x0) {
								return A2(
									_elm_lang$core$Json_Decode$andThen,
									function (x1) {
										return _elm_lang$core$Json_Decode$succeed(
											{ctor: '_Tuple2', _0: x0, _1: x1});
									},
									A2(_elm_lang$core$Json_Decode$index, 1, _elm_lang$core$Json_Decode$string));
							},
							A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string)))));
		},
		A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string)));
var _user$project$Indexer$downloadMissingPackageDocsSub = _elm_lang$core$Native_Platform.incomingPort(
	'downloadMissingPackageDocsSub',
	_elm_lang$core$Json_Decode$list(
		A2(
			_elm_lang$core$Json_Decode$andThen,
			function (x0) {
				return A2(
					_elm_lang$core$Json_Decode$andThen,
					function (x1) {
						return _elm_lang$core$Json_Decode$succeed(
							{ctor: '_Tuple2', _0: x0, _1: x1});
					},
					A2(_elm_lang$core$Json_Decode$index, 1, _elm_lang$core$Json_Decode$string));
			},
			A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string))));
var _user$project$Indexer$docsReadSub = _elm_lang$core$Native_Platform.incomingPort(
	'docsReadSub',
	_elm_lang$core$Json_Decode$list(
		A2(
			_elm_lang$core$Json_Decode$andThen,
			function (x0) {
				return A2(
					_elm_lang$core$Json_Decode$andThen,
					function (x1) {
						return _elm_lang$core$Json_Decode$succeed(
							{ctor: '_Tuple2', _0: x0, _1: x1});
					},
					A2(_elm_lang$core$Json_Decode$index, 1, _elm_lang$core$Json_Decode$string));
			},
			A2(
				_elm_lang$core$Json_Decode$index,
				0,
				A2(
					_elm_lang$core$Json_Decode$andThen,
					function (x0) {
						return A2(
							_elm_lang$core$Json_Decode$andThen,
							function (x1) {
								return _elm_lang$core$Json_Decode$succeed(
									{ctor: '_Tuple2', _0: x0, _1: x1});
							},
							A2(_elm_lang$core$Json_Decode$index, 1, _elm_lang$core$Json_Decode$string));
					},
					A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string))))));
var _user$project$Indexer$goToDefinitionSub = _elm_lang$core$Native_Platform.incomingPort(
	'goToDefinitionSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return _elm_lang$core$Json_Decode$succeed(
						{ctor: '_Tuple2', _0: x0, _1: x1});
				},
				A2(
					_elm_lang$core$Json_Decode$index,
					1,
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(
			_elm_lang$core$Json_Decode$index,
			0,
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
						_1: {ctor: '[]'}
					}
				}))));
var _user$project$Indexer$askCanGoToDefinitionSub = _elm_lang$core$Native_Platform.incomingPort(
	'askCanGoToDefinitionSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return _elm_lang$core$Json_Decode$succeed(
						{ctor: '_Tuple2', _0: x0, _1: x1});
				},
				A2(_elm_lang$core$Json_Decode$index, 1, _elm_lang$core$Json_Decode$string));
		},
		A2(
			_elm_lang$core$Json_Decode$index,
			0,
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
						_1: {ctor: '[]'}
					}
				}))));
var _user$project$Indexer$showGoToSymbolViewSub = _elm_lang$core$Native_Platform.incomingPort(
	'showGoToSymbolViewSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return _elm_lang$core$Json_Decode$succeed(
						{ctor: '_Tuple2', _0: x0, _1: x1});
				},
				A2(
					_elm_lang$core$Json_Decode$index,
					1,
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(
			_elm_lang$core$Json_Decode$index,
			0,
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
						_1: {ctor: '[]'}
					}
				}))));
var _user$project$Indexer$getHintsForPartialSub = _elm_lang$core$Native_Platform.incomingPort(
	'getHintsForPartialSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (x2) {
							return A2(
								_elm_lang$core$Json_Decode$andThen,
								function (x3) {
									return A2(
										_elm_lang$core$Json_Decode$andThen,
										function (x4) {
											return A2(
												_elm_lang$core$Json_Decode$andThen,
												function (x5) {
													return A2(
														_elm_lang$core$Json_Decode$andThen,
														function (x6) {
															return _elm_lang$core$Json_Decode$succeed(
																{ctor: '_Tuple7', _0: x0, _1: x1, _2: x2, _3: x3, _4: x4, _5: x5, _6: x6});
														},
														A2(_elm_lang$core$Json_Decode$index, 6, _elm_lang$core$Json_Decode$bool));
												},
												A2(_elm_lang$core$Json_Decode$index, 5, _elm_lang$core$Json_Decode$bool));
										},
										A2(_elm_lang$core$Json_Decode$index, 4, _elm_lang$core$Json_Decode$bool));
								},
								A2(_elm_lang$core$Json_Decode$index, 3, _elm_lang$core$Json_Decode$bool));
						},
						A2(
							_elm_lang$core$Json_Decode$index,
							2,
							_elm_lang$core$Json_Decode$oneOf(
								{
									ctor: '::',
									_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
										_1: {ctor: '[]'}
									}
								})));
				},
				A2(
					_elm_lang$core$Json_Decode$index,
					1,
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string)));
var _user$project$Indexer$getSuggestionsForImportSub = _elm_lang$core$Native_Platform.incomingPort(
	'getSuggestionsForImportSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return _elm_lang$core$Json_Decode$succeed(
						{ctor: '_Tuple2', _0: x0, _1: x1});
				},
				A2(_elm_lang$core$Json_Decode$index, 1, _elm_lang$core$Json_Decode$bool));
		},
		A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string)));
var _user$project$Indexer$getImportersForTokenSub = _elm_lang$core$Native_Platform.incomingPort(
	'getImportersForTokenSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (x2) {
							return _elm_lang$core$Json_Decode$succeed(
								{ctor: '_Tuple3', _0: x0, _1: x1, _2: x2});
						},
						A2(
							_elm_lang$core$Json_Decode$index,
							2,
							_elm_lang$core$Json_Decode$oneOf(
								{
									ctor: '::',
									_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$bool),
										_1: {ctor: '[]'}
									}
								})));
				},
				A2(
					_elm_lang$core$Json_Decode$index,
					1,
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(
			_elm_lang$core$Json_Decode$index,
			0,
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
						_1: {ctor: '[]'}
					}
				}))));
var _user$project$Indexer$showAddImportViewSub = _elm_lang$core$Native_Platform.incomingPort(
	'showAddImportViewSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return _elm_lang$core$Json_Decode$succeed(
						{ctor: '_Tuple2', _0: x0, _1: x1});
				},
				A2(
					_elm_lang$core$Json_Decode$index,
					1,
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string)));
var _user$project$Indexer$addImportSub = _elm_lang$core$Native_Platform.incomingPort(
	'addImportSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (x2) {
							return A2(
								_elm_lang$core$Json_Decode$andThen,
								function (x3) {
									return _elm_lang$core$Json_Decode$succeed(
										{ctor: '_Tuple4', _0: x0, _1: x1, _2: x2, _3: x3});
								},
								A2(
									_elm_lang$core$Json_Decode$index,
									3,
									_elm_lang$core$Json_Decode$oneOf(
										{
											ctor: '::',
											_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
											_1: {
												ctor: '::',
												_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
												_1: {ctor: '[]'}
											}
										})));
						},
						A2(_elm_lang$core$Json_Decode$index, 2, _elm_lang$core$Json_Decode$string));
				},
				A2(_elm_lang$core$Json_Decode$index, 1, _elm_lang$core$Json_Decode$string));
		},
		A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string)));
var _user$project$Indexer$constructFromTypeAnnotationSub = _elm_lang$core$Native_Platform.incomingPort('constructFromTypeAnnotationSub', _elm_lang$core$Json_Decode$string);
var _user$project$Indexer$constructCaseOfSub = _elm_lang$core$Native_Platform.incomingPort('constructCaseOfSub', _elm_lang$core$Json_Decode$string);
var _user$project$Indexer$constructDefaultValueForTypeSub = _elm_lang$core$Native_Platform.incomingPort('constructDefaultValueForTypeSub', _elm_lang$core$Json_Decode$string);
var _user$project$Indexer$constructDefaultArgumentsSub = _elm_lang$core$Native_Platform.incomingPort('constructDefaultArgumentsSub', _elm_lang$core$Json_Decode$string);
var _user$project$Indexer$inferenceEnteredSub = _elm_lang$core$Native_Platform.incomingPort(
	'inferenceEnteredSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (name) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (tipe) {
					return _elm_lang$core$Json_Decode$succeed(
						{name: name, tipe: tipe});
				},
				A2(_elm_lang$core$Json_Decode$field, 'tipe', _elm_lang$core$Json_Decode$string));
		},
		A2(_elm_lang$core$Json_Decode$field, 'name', _elm_lang$core$Json_Decode$string)));
var _user$project$Indexer$configChangedSub = _elm_lang$core$Native_Platform.incomingPort(
	'configChangedSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (showAliasesOfType) {
			return _elm_lang$core$Json_Decode$succeed(
				{showAliasesOfType: showAliasesOfType});
		},
		A2(_elm_lang$core$Json_Decode$field, 'showAliasesOfType', _elm_lang$core$Json_Decode$bool)));
var _user$project$Indexer$getAliasesOfTypeSub = _elm_lang$core$Native_Platform.incomingPort('getAliasesOfTypeSub', _elm_lang$core$Json_Decode$string);
var _user$project$Indexer$clearLocalHintsCacheSub = _elm_lang$core$Native_Platform.incomingPort(
	'clearLocalHintsCacheSub',
	_elm_lang$core$Json_Decode$null(
		{ctor: '_Tuple0'}));
var _user$project$Indexer$getTokenInfoSub = _elm_lang$core$Native_Platform.incomingPort(
	'getTokenInfoSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (x2) {
							return A2(
								_elm_lang$core$Json_Decode$andThen,
								function (x3) {
									return _elm_lang$core$Json_Decode$succeed(
										{ctor: '_Tuple4', _0: x0, _1: x1, _2: x2, _3: x3});
								},
								A2(
									_elm_lang$core$Json_Decode$index,
									3,
									_elm_lang$core$Json_Decode$oneOf(
										{
											ctor: '::',
											_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
											_1: {
												ctor: '::',
												_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
												_1: {ctor: '[]'}
											}
										})));
						},
						A2(
							_elm_lang$core$Json_Decode$index,
							2,
							_elm_lang$core$Json_Decode$oneOf(
								{
									ctor: '::',
									_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
										_1: {ctor: '[]'}
									}
								})));
				},
				A2(
					_elm_lang$core$Json_Decode$index,
					1,
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(
			_elm_lang$core$Json_Decode$index,
			0,
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
						_1: {ctor: '[]'}
					}
				}))));
var _user$project$Indexer$getFunctionsMatchingTypeSub = _elm_lang$core$Native_Platform.incomingPort(
	'getFunctionsMatchingTypeSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x0) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x1) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (x2) {
							return _elm_lang$core$Json_Decode$succeed(
								{ctor: '_Tuple3', _0: x0, _1: x1, _2: x2});
						},
						A2(
							_elm_lang$core$Json_Decode$index,
							2,
							_elm_lang$core$Json_Decode$oneOf(
								{
									ctor: '::',
									_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
										_1: {ctor: '[]'}
									}
								})));
				},
				A2(
					_elm_lang$core$Json_Decode$index,
					1,
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string)));
var _user$project$Indexer$docsReadCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'docsReadCmd',
	function (v) {
		return null;
	});
var _user$project$Indexer$docsDownloadedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'docsDownloadedCmd',
	function (v) {
		return _elm_lang$core$Native_List.toArray(v).map(
			function (v) {
				return [
					[v._0._0, v._0._1],
					v._1
				];
			});
	});
var _user$project$Indexer$downloadDocsFailedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'downloadDocsFailedCmd',
	function (v) {
		return v;
	});
var _user$project$Indexer$dependenciesNotFoundCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'dependenciesNotFoundCmd',
	function (v) {
		return [
			_elm_lang$core$Native_List.toArray(v._0).map(
			function (v) {
				return v;
			}),
			_elm_lang$core$Native_List.toArray(v._1).map(
			function (v) {
				return [v._0, v._1];
			})
		];
	});
var _user$project$Indexer$goToDefinitionCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'goToDefinitionCmd',
	function (v) {
		return [
			(v._0.ctor === 'Nothing') ? null : {filePath: v._0._0.filePath, projectDirectory: v._0._0.projectDirectory},
			{
			fullName: v._1.fullName,
			sourcePath: v._1.sourcePath,
			tipe: v._1.tipe,
			caseTipe: (v._1.caseTipe.ctor === 'Nothing') ? null : v._1.caseTipe._0,
			kind: v._1.kind
		}
		];
	});
var _user$project$Indexer$canGoToDefinitionRepliedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'canGoToDefinitionRepliedCmd',
	function (v) {
		return [v._0, v._1];
	});
var _user$project$Indexer$showGoToSymbolViewCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'showGoToSymbolViewCmd',
	function (v) {
		return [
			(v._0.ctor === 'Nothing') ? null : v._0._0,
			(v._1.ctor === 'Nothing') ? null : {filePath: v._1._0.filePath, projectDirectory: v._1._0.projectDirectory},
			_elm_lang$core$Native_List.toArray(v._2).map(
			function (v) {
				return {
					fullName: v.fullName,
					sourcePath: v.sourcePath,
					tipe: v.tipe,
					caseTipe: (v.caseTipe.ctor === 'Nothing') ? null : v.caseTipe._0,
					kind: v.kind
				};
			})
		];
	});
var _user$project$Indexer$activeFileChangedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'activeFileChangedCmd',
	function (v) {
		return (v.ctor === 'Nothing') ? null : {filePath: v._0.filePath, projectDirectory: v._0.projectDirectory};
	});
var _user$project$Indexer$activeTokenHintsChangedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'activeTokenHintsChangedCmd',
	function (v) {
		return [
			v._0,
			_elm_lang$core$Native_List.toArray(v._1).map(
			function (v) {
				return {
					name: v.name,
					moduleName: v.moduleName,
					sourcePath: v.sourcePath,
					comment: v.comment,
					tipe: v.tipe,
					args: _elm_lang$core$Native_List.toArray(v.args).map(
						function (v) {
							return v;
						}),
					caseTipe: (v.caseTipe.ctor === 'Nothing') ? null : v.caseTipe._0,
					cases: _elm_lang$core$Native_List.toArray(v.cases).map(
						function (v) {
							return {
								name: v.name,
								args: _elm_lang$core$Native_List.toArray(v.args).map(
									function (v) {
										return v;
									})
							};
						}),
					associativity: (v.associativity.ctor === 'Nothing') ? null : v.associativity._0,
					precedence: (v.precedence.ctor === 'Nothing') ? null : v.precedence._0,
					kind: v.kind,
					isImported: v.isImported,
					aliasesOfTipe: _elm_lang$core$Native_List.toArray(v.aliasesOfTipe).map(
						function (v) {
							return v;
						})
				};
			})
		];
	});
var _user$project$Indexer$readingPackageDocsCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'readingPackageDocsCmd',
	function (v) {
		return null;
	});
var _user$project$Indexer$downloadingPackageDocsCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'downloadingPackageDocsCmd',
	function (v) {
		return null;
	});
var _user$project$Indexer$readPackageDocsCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'readPackageDocsCmd',
	function (v) {
		return _elm_lang$core$Native_List.toArray(v).map(
			function (v) {
				return [v._0, v._1];
			});
	});
var _user$project$Indexer$doUpdateProjectDependencies = F3(
	function (projectDirectory, dependencies, model) {
		var existingPackages = A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.sourcePath;
			},
			model.packageDocs);
		var missingDependencies = A2(
			_elm_lang$core$List$filter,
			function (dependency) {
				return !A2(
					_elm_lang$core$List$member,
					_user$project$Indexer$toPackageUri(dependency),
					existingPackages);
			},
			dependencies);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					projectDependencies: A3(
						_elm_lang$core$Dict$update,
						projectDirectory,
						function (_p136) {
							return _elm_lang$core$Maybe$Just(dependencies);
						},
						model.projectDependencies),
					hintsCache: _elm_lang$core$Maybe$Nothing
				}),
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: _user$project$Indexer$readingPackageDocsCmd(
						{ctor: '_Tuple0'}),
					_1: {
						ctor: '::',
						_0: _user$project$Indexer$readPackageDocsCmd(missingDependencies),
						_1: {ctor: '[]'}
					}
				})
		};
	});
var _user$project$Indexer$hintsForPartialReceivedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'hintsForPartialReceivedCmd',
	function (v) {
		return [
			v._0,
			_elm_lang$core$Native_List.toArray(v._1).map(
			function (v) {
				return {
					name: v.name,
					moduleName: v.moduleName,
					sourcePath: v.sourcePath,
					comment: v.comment,
					tipe: v.tipe,
					args: _elm_lang$core$Native_List.toArray(v.args).map(
						function (v) {
							return v;
						}),
					caseTipe: (v.caseTipe.ctor === 'Nothing') ? null : v.caseTipe._0,
					cases: _elm_lang$core$Native_List.toArray(v.cases).map(
						function (v) {
							return {
								name: v.name,
								args: _elm_lang$core$Native_List.toArray(v.args).map(
									function (v) {
										return v;
									})
							};
						}),
					associativity: (v.associativity.ctor === 'Nothing') ? null : v.associativity._0,
					precedence: (v.precedence.ctor === 'Nothing') ? null : v.precedence._0,
					kind: v.kind,
					isImported: v.isImported,
					aliasesOfTipe: _elm_lang$core$Native_List.toArray(v.aliasesOfTipe).map(
						function (v) {
							return v;
						})
				};
			})
		];
	});
var _user$project$Indexer$suggestionsForImportReceivedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'suggestionsForImportReceivedCmd',
	function (v) {
		return [
			v._0,
			_elm_lang$core$Native_List.toArray(v._1).map(
			function (v) {
				return {name: v.name, comment: v.comment, sourcePath: v.sourcePath};
			})
		];
	});
var _user$project$Indexer$doGetSuggestionsForImport = F3(
	function (partial, isFiltered, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$suggestionsForImportReceivedCmd(
				{
					ctor: '_Tuple2',
					_0: partial,
					_1: A5(
						_user$project$Indexer$getSuggestionsForImport,
						partial,
						isFiltered,
						model.activeFile,
						model.projectFileContentsDict,
						A3(_user$project$Indexer$getProjectPackageDocs, model.activeFile, model.projectDependencies, model.packageDocs))
				})
		};
	});
var _user$project$Indexer$importersForTokenReceivedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'importersForTokenReceivedCmd',
	function (v) {
		return [
			v._0,
			v._1,
			v._2,
			v._3,
			_elm_lang$core$Native_List.toArray(v._4).map(
			function (v) {
				return [
					v._0,
					v._1,
					v._2,
					_elm_lang$core$Native_List.toArray(v._3).map(
					function (v) {
						return v;
					})
				];
			})
		];
	});
var _user$project$Indexer$showAddImportViewCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'showAddImportViewCmd',
	function (v) {
		return [
			(v._0.ctor === 'Nothing') ? null : v._0._0,
			(v._1.ctor === 'Nothing') ? null : {filePath: v._1._0.filePath, projectDirectory: v._1._0.projectDirectory},
			_elm_lang$core$Native_List.toArray(v._2).map(
			function (v) {
				return [
					v._0,
					(v._1.ctor === 'Nothing') ? null : v._1._0
				];
			})
		];
	});
var _user$project$Indexer$updateImportsCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'updateImportsCmd',
	function (v) {
		return [v._0, v._1];
	});
var _user$project$Indexer$fromTypeAnnotationConstructedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'fromTypeAnnotationConstructedCmd',
	function (v) {
		return v;
	});
var _user$project$Indexer$caseOfConstructedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'caseOfConstructedCmd',
	function (v) {
		return (v.ctor === 'Nothing') ? null : v._0;
	});
var _user$project$Indexer$doConstructCaseOf = F2(
	function (token, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$caseOfConstructedCmd(
				A2(_user$project$Indexer$constructCaseOf, token, model.activeFileTokens))
		};
	});
var _user$project$Indexer$defaultValueForTypeConstructedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'defaultValueForTypeConstructedCmd',
	function (v) {
		return (v.ctor === 'Nothing') ? null : v._0;
	});
var _user$project$Indexer$defaultArgumentsConstructedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'defaultArgumentsConstructedCmd',
	function (v) {
		return (v.ctor === 'Nothing') ? null : _elm_lang$core$Native_List.toArray(v._0).map(
			function (v) {
				return v;
			});
	});
var _user$project$Indexer$aliasesOfTypeReceivedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'aliasesOfTypeReceivedCmd',
	function (v) {
		return _elm_lang$core$Native_List.toArray(v).map(
			function (v) {
				return v;
			});
	});
var _user$project$Indexer$tokenInfoReceivedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'tokenInfoReceivedCmd',
	function (v) {
		return _elm_lang$core$Native_List.toArray(v).map(
			function (v) {
				return {
					name: v.name,
					moduleName: v.moduleName,
					sourcePath: v.sourcePath,
					comment: v.comment,
					tipe: v.tipe,
					args: _elm_lang$core$Native_List.toArray(v.args).map(
						function (v) {
							return v;
						}),
					caseTipe: (v.caseTipe.ctor === 'Nothing') ? null : v.caseTipe._0,
					cases: _elm_lang$core$Native_List.toArray(v.cases).map(
						function (v) {
							return {
								name: v.name,
								args: _elm_lang$core$Native_List.toArray(v.args).map(
									function (v) {
										return v;
									})
							};
						}),
					associativity: (v.associativity.ctor === 'Nothing') ? null : v.associativity._0,
					precedence: (v.precedence.ctor === 'Nothing') ? null : v.precedence._0,
					kind: v.kind,
					isImported: v.isImported,
					aliasesOfTipe: _elm_lang$core$Native_List.toArray(v.aliasesOfTipe).map(
						function (v) {
							return v;
						})
				};
			});
	});
var _user$project$Indexer$functionsMatchingTypeReceivedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'functionsMatchingTypeReceivedCmd',
	function (v) {
		return _elm_lang$core$Native_List.toArray(v).map(
			function (v) {
				return {
					name: v.name,
					moduleName: v.moduleName,
					sourcePath: v.sourcePath,
					comment: v.comment,
					tipe: v.tipe,
					args: _elm_lang$core$Native_List.toArray(v.args).map(
						function (v) {
							return v;
						}),
					caseTipe: (v.caseTipe.ctor === 'Nothing') ? null : v.caseTipe._0,
					cases: _elm_lang$core$Native_List.toArray(v.cases).map(
						function (v) {
							return {
								name: v.name,
								args: _elm_lang$core$Native_List.toArray(v.args).map(
									function (v) {
										return v;
									})
							};
						}),
					associativity: (v.associativity.ctor === 'Nothing') ? null : v.associativity._0,
					precedence: (v.precedence.ctor === 'Nothing') ? null : v.precedence._0,
					kind: v.kind,
					isImported: v.isImported,
					aliasesOfTipe: _elm_lang$core$Native_List.toArray(v.aliasesOfTipe).map(
						function (v) {
							return v;
						})
				};
			});
	});
var _user$project$Indexer$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return {packageDocs: a, projectFileContentsDict: b, projectDependencies: c, activeFile: d, activeFileTokens: e, activeToken: f, activeTokenHints: g, activeTopLevel: h, config: i, hintsCache: j};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Indexer$Config = function (a) {
	return {showAliasesOfType: a};
};
var _user$project$Indexer$ActiveFile = F2(
	function (a, b) {
		return {filePath: a, projectDirectory: b};
	});
var _user$project$Indexer$FileContents = F2(
	function (a, b) {
		return {moduleDocs: a, imports: b};
	});
var _user$project$Indexer$Inference = F2(
	function (a, b) {
		return {name: a, tipe: b};
	});
var _user$project$Indexer$HintsCache = F2(
	function (a, b) {
		return {external: a, local: b};
	});
var _user$project$Indexer$ExternalHints = F2(
	function (a, b) {
		return {importedHints: a, unimportedHints: b};
	});
var _user$project$Indexer$LocalHints = F2(
	function (a, b) {
		return {topLevelHints: a, variableHints: b};
	});
var _user$project$Indexer$ModuleDocs = F4(
	function (a, b, c, d) {
		return {sourcePath: a, name: b, values: c, comment: d};
	});
var _user$project$Indexer$Values = F3(
	function (a, b, c) {
		return {aliases: a, tipes: b, values: c};
	});
var _user$project$Indexer$Tipe = F5(
	function (a, b, c, d, e) {
		return {name: a, comment: b, tipe: c, args: d, cases: e};
	});
var _user$project$Indexer$TipeCase = F2(
	function (a, b) {
		return {name: a, args: b};
	});
var _user$project$Indexer$Value = F6(
	function (a, b, c, d, e, f) {
		return {name: a, comment: b, tipe: c, args: d, associativity: e, precedence: f};
	});
var _user$project$Indexer$EncodedModuleDocs = F4(
	function (a, b, c, d) {
		return {sourcePath: a, name: b, values: c, comment: d};
	});
var _user$project$Indexer$EncodedValues = F3(
	function (a, b, c) {
		return {aliases: a, tipes: b, values: c};
	});
var _user$project$Indexer$EncodedValue = F6(
	function (a, b, c, d, e, f) {
		return {name: a, comment: b, tipe: c, args: d, associativity: e, precedence: f};
	});
var _user$project$Indexer$Symbol = F5(
	function (a, b, c, d, e) {
		return {fullName: a, sourcePath: b, tipe: c, caseTipe: d, kind: e};
	});
var _user$project$Indexer$EncodedSymbol = F5(
	function (a, b, c, d, e) {
		return {fullName: a, sourcePath: b, tipe: c, caseTipe: d, kind: e};
	});
var _user$project$Indexer$Hint = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return {name: a, moduleName: b, sourcePath: c, comment: d, tipe: e, args: f, caseTipe: g, cases: h, associativity: i, precedence: j, kind: k, isImported: l};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Indexer$EncodedHint = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return {name: a, moduleName: b, sourcePath: c, comment: d, tipe: e, args: f, caseTipe: g, cases: h, associativity: i, precedence: j, kind: k, isImported: l, aliasesOfTipe: m};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Indexer$ImportSuggestion = F3(
	function (a, b, c) {
		return {name: a, comment: b, sourcePath: c};
	});
var _user$project$Indexer$RawImport = F3(
	function (a, b, c) {
		return {name: a, alias: b, exposed: c};
	});
var _user$project$Indexer$Import = F2(
	function (a, b) {
		return {alias: a, exposed: b};
	});
var _user$project$Indexer_ops = _user$project$Indexer_ops || {};
_user$project$Indexer_ops['=>'] = F2(
	function (name, exposed) {
		return {
			ctor: '_Tuple2',
			_0: name,
			_1: A2(_user$project$Indexer$Import, _elm_lang$core$Maybe$Nothing, exposed)
		};
	});
var _user$project$Indexer$GetFunctionsMatchingType = function (a) {
	return {ctor: 'GetFunctionsMatchingType', _0: a};
};
var _user$project$Indexer$GetTokenInfo = function (a) {
	return {ctor: 'GetTokenInfo', _0: a};
};
var _user$project$Indexer$ClearLocalHintsCache = {ctor: 'ClearLocalHintsCache'};
var _user$project$Indexer$GetAliasesOfType = function (a) {
	return {ctor: 'GetAliasesOfType', _0: a};
};
var _user$project$Indexer$ConfigChanged = function (a) {
	return {ctor: 'ConfigChanged', _0: a};
};
var _user$project$Indexer$InferenceEntered = function (a) {
	return {ctor: 'InferenceEntered', _0: a};
};
var _user$project$Indexer$ConstructDefaultArguments = function (a) {
	return {ctor: 'ConstructDefaultArguments', _0: a};
};
var _user$project$Indexer$ConstructDefaultValueForType = function (a) {
	return {ctor: 'ConstructDefaultValueForType', _0: a};
};
var _user$project$Indexer$ConstructCaseOf = function (a) {
	return {ctor: 'ConstructCaseOf', _0: a};
};
var _user$project$Indexer$ConstructFromTypeAnnotation = function (a) {
	return {ctor: 'ConstructFromTypeAnnotation', _0: a};
};
var _user$project$Indexer$AddImport = function (a) {
	return {ctor: 'AddImport', _0: a};
};
var _user$project$Indexer$ShowAddImportView = function (a) {
	return {ctor: 'ShowAddImportView', _0: a};
};
var _user$project$Indexer$DownloadMissingPackageDocs = function (a) {
	return {ctor: 'DownloadMissingPackageDocs', _0: a};
};
var _user$project$Indexer$GetImporterSourcePathsForToken = function (a) {
	return {ctor: 'GetImporterSourcePathsForToken', _0: a};
};
var _user$project$Indexer$GetSuggestionsForImport = function (a) {
	return {ctor: 'GetSuggestionsForImport', _0: a};
};
var _user$project$Indexer$GetHintsForPartial = function (a) {
	return {ctor: 'GetHintsForPartial', _0: a};
};
var _user$project$Indexer$ShowGoToSymbolView = function (a) {
	return {ctor: 'ShowGoToSymbolView', _0: a};
};
var _user$project$Indexer$AskCanGoToDefinition = function (a) {
	return {ctor: 'AskCanGoToDefinition', _0: a};
};
var _user$project$Indexer$GoToDefinition = function (a) {
	return {ctor: 'GoToDefinition', _0: a};
};
var _user$project$Indexer$UpdateProjectDependencies = function (a) {
	return {ctor: 'UpdateProjectDependencies', _0: a};
};
var _user$project$Indexer$RemoveFileContents = function (a) {
	return {ctor: 'RemoveFileContents', _0: a};
};
var _user$project$Indexer$UpdateFileContents = F3(
	function (a, b, c) {
		return {ctor: 'UpdateFileContents', _0: a, _1: b, _2: c};
	});
var _user$project$Indexer$UpdateActiveFile = function (a) {
	return {ctor: 'UpdateActiveFile', _0: a};
};
var _user$project$Indexer$UpdateActiveTokenHints = function (a) {
	return {ctor: 'UpdateActiveTokenHints', _0: a};
};
var _user$project$Indexer$DocsRead = function (a) {
	return {ctor: 'DocsRead', _0: a};
};
var _user$project$Indexer$MaybeDocsDownloaded = F2(
	function (a, b) {
		return {ctor: 'MaybeDocsDownloaded', _0: a, _1: b};
	});
var _user$project$Indexer$NonAssociative = {ctor: 'NonAssociative'};
var _user$project$Indexer$RightAssociative = {ctor: 'RightAssociative'};
var _user$project$Indexer$LeftAssociative = {ctor: 'LeftAssociative'};
var _user$project$Indexer$decodeAssociativity = function (maybeString) {
	var _p137 = maybeString;
	_v110_3:
	do {
		if (_p137.ctor === 'Just') {
			switch (_p137._0) {
				case 'left':
					return _elm_lang$core$Maybe$Just(_user$project$Indexer$LeftAssociative);
				case 'right':
					return _elm_lang$core$Maybe$Just(_user$project$Indexer$RightAssociative);
				case 'non':
					return _elm_lang$core$Maybe$Just(_user$project$Indexer$NonAssociative);
				default:
					break _v110_3;
			}
		} else {
			break _v110_3;
		}
	} while(false);
	return _elm_lang$core$Maybe$Nothing;
};
var _user$project$Indexer$decodeModuleDocs = function (sourcePath) {
	var args = A2(
		_elm_lang$core$Json_Decode$field,
		'args',
		_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string));
	var comment = A2(_elm_lang$core$Json_Decode$field, 'comment', _elm_lang$core$Json_Decode$string);
	var name = A2(_elm_lang$core$Json_Decode$field, 'name', _elm_lang$core$Json_Decode$string);
	var tipe = A6(
		_elm_lang$core$Json_Decode$map5,
		_user$project$Indexer$Tipe,
		name,
		comment,
		name,
		args,
		A2(
			_elm_lang$core$Json_Decode$field,
			'cases',
			_elm_lang$core$Json_Decode$list(
				A3(
					_elm_lang$core$Json_Decode$map2,
					_user$project$Indexer$TipeCase,
					A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string),
					A2(
						_elm_lang$core$Json_Decode$index,
						1,
						_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string))))));
	var value = A7(
		_elm_lang$core$Json_Decode$map6,
		_user$project$Indexer$Value,
		name,
		comment,
		A2(_elm_lang$core$Json_Decode$field, 'type', _elm_lang$core$Json_Decode$string),
		_elm_lang$core$Json_Decode$maybe(args),
		A2(
			_elm_lang$core$Json_Decode$map,
			_user$project$Indexer$decodeAssociativity,
			_elm_lang$core$Json_Decode$maybe(
				A2(_elm_lang$core$Json_Decode$field, 'associativity', _elm_lang$core$Json_Decode$string))),
		_elm_lang$core$Json_Decode$maybe(
			A2(_elm_lang$core$Json_Decode$field, 'precedence', _elm_lang$core$Json_Decode$int)));
	var values = A4(
		_elm_lang$core$Json_Decode$map3,
		_user$project$Indexer$Values,
		A2(
			_elm_lang$core$Json_Decode$field,
			'aliases',
			_elm_lang$core$Json_Decode$list(value)),
		A2(
			_elm_lang$core$Json_Decode$field,
			'types',
			_elm_lang$core$Json_Decode$list(tipe)),
		A2(
			_elm_lang$core$Json_Decode$field,
			'values',
			_elm_lang$core$Json_Decode$list(value)));
	return A4(
		_elm_lang$core$Json_Decode$map3,
		_user$project$Indexer$ModuleDocs(sourcePath),
		name,
		values,
		comment);
};
var _user$project$Indexer$downloadPackageDocs = function (dependency) {
	var packageUri = _user$project$Indexer$toPackageUri(dependency);
	var url = A2(_elm_lang$core$Basics_ops['++'], packageUri, 'documentation.json');
	return A2(
		_elm_lang$core$Task$map,
		function (jsonString) {
			return {
				ctor: '_Tuple2',
				_0: jsonString,
				_1: A2(
					_elm_lang$core$Maybe$withDefault,
					{ctor: '[]'},
					_elm_lang$core$Result$toMaybe(
						A2(
							_elm_lang$core$Json_Decode$decodeString,
							_elm_lang$core$Json_Decode$list(
								_user$project$Indexer$decodeModuleDocs(packageUri)),
							jsonString)))
			};
		},
		_elm_lang$http$Http$toTask(
			_elm_lang$http$Http$getString(url)));
};
var _user$project$Indexer$downloadPackageDocsList = function (dependencies) {
	return _user$project$Indexer$optionalTaskSequence(
		A2(_elm_lang$core$List$map, _user$project$Indexer$downloadPackageDocs, dependencies));
};
var _user$project$Indexer$doDownloadMissingPackageDocs = F2(
	function (dependencies, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: _user$project$Indexer$downloadingPackageDocsCmd(
						{ctor: '_Tuple0'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$Task$attempt,
							_user$project$Indexer$MaybeDocsDownloaded(dependencies),
							_user$project$Indexer$downloadPackageDocsList(dependencies)),
						_1: {ctor: '[]'}
					}
				})
		};
	});
var _user$project$Indexer$toModuleDocs = F2(
	function (packageUri, jsonString) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			{ctor: '[]'},
			_elm_lang$core$Result$toMaybe(
				A2(
					_elm_lang$core$Json_Decode$decodeString,
					_elm_lang$core$Json_Decode$list(
						_user$project$Indexer$decodeModuleDocs(packageUri)),
					jsonString)));
	});
var _user$project$Indexer$KindVariable = {ctor: 'KindVariable'};
var _user$project$Indexer$KindModule = {ctor: 'KindModule'};
var _user$project$Indexer$moduleToHints = F2(
	function (moduleDocs, _p138) {
		var _p139 = _p138;
		var _p140 = moduleDocs;
		var name = _p140.name;
		var comment = _p140.comment;
		var sourcePath = _p140.sourcePath;
		var hint = {
			name: name,
			moduleName: '',
			sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, ''),
			comment: comment,
			tipe: '',
			args: {ctor: '[]'},
			caseTipe: _elm_lang$core$Maybe$Nothing,
			cases: {ctor: '[]'},
			associativity: _elm_lang$core$Maybe$Nothing,
			precedence: _elm_lang$core$Maybe$Nothing,
			kind: _user$project$Indexer$KindModule,
			isImported: true
		};
		var _p141 = _p139.alias;
		if (_p141.ctor === 'Just') {
			return {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: name, _1: hint},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: _p141._0, _1: hint},
					_1: {ctor: '[]'}
				}
			};
		} else {
			return {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: name, _1: hint},
				_1: {ctor: '[]'}
			};
		}
	});
var _user$project$Indexer$KindTypeCase = {ctor: 'KindTypeCase'};
var _user$project$Indexer$unionTagsToHints = F4(
	function (moduleDocs, _p142, activeFilePath, tipe) {
		var _p143 = _p142;
		var _p144 = _p143.exposed;
		var addHints = F2(
			function (tipeCase, hints) {
				var tag = tipeCase.name;
				var hint = function () {
					var hintTipe = A2(_user$project$Indexer$getTipeCaseTypeAnnotation, tipeCase, tipe);
					return {
						name: tag,
						moduleName: moduleDocs.name,
						sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, tipe.name),
						comment: tipe.comment,
						tipe: hintTipe,
						args: tipeCase.args,
						caseTipe: _elm_lang$core$Maybe$Just(tipe.name),
						cases: {ctor: '[]'},
						associativity: _elm_lang$core$Maybe$Nothing,
						precedence: _elm_lang$core$Maybe$Nothing,
						kind: _user$project$Indexer$KindTypeCase,
						isImported: true
					};
				}();
				var isInActiveModule = _elm_lang$core$Native_Utils.eq(activeFilePath, hint.sourcePath);
				var moduleLocalName = A3(_user$project$Indexer$getModuleLocalName, moduleDocs.name, _p143.alias, tag);
				return A2(
					_elm_lang$core$Basics_ops['++'],
					hints,
					isInActiveModule ? {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: tag, _1: hint},
						_1: {ctor: '[]'}
					} : ((A2(_user$project$Indexer$isExposed, tag, _p144) || A2(_user$project$Indexer$isExposed, tipe.name, _p144)) ? {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: moduleLocalName, _1: hint},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: tag, _1: hint},
							_1: {ctor: '[]'}
						}
					} : {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: moduleLocalName, _1: hint},
						_1: {ctor: '[]'}
					}));
			});
		return A3(
			_elm_lang$core$List$foldl,
			addHints,
			{ctor: '[]'},
			tipe.cases);
	});
var _user$project$Indexer$KindType = {ctor: 'KindType'};
var _user$project$Indexer$KindTypeAlias = {ctor: 'KindTypeAlias'};
var _user$project$Indexer$normalizeTipeRecur = F3(
	function (tokens, visitedTipeAliases, tipeString) {
		normalizeTipeRecur:
		while (true) {
			if (_user$project$Indexer$isPrimitiveTipe(tipeString)) {
				return tipeString;
			} else {
				if (_user$project$Indexer$isRecordString(tipeString)) {
					var fieldsAndValues = A2(
						_elm_lang$core$String$join,
						', ',
						_elm_lang$core$Dict$values(
							A2(
								_elm_lang$core$Dict$map,
								F2(
									function (fieldName, fieldTipeString) {
										return A2(
											_elm_lang$core$Basics_ops['++'],
											fieldName,
											A2(
												_elm_lang$core$Basics_ops['++'],
												' : ',
												A3(_user$project$Indexer$normalizeTipeRecur, tokens, visitedTipeAliases, fieldTipeString)));
									}),
								_elm_lang$core$Dict$fromList(
									_user$project$Indexer$getRecordTipeParts(tipeString)))));
					return A2(
						_elm_lang$core$Basics_ops['++'],
						'{ ',
						A2(_elm_lang$core$Basics_ops['++'], fieldsAndValues, ' }'));
				} else {
					if (_user$project$Indexer$isTupleString(tipeString)) {
						var parts = A2(
							_elm_lang$core$List$map,
							function (part) {
								return A3(_user$project$Indexer$normalizeTipeRecur, tokens, visitedTipeAliases, part);
							},
							_user$project$Indexer$getTupleParts(tipeString));
						return _user$project$Indexer$getTupleStringFromParts(parts);
					} else {
						var _p145 = _elm_lang$core$List$head(
							A2(
								_user$project$Indexer$getHintsForToken,
								_elm_lang$core$Maybe$Just(tipeString),
								tokens));
						if (_p145.ctor === 'Just') {
							var _p146 = _p145._0;
							if (A2(_elm_lang$core$Set$member, _p146.tipe, visitedTipeAliases)) {
								return tipeString;
							} else {
								if (_elm_lang$core$Native_Utils.eq(_p146.kind, _user$project$Indexer$KindTypeAlias)) {
									var _v115 = tokens,
										_v116 = A2(_elm_lang$core$Set$insert, _p146.tipe, visitedTipeAliases),
										_v117 = _p146.tipe;
									tokens = _v115;
									visitedTipeAliases = _v116;
									tipeString = _v117;
									continue normalizeTipeRecur;
								} else {
									return _p146.tipe;
								}
							}
						} else {
							return tipeString;
						}
					}
				}
			}
		}
	});
var _user$project$Indexer$normalizeTipe = F2(
	function (tokens, tipeString) {
		return A3(_user$project$Indexer$normalizeTipeRecur, tokens, _elm_lang$core$Set$empty, tipeString);
	});
var _user$project$Indexer$getAliasesOfType = F3(
	function (tokens, name, tipeString) {
		if (_elm_lang$core$Native_Utils.eq(tipeString, '')) {
			return {ctor: '[]'};
		} else {
			var normalizedTipeString = A2(_user$project$Indexer$normalizeTipe, tokens, tipeString);
			return A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$List$filter,
					function (primitiveTipe) {
						return (!_elm_lang$core$Native_Utils.eq(tipeString, primitiveTipe)) && _elm_lang$core$Native_Utils.eq(normalizedTipeString, primitiveTipe);
					},
					_user$project$Indexer$primitiveTipes),
				A2(
					_elm_lang$core$List$map,
					function (_) {
						return _.name;
					},
					A2(
						_elm_lang$core$List$filter,
						function (hint) {
							var normalizedHintTipe = A2(_user$project$Indexer$normalizeTipe, tokens, hint.tipe);
							return (!_elm_lang$core$Native_Utils.eq(hint.tipe, '')) && (_elm_lang$core$Native_Utils.eq(hint.kind, _user$project$Indexer$KindTypeAlias) && ((!_elm_lang$core$Native_Utils.eq(tipeString, hint.name)) && ((!_elm_lang$core$Native_Utils.eq(name, hint.name)) && (_elm_lang$core$Native_Utils.eq(name, normalizedHintTipe) || _elm_lang$core$Native_Utils.eq(normalizedTipeString, normalizedHintTipe)))));
						},
						_elm_lang$core$List$concat(
							_elm_lang$core$Dict$values(tokens)))));
		}
	});
var _user$project$Indexer$doGetAliasesOfType = F2(
	function (token, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$aliasesOfTypeReceivedCmd(
				A3(_user$project$Indexer$getAliasesOfType, model.activeFileTokens, '', token))
		};
	});
var _user$project$Indexer$encodeHint = F3(
	function (showAliasesOfType, tokens, hint) {
		return {
			name: hint.name,
			moduleName: hint.moduleName,
			sourcePath: hint.sourcePath,
			comment: hint.comment,
			tipe: hint.tipe,
			args: hint.args,
			caseTipe: hint.caseTipe,
			cases: hint.cases,
			associativity: _user$project$Indexer$encodeAssociativity(hint.associativity),
			precedence: hint.precedence,
			kind: _user$project$Indexer$symbolKindToString(hint.kind),
			isImported: hint.isImported,
			aliasesOfTipe: showAliasesOfType ? A3(_user$project$Indexer$getAliasesOfType, tokens, hint.name, hint.tipe) : {ctor: '[]'}
		};
	});
var _user$project$Indexer$getDefaultDecoderRecur = F5(
	function (activeFileTokens, visitedTypes, decoderModuleName, maybeHintName, tipeString) {
		getDefaultDecoderRecur:
		while (true) {
			if (_elm_lang$core$Native_Utils.eq(
				_elm_lang$core$String$trim(tipeString),
				'')) {
				return '_';
			} else {
				if (_user$project$Indexer$isRecordString(tipeString)) {
					var _p147 = maybeHintName;
					if (_p147.ctor === 'Just') {
						var fieldsAndValues = _user$project$Indexer$getRecordTipeParts(tipeString);
						var numFieldAndValues = _elm_lang$core$List$length(fieldsAndValues);
						if (_elm_lang$core$Native_Utils.cmp(numFieldAndValues, 0) > 0) {
							var mapSuffix = function () {
								var _p148 = numFieldAndValues;
								if (_p148 === 1) {
									return '';
								} else {
									return _elm_lang$core$Basics$toString(_p148);
								}
							}();
							return A2(
								_elm_lang$core$Basics_ops['++'],
								A2(
									_elm_lang$core$Basics_ops['++'],
									'\n(',
									A2(
										_elm_lang$core$Basics_ops['++'],
										decoderModuleName,
										A2(
											_elm_lang$core$Basics_ops['++'],
											'map',
											A2(
												_elm_lang$core$Basics_ops['++'],
												mapSuffix,
												A2(
													_elm_lang$core$Basics_ops['++'],
													' ',
													A2(_elm_lang$core$Basics_ops['++'], _p147._0, '\n')))))),
								A2(
									_elm_lang$core$Basics_ops['++'],
									A2(
										_elm_lang$core$String$join,
										'\n',
										A2(
											_elm_lang$core$List$map,
											function (_p149) {
												var _p150 = _p149;
												return A2(
													_elm_lang$core$Basics_ops['++'],
													'(',
													A2(
														_elm_lang$core$Basics_ops['++'],
														decoderModuleName,
														A2(
															_elm_lang$core$Basics_ops['++'],
															'field \"',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_p150._0,
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	'\" ',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		A5(_user$project$Indexer$getDefaultDecoderRecur, activeFileTokens, visitedTypes, decoderModuleName, _elm_lang$core$Maybe$Nothing, _p150._1),
																		')'))))));
											},
											fieldsAndValues)),
									')'));
						} else {
							return '_';
						}
					} else {
						return '_';
					}
				} else {
					if (_user$project$Indexer$isTupleString(tipeString)) {
						var parts = _user$project$Indexer$getTupleParts(tipeString);
						return A2(
							_elm_lang$core$Basics_ops['++'],
							'\n(',
							A2(
								_elm_lang$core$Basics_ops['++'],
								A2(
									_elm_lang$core$String$join,
									'\n',
									A2(
										_elm_lang$core$List$indexedMap,
										F2(
											function (index, part) {
												return A2(
													_elm_lang$core$Basics_ops['++'],
													decoderModuleName,
													A2(
														_elm_lang$core$Basics_ops['++'],
														'index ',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_elm_lang$core$Basics$toString(index),
															A2(
																_elm_lang$core$Basics_ops['++'],
																' ',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	A5(_user$project$Indexer$getDefaultDecoderRecur, activeFileTokens, visitedTypes, decoderModuleName, _elm_lang$core$Maybe$Nothing, part),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		' |> ',
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			decoderModuleName,
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				'andThen (\\v',
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					_elm_lang$core$Basics$toString(index),
																					' ->')))))))));
											}),
										parts)),
								A2(
									_elm_lang$core$Basics_ops['++'],
									A2(
										_elm_lang$core$Basics_ops['++'],
										'\n',
										A2(
											_elm_lang$core$Basics_ops['++'],
											decoderModuleName,
											A2(
												_elm_lang$core$Basics_ops['++'],
												'succeed ( ',
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$String$join,
														', ',
														A2(
															_elm_lang$core$List$indexedMap,
															F2(
																function (index, _p151) {
																	return A2(
																		_elm_lang$core$Basics_ops['++'],
																		'v',
																		_elm_lang$core$Basics$toString(index));
																}),
															parts)),
													' )\n')))),
									A2(
										_elm_lang$core$Basics_ops['++'],
										A2(
											_elm_lang$core$String$join,
											'',
											A2(
												_elm_lang$core$List$repeat,
												_elm_lang$core$List$length(parts),
												')')),
										')'))));
					} else {
						var tipeParts = A2(
							_elm_lang$core$String$split,
							' ',
							_user$project$Indexer$unencloseParentheses(tipeString));
						var tailParts = A2(
							_elm_lang$core$Maybe$withDefault,
							{ctor: '[]'},
							_elm_lang$core$List$tail(tipeParts));
						var tailTipe = A2(_elm_lang$core$String$join, ' ', tailParts);
						var _p152 = _elm_lang$core$List$head(tipeParts);
						if (_p152.ctor === 'Just') {
							var _p153 = _p152._0;
							switch (_p153) {
								case 'number':
									return A2(_elm_lang$core$Basics_ops['++'], decoderModuleName, 'float');
								case 'Int':
									return A2(_elm_lang$core$Basics_ops['++'], decoderModuleName, 'int');
								case 'Float':
									return A2(_elm_lang$core$Basics_ops['++'], decoderModuleName, 'float');
								case 'Bool':
									return A2(_elm_lang$core$Basics_ops['++'], decoderModuleName, 'bool');
								case 'String':
									return A2(_elm_lang$core$Basics_ops['++'], decoderModuleName, 'string');
								case 'List':
									return A2(
										_elm_lang$core$Basics_ops['++'],
										'(',
										A2(
											_elm_lang$core$Basics_ops['++'],
											decoderModuleName,
											A2(
												_elm_lang$core$Basics_ops['++'],
												'list ',
												A2(
													_elm_lang$core$Basics_ops['++'],
													A5(_user$project$Indexer$getDefaultDecoderRecur, activeFileTokens, visitedTypes, decoderModuleName, _elm_lang$core$Maybe$Nothing, tailTipe),
													')'))));
								case 'Array.Array':
									return A2(
										_elm_lang$core$Basics_ops['++'],
										'(',
										A2(
											_elm_lang$core$Basics_ops['++'],
											decoderModuleName,
											A2(
												_elm_lang$core$Basics_ops['++'],
												'array ',
												A2(
													_elm_lang$core$Basics_ops['++'],
													A5(_user$project$Indexer$getDefaultDecoderRecur, activeFileTokens, visitedTypes, decoderModuleName, _elm_lang$core$Maybe$Nothing, tailTipe),
													')'))));
								case 'Dict.Dict':
									var _p154 = _elm_lang$core$List$head(tailParts);
									if ((_p154.ctor === 'Just') && (_p154._0 === 'String')) {
										return A2(
											_elm_lang$core$Basics_ops['++'],
											'(',
											A2(
												_elm_lang$core$Basics_ops['++'],
												decoderModuleName,
												A2(
													_elm_lang$core$Basics_ops['++'],
													'dict ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														A5(
															_user$project$Indexer$getDefaultDecoderRecur,
															activeFileTokens,
															visitedTypes,
															decoderModuleName,
															_elm_lang$core$Maybe$Nothing,
															A2(
																_elm_lang$core$String$join,
																' ',
																A2(
																	_elm_lang$core$Maybe$withDefault,
																	{ctor: '[]'},
																	_elm_lang$core$List$tail(tailParts)))),
														')'))));
									} else {
										return '_';
									}
								case 'Maybe':
									return A2(
										_elm_lang$core$Basics_ops['++'],
										'(',
										A2(
											_elm_lang$core$Basics_ops['++'],
											decoderModuleName,
											A2(
												_elm_lang$core$Basics_ops['++'],
												'maybe ',
												A2(
													_elm_lang$core$Basics_ops['++'],
													A5(_user$project$Indexer$getDefaultDecoderRecur, activeFileTokens, visitedTypes, decoderModuleName, _elm_lang$core$Maybe$Nothing, tailTipe),
													')'))));
								default:
									var _p157 = _p153;
									if (_elm_lang$core$Native_Utils.eq(
										_user$project$Indexer$getLastName(_p157),
										'Value') && (_elm_lang$core$Native_Utils.eq(
										_user$project$Indexer$getModuleName(_p157),
										decoderModuleName) || _elm_lang$core$Native_Utils.eq(
										A2(
											_elm_lang$core$Basics_ops['++'],
											_user$project$Indexer$getModuleName(_p157),
											'.'),
										decoderModuleName))) {
										return A2(_elm_lang$core$Basics_ops['++'], decoderModuleName, 'value');
									} else {
										var _p155 = _elm_lang$core$List$head(
											A2(
												_user$project$Indexer$getHintsForToken,
												_elm_lang$core$Maybe$Just(_p157),
												activeFileTokens));
										if (_p155.ctor === 'Just') {
											var _p156 = _p155._0;
											if ((!_elm_lang$core$Native_Utils.eq(_p156.kind, _user$project$Indexer$KindType)) && ((!_elm_lang$core$Native_Utils.eq(_p156.tipe, _p157)) && ((!_elm_lang$core$Native_Utils.eq(_p156.kind, _user$project$Indexer$KindTypeAlias)) || (_elm_lang$core$Native_Utils.eq(_p156.kind, _user$project$Indexer$KindTypeAlias) && _elm_lang$core$Native_Utils.eq(
												_elm_lang$core$List$length(_p156.args),
												0))))) {
												if (A2(_elm_lang$core$Set$member, _p156.name, visitedTypes)) {
													return '_';
												} else {
													var _v125 = activeFileTokens,
														_v126 = A2(_elm_lang$core$Set$insert, _p156.name, visitedTypes),
														_v127 = decoderModuleName,
														_v128 = _elm_lang$core$Maybe$Just(_p156.name),
														_v129 = _p156.tipe;
													activeFileTokens = _v125;
													visitedTypes = _v126;
													decoderModuleName = _v127;
													maybeHintName = _v128;
													tipeString = _v129;
													continue getDefaultDecoderRecur;
												}
											} else {
												if (_elm_lang$core$Native_Utils.eq(_p156.kind, _user$project$Indexer$KindType)) {
													return A2(
														_elm_lang$core$Basics_ops['++'],
														A2(
															_elm_lang$core$Basics_ops['++'],
															'(',
															A2(_elm_lang$core$Basics_ops['++'], decoderModuleName, 'string\n')),
														A2(
															_elm_lang$core$Basics_ops['++'],
															A2(
																_elm_lang$core$Basics_ops['++'],
																'|> ',
																A2(_elm_lang$core$Basics_ops['++'], decoderModuleName, 'andThen (\\string ->\n')),
															A2(
																_elm_lang$core$Basics_ops['++'],
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_user$project$Helper$indent(1),
																	'case string of\n'),
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	A2(
																		_elm_lang$core$String$join,
																		'\n',
																		A2(
																			_elm_lang$core$List$map,
																			function (tipeCase) {
																				return A2(
																					_elm_lang$core$Basics_ops['++'],
																					_user$project$Helper$indent(2),
																					A2(
																						_elm_lang$core$Basics_ops['++'],
																						'\"',
																						A2(
																							_elm_lang$core$Basics_ops['++'],
																							tipeCase.name,
																							A2(
																								_elm_lang$core$Basics_ops['++'],
																								'\" ->\n',
																								A2(
																									_elm_lang$core$Basics_ops['++'],
																									_user$project$Helper$indent(3),
																									A2(
																										_elm_lang$core$Basics_ops['++'],
																										decoderModuleName,
																										A2(_elm_lang$core$Basics_ops['++'], 'succeed ', tipeCase.name)))))));
																			},
																			_p156.cases)),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			'\n',
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				_user$project$Helper$indent(2),
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					'_ ->\n',
																					A2(
																						_elm_lang$core$Basics_ops['++'],
																						_user$project$Helper$indent(3),
																						A2(
																							_elm_lang$core$Basics_ops['++'],
																							decoderModuleName,
																							A2(
																								_elm_lang$core$Basics_ops['++'],
																								'fail \"Unknown ',
																								A2(_elm_lang$core$Basics_ops['++'], _p156.name, '\"'))))))),
																		'\n))')))));
												} else {
													return '_';
												}
											}
										} else {
											return '_';
										}
									}
							}
						} else {
							return '_';
						}
					}
				}
			}
		}
	});
var _user$project$Indexer$getDefaultValueForTypeRecur = F3(
	function (activeFileTokens, visitedTypes, tipeString) {
		getDefaultValueForTypeRecur:
		while (true) {
			if (_elm_lang$core$Native_Utils.eq(
				_elm_lang$core$String$trim(tipeString),
				'')) {
				return '_';
			} else {
				if (_user$project$Indexer$isDecoderTipe(tipeString)) {
					var tipeParts = A2(_elm_lang$core$String$split, ' ', tipeString);
					var _p158 = _elm_lang$core$List$head(tipeParts);
					if (_p158.ctor === 'Just') {
						var decoderModuleName = _user$project$Indexer$getModuleName(_p158._0);
						var tipeSansDecoder = A2(
							_elm_lang$core$String$join,
							' ',
							A2(
								_elm_lang$core$Maybe$withDefault,
								{ctor: '[]'},
								_elm_lang$core$List$tail(tipeParts)));
						var decoderValue = A5(
							_user$project$Indexer$getDefaultDecoderRecur,
							activeFileTokens,
							_elm_lang$core$Set$empty,
							_elm_lang$core$Native_Utils.eq(decoderModuleName, '') ? '' : A2(_elm_lang$core$Basics_ops['++'], decoderModuleName, '.'),
							_elm_lang$core$Maybe$Nothing,
							tipeSansDecoder);
						return _user$project$Indexer$formatDecoderEncoderFunctionBody(decoderValue);
					} else {
						return '_';
					}
				} else {
					if (_user$project$Indexer$isRecordString(tipeString)) {
						var fieldsAndValues = A2(
							_elm_lang$core$String$join,
							', ',
							A2(
								_elm_lang$core$List$map,
								function (_p159) {
									var _p160 = _p159;
									return A2(
										_elm_lang$core$Basics_ops['++'],
										_p160._0,
										A2(
											_elm_lang$core$Basics_ops['++'],
											' = ',
											A3(_user$project$Indexer$getDefaultValueForTypeRecur, activeFileTokens, visitedTypes, _p160._1)));
								},
								_user$project$Indexer$getRecordTipeParts(tipeString)));
						return A2(
							_elm_lang$core$Basics_ops['++'],
							'{ ',
							A2(_elm_lang$core$Basics_ops['++'], fieldsAndValues, ' }'));
					} else {
						if (_user$project$Indexer$isTupleString(tipeString)) {
							var parts = A2(
								_elm_lang$core$List$map,
								function (part) {
									return A3(_user$project$Indexer$getDefaultValueForTypeRecur, activeFileTokens, visitedTypes, part);
								},
								_user$project$Indexer$getTupleParts(tipeString));
							return _user$project$Indexer$getTupleStringFromParts(parts);
						} else {
							if (_user$project$Indexer$isFunctionTipe(tipeString)) {
								var returnValue = A3(
									_user$project$Indexer$getDefaultValueForTypeRecur,
									activeFileTokens,
									visitedTypes,
									_user$project$Indexer$getReturnTipe(tipeString));
								var $arguments = A2(
									_elm_lang$core$String$join,
									' ',
									_user$project$Indexer$getDefaultArgNames(
										_user$project$Helper$dropLast(
											_user$project$Indexer$getTipeParts(tipeString))));
								return A2(
									_elm_lang$core$Basics_ops['++'],
									'\\',
									A2(
										_elm_lang$core$Basics_ops['++'],
										$arguments,
										A2(_elm_lang$core$Basics_ops['++'], ' -> ', returnValue)));
							} else {
								var _p161 = _elm_lang$core$List$head(
									A2(_elm_lang$core$String$split, ' ', tipeString));
								if (_p161.ctor === 'Just') {
									var _p168 = _p161._0;
									var _p162 = _p168;
									switch (_p162) {
										case 'number':
											return '0';
										case 'Int':
											return '0';
										case 'Float':
											return '0.0';
										case 'Bool':
											return 'False';
										case 'String':
											return '\"\"';
										case 'List':
											return '[]';
										case 'Array.Array':
											return 'Array.empty';
										case 'Cmd':
											return 'Cmd.none';
										case 'Color.Color':
											return 'Color.black';
										case 'Dict.Dict':
											return 'Dict.empty';
										case 'Maybe':
											return 'Nothing';
										case 'Set.Set':
											return 'Set.empty';
										case 'Sub':
											return 'Sub.none';
										default:
											var _p163 = _elm_lang$core$List$head(
												A2(
													_user$project$Indexer$getHintsForToken,
													_elm_lang$core$Maybe$Just(_p168),
													activeFileTokens));
											if (_p163.ctor === 'Just') {
												var _p167 = _p163._0;
												if ((!_elm_lang$core$Native_Utils.eq(_p167.kind, _user$project$Indexer$KindType)) && ((!_elm_lang$core$Native_Utils.eq(_p167.tipe, _p168)) && ((!_elm_lang$core$Native_Utils.eq(_p167.kind, _user$project$Indexer$KindTypeAlias)) || (_elm_lang$core$Native_Utils.eq(_p167.kind, _user$project$Indexer$KindTypeAlias) && _elm_lang$core$Native_Utils.eq(
													_elm_lang$core$List$length(_p167.args),
													0))))) {
													if (A2(_elm_lang$core$Set$member, _p167.name, visitedTypes)) {
														return '_';
													} else {
														var _v135 = activeFileTokens,
															_v136 = A2(_elm_lang$core$Set$insert, _p167.name, visitedTypes),
															_v137 = _p167.tipe;
														activeFileTokens = _v135;
														visitedTypes = _v136;
														tipeString = _v137;
														continue getDefaultValueForTypeRecur;
													}
												} else {
													if (_elm_lang$core$Native_Utils.eq(_p167.kind, _user$project$Indexer$KindType)) {
														var _p164 = _elm_lang$core$List$head(_p167.cases);
														if (_p164.ctor === 'Just') {
															var _p166 = _p164._0;
															if (A2(_elm_lang$core$Set$member, _p167.name, visitedTypes)) {
																return '_';
															} else {
																var _p165 = _user$project$Indexer$typeConstructorToNameAndArgs(tipeString);
																var annotatedTipeArgs = _p165._1;
																var alignedArgs = A3(_user$project$Indexer$getTipeCaseAlignedArgTipes, _p167.args, annotatedTipeArgs, _p166.args);
																return A2(
																	_elm_lang$core$Basics_ops['++'],
																	_p166.name,
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		(_elm_lang$core$Native_Utils.cmp(
																			_elm_lang$core$List$length(alignedArgs),
																			0) > 0) ? ' ' : '',
																		A2(
																			_elm_lang$core$String$join,
																			' ',
																			A2(
																				_elm_lang$core$List$map,
																				A2(
																					_user$project$Indexer$getDefaultValueForTypeRecur,
																					activeFileTokens,
																					A2(_elm_lang$core$Set$insert, _p167.name, visitedTypes)),
																				alignedArgs))));
															}
														} else {
															return '_';
														}
													} else {
														return '_';
													}
												}
											} else {
												return '_';
											}
									}
								} else {
									return '_';
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$Indexer$getDefaultValueForType = F2(
	function (activeFileTokens, tipeString) {
		return A3(_user$project$Indexer$getDefaultValueForTypeRecur, activeFileTokens, _elm_lang$core$Set$empty, tipeString);
	});
var _user$project$Indexer$constructDefaultArguments = F2(
	function (token, activeFileTokens) {
		var _p169 = _elm_lang$core$List$head(
			A2(
				_user$project$Indexer$getHintsForToken,
				_elm_lang$core$Maybe$Just(token),
				activeFileTokens));
		if (_p169.ctor === 'Just') {
			var _p170 = _p169._0;
			var parts = _user$project$Indexer$isRecordString(_p170.tipe) ? _user$project$Indexer$getRecordTipeFieldTipes(_p170.tipe) : _user$project$Helper$dropLast(
				_user$project$Indexer$getTipeParts(_p170.tipe));
			return _elm_lang$core$Maybe$Just(
				A2(
					_elm_lang$core$List$map,
					function (tipeString) {
						var value = A2(_user$project$Indexer$getDefaultValueForType, activeFileTokens, tipeString);
						return (A2(_elm_lang$core$String$contains, ' ', value) && ((!_user$project$Indexer$isRecordString(value)) && (!_user$project$Indexer$isTupleString(value)))) ? A2(
							_elm_lang$core$Basics_ops['++'],
							'(',
							A2(_elm_lang$core$Basics_ops['++'], value, ')')) : value;
					},
					parts));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _user$project$Indexer$doConstructDefaultArguments = F2(
	function (token, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$defaultArgumentsConstructedCmd(
				A2(_user$project$Indexer$constructDefaultArguments, token, model.activeFileTokens))
		};
	});
var _user$project$Indexer$getDefaultEncoderRecur = F5(
	function (activeFileTokens, visitedTypes, encoderModuleName, maybeObjectName, tipeString) {
		getDefaultEncoderRecur:
		while (true) {
			if (_elm_lang$core$Native_Utils.eq(
				_elm_lang$core$String$trim(tipeString),
				'')) {
				return '_';
			} else {
				if (_user$project$Indexer$isRecordString(tipeString)) {
					var _p171 = maybeObjectName;
					if (_p171.ctor === 'Just') {
						var fieldsAndValues = _user$project$Indexer$getRecordTipeParts(tipeString);
						var numFieldAndValues = _elm_lang$core$List$length(fieldsAndValues);
						return (_elm_lang$core$Native_Utils.cmp(numFieldAndValues, 0) > 0) ? A2(
							_elm_lang$core$Basics_ops['++'],
							A2(
								_elm_lang$core$Basics_ops['++'],
								'\n(',
								A2(
									_elm_lang$core$Basics_ops['++'],
									encoderModuleName,
									A2(_elm_lang$core$Basics_ops['++'], 'object', '\n'))),
							A2(
								_elm_lang$core$Basics_ops['++'],
								A2(
									_elm_lang$core$String$join,
									'\n',
									A2(
										_elm_lang$core$List$indexedMap,
										F2(
											function (index, _p172) {
												var _p173 = _p172;
												var _p174 = _p173._0;
												var prefix = _elm_lang$core$Native_Utils.eq(index, 0) ? '[ ' : ', ';
												return A2(
													_elm_lang$core$Basics_ops['++'],
													prefix,
													A2(
														_elm_lang$core$Basics_ops['++'],
														'( \"',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_p174,
															A2(
																_elm_lang$core$Basics_ops['++'],
																'\", ',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	A5(
																		_user$project$Indexer$getDefaultEncoderRecur,
																		activeFileTokens,
																		visitedTypes,
																		encoderModuleName,
																		_elm_lang$core$Maybe$Just(
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				_p171._0,
																				A2(_elm_lang$core$Basics_ops['++'], '.', _p174))),
																		_p173._1),
																	' )')))));
											}),
										fieldsAndValues)),
								A2(
									_elm_lang$core$Basics_ops['++'],
									A2(_elm_lang$core$Basics_ops['++'], '\n', ']'),
									'\n)'))) : '_';
					} else {
						return '_';
					}
				} else {
					if (_user$project$Indexer$isTupleString(tipeString)) {
						var _p175 = maybeObjectName;
						if (_p175.ctor === 'Just') {
							var parts = A2(
								_elm_lang$core$List$indexedMap,
								F2(
									function (index, partTipe) {
										return A5(
											_user$project$Indexer$getDefaultEncoderRecur,
											activeFileTokens,
											visitedTypes,
											encoderModuleName,
											_elm_lang$core$Maybe$Just(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'v',
													_elm_lang$core$Basics$toString(index))),
											partTipe);
									}),
								_user$project$Indexer$getTupleParts(tipeString));
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'\nlet\n',
								A2(
									_elm_lang$core$Basics_ops['++'],
									A2(
										_elm_lang$core$Basics_ops['++'],
										_user$project$Helper$indent(1),
										A2(
											_elm_lang$core$Basics_ops['++'],
											'( ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												A2(
													_elm_lang$core$String$join,
													', ',
													A2(
														_elm_lang$core$List$indexedMap,
														F2(
															function (index, _p176) {
																return A2(
																	_elm_lang$core$Basics_ops['++'],
																	'v',
																	_elm_lang$core$Basics$toString(index));
															}),
														parts)),
												' ) =\n'))),
									A2(
										_elm_lang$core$Basics_ops['++'],
										A2(
											_elm_lang$core$Basics_ops['++'],
											_user$project$Helper$indent(2),
											A2(_elm_lang$core$Basics_ops['++'], _p175._0, '\n')),
										A2(
											_elm_lang$core$Basics_ops['++'],
											'in\n',
											A2(
												_elm_lang$core$Basics_ops['++'],
												A2(
													_elm_lang$core$Basics_ops['++'],
													_user$project$Helper$indent(1),
													A2(_elm_lang$core$Basics_ops['++'], encoderModuleName, 'list [')),
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(_elm_lang$core$String$join, ', ', parts),
													']'))))));
						} else {
							return '_';
						}
					} else {
						var objectName = A2(_elm_lang$core$Maybe$withDefault, '', maybeObjectName);
						var tipeParts = A2(
							_elm_lang$core$String$split,
							' ',
							_user$project$Indexer$unencloseParentheses(tipeString));
						var tailParts = A2(
							_elm_lang$core$Maybe$withDefault,
							{ctor: '[]'},
							_elm_lang$core$List$tail(tipeParts));
						var tailTipe = A2(_elm_lang$core$String$join, ' ', tailParts);
						var wrapWithMap = function (moduleName) {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								A2(
									_elm_lang$core$Basics_ops['++'],
									'(',
									A2(
										_elm_lang$core$Basics_ops['++'],
										encoderModuleName,
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$String$toLower(moduleName),
											' '))),
								A2(
									_elm_lang$core$Basics_ops['++'],
									A2(
										_elm_lang$core$Basics_ops['++'],
										'\n(',
										A2(_elm_lang$core$Basics_ops['++'], moduleName, '.map\n')),
									A2(
										_elm_lang$core$Basics_ops['++'],
										'(\\v ->\n',
										A2(
											_elm_lang$core$Basics_ops['++'],
											A2(
												_elm_lang$core$String$join,
												'\n',
												A2(
													_elm_lang$core$List$map,
													function (line) {
														return line;
													},
													A2(
														_elm_lang$core$String$split,
														'\n',
														A5(
															_user$project$Indexer$getDefaultEncoderRecur,
															activeFileTokens,
															visitedTypes,
															encoderModuleName,
															_elm_lang$core$Maybe$Just('v'),
															tailTipe)))),
											A2(
												_elm_lang$core$Basics_ops['++'],
												A2(_elm_lang$core$Basics_ops['++'], '\n', ')'),
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														'\n',
														A2(_elm_lang$core$Basics_ops['++'], objectName, '\n)')),
													'\n)'))))));
						};
						var _p177 = _elm_lang$core$List$head(tipeParts);
						if (_p177.ctor === 'Just') {
							var _p178 = _p177._0;
							switch (_p178) {
								case 'number':
									return A2(
										_elm_lang$core$Basics_ops['++'],
										encoderModuleName,
										A2(_elm_lang$core$Basics_ops['++'], 'float ', objectName));
								case 'Int':
									return A2(
										_elm_lang$core$Basics_ops['++'],
										encoderModuleName,
										A2(_elm_lang$core$Basics_ops['++'], 'int ', objectName));
								case 'Float':
									return A2(
										_elm_lang$core$Basics_ops['++'],
										encoderModuleName,
										A2(_elm_lang$core$Basics_ops['++'], 'float ', objectName));
								case 'Bool':
									return A2(
										_elm_lang$core$Basics_ops['++'],
										encoderModuleName,
										A2(_elm_lang$core$Basics_ops['++'], 'bool ', objectName));
								case 'String':
									return A2(
										_elm_lang$core$Basics_ops['++'],
										encoderModuleName,
										A2(_elm_lang$core$Basics_ops['++'], 'string ', objectName));
								case 'List':
									return wrapWithMap('List');
								case 'Array.Array':
									return wrapWithMap('Array');
								case 'Dict.Dict':
									var _p179 = _elm_lang$core$List$head(tailParts);
									if ((_p179.ctor === 'Just') && (_p179._0 === 'String')) {
										var dictValueTipe = A2(
											_elm_lang$core$String$join,
											' ',
											A2(
												_elm_lang$core$Maybe$withDefault,
												{ctor: '[]'},
												_elm_lang$core$List$tail(tailParts)));
										return A2(
											_elm_lang$core$Basics_ops['++'],
											'(',
											A2(
												_elm_lang$core$Basics_ops['++'],
												encoderModuleName,
												A2(
													_elm_lang$core$Basics_ops['++'],
													'object (List.map (\\( k, v ) -> ( k, ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														A5(
															_user$project$Indexer$getDefaultEncoderRecur,
															activeFileTokens,
															visitedTypes,
															encoderModuleName,
															_elm_lang$core$Maybe$Just('v'),
															dictValueTipe),
														A2(
															_elm_lang$core$Basics_ops['++'],
															' )) (Dict.toList ',
															A2(_elm_lang$core$Basics_ops['++'], objectName, ')))'))))));
									} else {
										return '_';
									}
								case 'Maybe':
									return A2(
										_elm_lang$core$Basics_ops['++'],
										A2(
											_elm_lang$core$Basics_ops['++'],
											'case ',
											A2(_elm_lang$core$Basics_ops['++'], objectName, ' of\n')),
										A2(
											_elm_lang$core$Basics_ops['++'],
											A2(
												_elm_lang$core$Basics_ops['++'],
												_user$project$Helper$indent(1),
												'Just v ->\n'),
											A2(
												_elm_lang$core$Basics_ops['++'],
												A2(
													_elm_lang$core$Basics_ops['++'],
													_user$project$Helper$indent(2),
													A2(
														_elm_lang$core$Basics_ops['++'],
														A5(
															_user$project$Indexer$getDefaultEncoderRecur,
															activeFileTokens,
															visitedTypes,
															encoderModuleName,
															_elm_lang$core$Maybe$Just('v'),
															tailTipe),
														'\n')),
												A2(
													_elm_lang$core$Basics_ops['++'],
													A2(
														_elm_lang$core$Basics_ops['++'],
														_user$project$Helper$indent(1),
														'Nothing ->\n'),
													A2(
														_elm_lang$core$Basics_ops['++'],
														_user$project$Helper$indent(2),
														A2(_elm_lang$core$Basics_ops['++'], encoderModuleName, 'null'))))));
								default:
									var _p182 = _p178;
									if (_elm_lang$core$Native_Utils.eq(
										_user$project$Indexer$getLastName(_p182),
										'Value')) {
										return objectName;
									} else {
										var _p180 = _elm_lang$core$List$head(
											A2(
												_user$project$Indexer$getHintsForToken,
												_elm_lang$core$Maybe$Just(_p182),
												activeFileTokens));
										if (_p180.ctor === 'Just') {
											var _p181 = _p180._0;
											if ((!_elm_lang$core$Native_Utils.eq(_p181.kind, _user$project$Indexer$KindType)) && ((!_elm_lang$core$Native_Utils.eq(_p181.tipe, _p182)) && ((!_elm_lang$core$Native_Utils.eq(_p181.kind, _user$project$Indexer$KindTypeAlias)) || (_elm_lang$core$Native_Utils.eq(_p181.kind, _user$project$Indexer$KindTypeAlias) && _elm_lang$core$Native_Utils.eq(
												_elm_lang$core$List$length(_p181.args),
												0))))) {
												if (A2(_elm_lang$core$Set$member, _p181.name, visitedTypes)) {
													return '_';
												} else {
													var _v147 = activeFileTokens,
														_v148 = A2(_elm_lang$core$Set$insert, _p181.name, visitedTypes),
														_v149 = encoderModuleName,
														_v150 = _elm_lang$core$Maybe$Just('v'),
														_v151 = _p181.tipe;
													activeFileTokens = _v147;
													visitedTypes = _v148;
													encoderModuleName = _v149;
													maybeObjectName = _v150;
													tipeString = _v151;
													continue getDefaultEncoderRecur;
												}
											} else {
												if (_elm_lang$core$Native_Utils.eq(_p181.kind, _user$project$Indexer$KindType)) {
													return A2(
														_elm_lang$core$Basics_ops['++'],
														A2(
															_elm_lang$core$Basics_ops['++'],
															'case ',
															A2(_elm_lang$core$Basics_ops['++'], objectName, ' of\n')),
														A2(
															_elm_lang$core$String$join,
															'\n',
															A2(
																_elm_lang$core$List$map,
																function (tipeCase) {
																	return A2(
																		_elm_lang$core$Basics_ops['++'],
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			_user$project$Helper$indent(1),
																			A2(_elm_lang$core$Basics_ops['++'], tipeCase.name, ' ->\n')),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			_user$project$Helper$indent(2),
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				encoderModuleName,
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					'string ',
																					A2(
																						_elm_lang$core$Basics_ops['++'],
																						'\"',
																						A2(_elm_lang$core$Basics_ops['++'], tipeCase.name, '\"'))))));
																},
																_p181.cases)));
												} else {
													return '_';
												}
											}
										} else {
											return '_';
										}
									}
							}
						} else {
							return '_';
						}
					}
				}
			}
		}
	});
var _user$project$Indexer$constructFromTypeAnnotation = F2(
	function (typeAnnotation, activeFileTokens) {
		var parts = A2(_elm_lang$core$String$split, ' :', typeAnnotation);
		var tipeString = A2(
			_elm_lang$core$String$join,
			' :',
			A2(
				_elm_lang$core$Maybe$withDefault,
				{ctor: '[]'},
				_elm_lang$core$List$tail(parts)));
		var parameterTipes = _user$project$Indexer$getParameterTipes(tipeString);
		var argNames = _user$project$Indexer$getDefaultArgNames(parameterTipes);
		var returnTipe = _user$project$Indexer$getReturnTipe(tipeString);
		var name = A2(
			_elm_lang$core$Maybe$withDefault,
			typeAnnotation,
			_elm_lang$core$List$head(parts));
		return _user$project$Indexer$isEncoderTipe(tipeString) ? A2(
			_elm_lang$core$Basics_ops['++'],
			name,
			A2(
				_elm_lang$core$Basics_ops['++'],
				' ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					'v',
					A2(
						_elm_lang$core$Basics_ops['++'],
						' =\n',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_user$project$Helper$indent(1),
							function () {
								var _p183 = _elm_lang$core$List$head(parameterTipes);
								if (_p183.ctor === 'Just') {
									var encoderModuleName = _user$project$Indexer$getModuleName(returnTipe);
									var encoderValue = A5(
										_user$project$Indexer$getDefaultEncoderRecur,
										activeFileTokens,
										_elm_lang$core$Set$empty,
										_elm_lang$core$Native_Utils.eq(encoderModuleName, '') ? '' : A2(_elm_lang$core$Basics_ops['++'], encoderModuleName, '.'),
										_elm_lang$core$Maybe$Just('v'),
										_p183._0);
									return _user$project$Indexer$formatDecoderEncoderFunctionBody(encoderValue);
								} else {
									return '_';
								}
							}()))))) : A2(
			_elm_lang$core$Basics_ops['++'],
			name,
			A2(
				_elm_lang$core$Basics_ops['++'],
				(_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$List$length(argNames),
					0) > 0) ? ' ' : '',
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(_elm_lang$core$String$join, ' ', argNames),
					A2(
						_elm_lang$core$Basics_ops['++'],
						' =\n',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_user$project$Helper$indent(1),
							A2(_user$project$Indexer$getDefaultValueForType, activeFileTokens, returnTipe))))));
	});
var _user$project$Indexer$doConstructFromTypeAnnotation = F2(
	function (typeAnnotation, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$fromTypeAnnotationConstructedCmd(
				A2(_user$project$Indexer$constructFromTypeAnnotation, typeAnnotation, model.activeFileTokens))
		};
	});
var _user$project$Indexer$constructDefaultValueForType = F2(
	function (token, activeFileTokens) {
		return (_elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$List$length(
				A2(
					_elm_lang$core$List$filter,
					function (hint) {
						return _elm_lang$core$Native_Utils.eq(hint.kind, _user$project$Indexer$KindType) || _elm_lang$core$Native_Utils.eq(hint.kind, _user$project$Indexer$KindTypeAlias);
					},
					A2(
						_user$project$Indexer$getHintsForToken,
						_elm_lang$core$Maybe$Just(token),
						activeFileTokens))),
			0) > 0) ? _elm_lang$core$Maybe$Just(
			A2(_user$project$Indexer$getDefaultValueForType, activeFileTokens, token)) : _elm_lang$core$Maybe$Nothing;
	});
var _user$project$Indexer$doConstructDefaultValueForType = F2(
	function (token, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$defaultValueForTypeConstructedCmd(
				A2(_user$project$Indexer$constructDefaultValueForType, token, model.activeFileTokens))
		};
	});
var _user$project$Indexer$KindDefault = {ctor: 'KindDefault'};
var _user$project$Indexer$getModuleSymbols = function (moduleDocs) {
	var _p184 = moduleDocs;
	var sourcePath = _p184.sourcePath;
	var values = _p184.values;
	var moduleDocsSymbol = {fullName: moduleDocs.name, sourcePath: sourcePath, tipe: '', caseTipe: _elm_lang$core$Maybe$Nothing, kind: _user$project$Indexer$KindModule};
	var valueSymbols = A2(
		_elm_lang$core$List$map,
		function (value) {
			var kind = _user$project$Helper$isCapitalized(value.name) ? _user$project$Indexer$KindTypeAlias : _user$project$Indexer$KindDefault;
			return {
				fullName: A2(
					_elm_lang$core$Basics_ops['++'],
					moduleDocs.name,
					A2(_elm_lang$core$Basics_ops['++'], '.', value.name)),
				sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, value.name),
				tipe: value.tipe,
				caseTipe: _elm_lang$core$Maybe$Nothing,
				kind: kind
			};
		},
		values.values);
	var aliasSymbols = A2(
		_elm_lang$core$List$map,
		function (alias) {
			return {
				fullName: A2(
					_elm_lang$core$Basics_ops['++'],
					moduleDocs.name,
					A2(_elm_lang$core$Basics_ops['++'], '.', alias.name)),
				sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, alias.name),
				tipe: alias.tipe,
				caseTipe: _elm_lang$core$Maybe$Nothing,
				kind: _user$project$Indexer$KindTypeAlias
			};
		},
		values.aliases);
	var tipeSymbols = A2(
		_elm_lang$core$List$map,
		function (tipe) {
			return {
				fullName: A2(
					_elm_lang$core$Basics_ops['++'],
					moduleDocs.name,
					A2(_elm_lang$core$Basics_ops['++'], '.', tipe.name)),
				sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, tipe.name),
				tipe: tipe.tipe,
				caseTipe: _elm_lang$core$Maybe$Nothing,
				kind: _user$project$Indexer$KindType
			};
		},
		values.tipes);
	var tipeCaseSymbols = A2(
		_elm_lang$core$List$concatMap,
		function (tipe) {
			return A2(
				_elm_lang$core$List$map,
				function (tipeCase) {
					return {
						fullName: A2(
							_elm_lang$core$Basics_ops['++'],
							moduleDocs.name,
							A2(_elm_lang$core$Basics_ops['++'], '.', tipeCase.name)),
						sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, tipeCase.name),
						tipe: A2(_user$project$Indexer$getTipeCaseTypeAnnotation, tipeCase, tipe),
						caseTipe: _elm_lang$core$Maybe$Just(tipe.name),
						kind: _user$project$Indexer$KindTypeCase
					};
				},
				tipe.cases);
		},
		values.tipes);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		valueSymbols,
		A2(
			_elm_lang$core$Basics_ops['++'],
			aliasSymbols,
			A2(
				_elm_lang$core$Basics_ops['++'],
				tipeSymbols,
				A2(
					_elm_lang$core$Basics_ops['++'],
					tipeCaseSymbols,
					{
						ctor: '::',
						_0: moduleDocsSymbol,
						_1: {ctor: '[]'}
					}))));
};
var _user$project$Indexer$getProjectFileSymbols = F2(
	function (projectDirectory, projectFileContentsDict) {
		var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, projectDirectory, projectFileContentsDict);
		var allFileSymbols = A2(
			_elm_lang$core$List$concatMap,
			function (_p185) {
				var _p186 = _p185;
				return _user$project$Indexer$getModuleSymbols(_p186.moduleDocs);
			},
			_elm_lang$core$Dict$values(fileContentsDict));
		return A2(
			_elm_lang$core$List$filter,
			function (_p187) {
				var _p188 = _p187;
				return _user$project$Indexer$isProjectSourcePath(_p188.sourcePath);
			},
			allFileSymbols);
	});
var _user$project$Indexer$doShowGoToSymbolView = F3(
	function (maybeProjectDirectory, maybeToken, model) {
		var _p189 = maybeProjectDirectory;
		if (_p189.ctor === 'Just') {
			var hints = A2(_user$project$Indexer$getHintsForToken, maybeToken, model.activeFileTokens);
			var defaultSymbolName = function () {
				var _p190 = _elm_lang$core$List$head(hints);
				if (_p190.ctor === 'Just') {
					var _p192 = _p190._0;
					var _p191 = model.activeFile;
					if (_p191.ctor === 'Just') {
						return _elm_lang$core$Native_Utils.eq(_p191._0.filePath, _p192.sourcePath) ? _elm_lang$core$Maybe$Just(
							_user$project$Indexer$getLastName(_p192.name)) : _elm_lang$core$Maybe$Just(_p192.name);
					} else {
						return _elm_lang$core$Maybe$Just(_p192.name);
					}
				} else {
					return maybeToken;
				}
			}();
			return {
				ctor: '_Tuple2',
				_0: model,
				_1: _user$project$Indexer$showGoToSymbolViewCmd(
					{
						ctor: '_Tuple3',
						_0: defaultSymbolName,
						_1: model.activeFile,
						_2: A2(
							_elm_lang$core$List$map,
							_user$project$Indexer$encodeSymbol,
							A2(_user$project$Indexer$getProjectFileSymbols, _p189._0, model.projectFileContentsDict))
					})
			};
		} else {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _user$project$Indexer$getProjectDependencySymbols = F3(
	function (maybeActiveFile, projectDependencies, packageDocs) {
		return A2(
			_elm_lang$core$List$concatMap,
			_user$project$Indexer$getModuleSymbols,
			A3(_user$project$Indexer$getProjectPackageDocs, maybeActiveFile, projectDependencies, packageDocs));
	});
var _user$project$Indexer$getProjectSymbols = F4(
	function (maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs) {
		var _p193 = maybeActiveFile;
		if (_p193.ctor === 'Just') {
			return A2(
				_elm_lang$core$List$append,
				A2(_user$project$Indexer$getProjectFileSymbols, _p193._0.projectDirectory, projectFileContentsDict),
				A3(_user$project$Indexer$getProjectDependencySymbols, maybeActiveFile, projectDependencies, packageDocs));
		} else {
			return {ctor: '[]'};
		}
	});
var _user$project$Indexer$doShowAddImportView = F3(
	function (filePath, maybeToken, model) {
		var defaultSymbolName = function () {
			var _p194 = maybeToken;
			if (_p194.ctor === 'Just') {
				var _p196 = _p194._0;
				var _p195 = _user$project$Indexer$getModuleName(_p196);
				if (_p195 === '') {
					return _elm_lang$core$Maybe$Just(
						_user$project$Indexer$getLastName(_p196));
				} else {
					return _elm_lang$core$Maybe$Just(
						_user$project$Indexer$getModuleName(_p196));
				}
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}();
		var moduleAndSymbols = A2(
			_elm_lang$core$List$map,
			_user$project$Indexer$getModuleAndSymbolName,
			A2(
				_elm_lang$core$List$filter,
				function (_p197) {
					var _p198 = _p197;
					return (!_elm_lang$core$Native_Utils.eq(_p198.sourcePath, filePath)) && (!_elm_lang$core$Native_Utils.eq(
						_user$project$Indexer$getLastName(_p198.fullName),
						''));
				},
				A4(_user$project$Indexer$getProjectSymbols, model.activeFile, model.projectFileContentsDict, model.projectDependencies, model.packageDocs)));
		var modulesOnly = A2(
			_elm_lang$core$List$filter,
			function (_p199) {
				var _p200 = _p199;
				var _p201 = _p200._1;
				if (_p201.ctor === 'Just') {
					return false;
				} else {
					return true;
				}
			},
			moduleAndSymbols);
		var moduleAndSymbolsAndAllExposed = A2(
			_elm_lang$core$List$sortWith,
			F2(
				function (_p203, _p202) {
					var _p204 = _p203;
					var _p205 = _p202;
					var filterKey = F2(
						function (moduleName, symbolName) {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								moduleName,
								function () {
									var _p206 = symbolName;
									if (_p206.ctor === 'Just') {
										return A2(_elm_lang$core$Basics_ops['++'], ' ', _p206._0);
									} else {
										return '';
									}
								}());
						});
					return A2(
						_elm_lang$core$Basics$compare,
						A2(filterKey, _p204._0, _p204._1),
						A2(filterKey, _p205._0, _p205._1));
				}),
			A2(
				_elm_lang$core$List$append,
				moduleAndSymbols,
				A2(
					_elm_lang$core$List$map,
					function (_p207) {
						var _p208 = _p207;
						return {
							ctor: '_Tuple2',
							_0: _p208._0,
							_1: _elm_lang$core$Maybe$Just('..')
						};
					},
					modulesOnly)));
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$showAddImportViewCmd(
				{ctor: '_Tuple3', _0: defaultSymbolName, _1: model.activeFile, _2: moduleAndSymbolsAndAllExposed})
		};
	});
var _user$project$Indexer$getHintsForUnexposedNames = F3(
	function (includeQualified, moduleDocs, unexposedNames) {
		var filter = function (_p209) {
			var _p210 = _p209;
			return A2(_elm_lang$core$Set$member, _p210.name, unexposedNames);
		};
		var qualifiedAndUnqualified = function (hint) {
			return includeQualified ? {
				ctor: '::',
				_0: _elm_lang$core$Native_Utils.update(
					hint,
					{
						name: A2(
							_elm_lang$core$Basics_ops['++'],
							moduleDocs.name,
							A2(_elm_lang$core$Basics_ops['++'], '.', hint.name))
					}),
				_1: {
					ctor: '::',
					_0: hint,
					_1: {ctor: '[]'}
				}
			} : {
				ctor: '::',
				_0: hint,
				_1: {ctor: '[]'}
			};
		};
		var valueToHints = F2(
			function (kind, value) {
				return qualifiedAndUnqualified(
					{
						name: value.name,
						moduleName: moduleDocs.name,
						sourcePath: moduleDocs.sourcePath,
						comment: value.comment,
						tipe: value.tipe,
						args: A2(
							_elm_lang$core$Maybe$withDefault,
							{ctor: '[]'},
							value.args),
						caseTipe: _elm_lang$core$Maybe$Nothing,
						cases: {ctor: '[]'},
						associativity: value.associativity,
						precedence: value.precedence,
						kind: kind,
						isImported: false
					});
			});
		var tipeAliasHints = A2(
			_elm_lang$core$List$concatMap,
			valueToHints(_user$project$Indexer$KindTypeAlias),
			A2(_elm_lang$core$List$filter, filter, moduleDocs.values.aliases));
		var valueHints = A2(
			_elm_lang$core$List$concatMap,
			valueToHints(_user$project$Indexer$KindDefault),
			A2(_elm_lang$core$List$filter, filter, moduleDocs.values.values));
		var tipeAndTipeCaseHints = A2(
			_elm_lang$core$List$concatMap,
			function (tipe) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					qualifiedAndUnqualified(
						{name: tipe.name, moduleName: moduleDocs.name, sourcePath: moduleDocs.sourcePath, comment: tipe.comment, tipe: tipe.tipe, args: tipe.args, caseTipe: _elm_lang$core$Maybe$Nothing, cases: tipe.cases, associativity: _elm_lang$core$Maybe$Nothing, precedence: _elm_lang$core$Maybe$Nothing, kind: _user$project$Indexer$KindType, isImported: false}),
					A2(
						_elm_lang$core$List$concatMap,
						function (tipeCase) {
							var hintTipe = A2(_user$project$Indexer$getTipeCaseTypeAnnotation, tipeCase, tipe);
							return qualifiedAndUnqualified(
								{
									name: tipeCase.name,
									moduleName: moduleDocs.name,
									sourcePath: moduleDocs.sourcePath,
									comment: '',
									tipe: hintTipe,
									args: tipeCase.args,
									caseTipe: _elm_lang$core$Maybe$Just(tipe.name),
									cases: {ctor: '[]'},
									associativity: _elm_lang$core$Maybe$Nothing,
									precedence: _elm_lang$core$Maybe$Nothing,
									kind: _user$project$Indexer$KindTypeCase,
									isImported: false
								});
						},
						A2(_elm_lang$core$List$filter, filter, tipe.cases)));
			},
			A2(_elm_lang$core$List$filter, filter, moduleDocs.values.tipes));
		return A2(
			_elm_lang$core$Basics_ops['++'],
			tipeAliasHints,
			A2(_elm_lang$core$Basics_ops['++'], tipeAndTipeCaseHints, valueHints));
	});
var _user$project$Indexer$emptyHint = {
	name: '',
	moduleName: '',
	sourcePath: '',
	comment: '',
	tipe: '',
	args: {ctor: '[]'},
	caseTipe: _elm_lang$core$Maybe$Nothing,
	cases: {ctor: '[]'},
	associativity: _elm_lang$core$Maybe$Nothing,
	precedence: _elm_lang$core$Maybe$Nothing,
	kind: _user$project$Indexer$KindDefault,
	isImported: true
};
var _user$project$Indexer$inferenceToHints = function (inference) {
	return {
		ctor: '::',
		_0: _elm_lang$core$Native_Utils.update(
			_user$project$Indexer$emptyHint,
			{name: inference.name, tipe: inference.tipe}),
		_1: {ctor: '[]'}
	};
};
var _user$project$Indexer$defaultSuggestions = A2(
	_elm_lang$core$Basics_ops['++'],
	A2(
		_elm_lang$core$List$map,
		function (suggestion) {
			return _elm_lang$core$Native_Utils.update(
				_user$project$Indexer$emptyHint,
				{name: suggestion});
		},
		{
			ctor: '::',
			_0: '=',
			_1: {
				ctor: '::',
				_0: '->',
				_1: {
					ctor: '::',
					_0: 'True',
					_1: {
						ctor: '::',
						_0: 'False',
						_1: {
							ctor: '::',
							_0: 'Int',
							_1: {
								ctor: '::',
								_0: 'Float',
								_1: {
									ctor: '::',
									_0: 'Char',
									_1: {
										ctor: '::',
										_0: 'String',
										_1: {
											ctor: '::',
											_0: 'Bool',
											_1: {
												ctor: '::',
												_0: 'List',
												_1: {
													ctor: '::',
													_0: 'if',
													_1: {
														ctor: '::',
														_0: 'then',
														_1: {
															ctor: '::',
															_0: 'else',
															_1: {
																ctor: '::',
																_0: 'type',
																_1: {
																	ctor: '::',
																	_0: 'case',
																	_1: {
																		ctor: '::',
																		_0: 'of',
																		_1: {
																			ctor: '::',
																			_0: 'let',
																			_1: {
																				ctor: '::',
																				_0: 'in',
																				_1: {
																					ctor: '::',
																					_0: 'as',
																					_1: {
																						ctor: '::',
																						_0: 'import',
																						_1: {
																							ctor: '::',
																							_0: 'port',
																							_1: {
																								ctor: '::',
																								_0: 'exposing',
																								_1: {
																									ctor: '::',
																									_0: 'alias',
																									_1: {
																										ctor: '::',
																										_0: 'infixl',
																										_1: {
																											ctor: '::',
																											_0: 'infixr',
																											_1: {
																												ctor: '::',
																												_0: 'infix',
																												_1: {
																													ctor: '::',
																													_0: 'type alias',
																													_1: {ctor: '[]'}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}),
	{
		ctor: '::',
		_0: _elm_lang$core$Native_Utils.update(
			_user$project$Indexer$emptyHint,
			{name: 'Int', comment: 'Integer.'}),
		_1: {
			ctor: '::',
			_0: _elm_lang$core$Native_Utils.update(
				_user$project$Indexer$emptyHint,
				{name: 'Float', comment: 'Floating-point number.'}),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Native_Utils.update(
					_user$project$Indexer$emptyHint,
					{name: 'Bool', comment: '`True` or `False`.'}),
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Native_Utils.update(
						_user$project$Indexer$emptyHint,
						{name: 'number', comment: 'Can be an `Int` or a `Float` depending on usage.'}),
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Native_Utils.update(
							_user$project$Indexer$emptyHint,
							{name: 'appendable', comment: 'This includes strings, lists, and text.'}),
						_1: {
							ctor: '::',
							_0: _elm_lang$core$Native_Utils.update(
								_user$project$Indexer$emptyHint,
								{name: 'comparable', comment: 'This includes numbers, characters, strings, lists of comparable things, and tuples of comparable things. Note that tuples with 7 or more elements are not comparable.'}),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}
	});
var _user$project$Indexer$getFilteredHints = F3(
	function (activeFilePath, moduleDocs, importData) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$List$concatMap,
				A3(_user$project$Indexer$unionTagsToHints, moduleDocs, importData, activeFilePath),
				moduleDocs.values.tipes),
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$List$concatMap,
					A4(_user$project$Indexer$nameToHints, moduleDocs, importData, activeFilePath, _user$project$Indexer$KindTypeAlias),
					A2(_elm_lang$core$List$map, _user$project$Indexer$valueToHintable, moduleDocs.values.aliases)),
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$List$concatMap,
						A4(_user$project$Indexer$nameToHints, moduleDocs, importData, activeFilePath, _user$project$Indexer$KindType),
						A2(_elm_lang$core$List$map, _user$project$Indexer$tipeToHintable, moduleDocs.values.tipes)),
					A2(
						_elm_lang$core$Basics_ops['++'],
						A2(
							_elm_lang$core$List$concatMap,
							A4(_user$project$Indexer$nameToHints, moduleDocs, importData, activeFilePath, _user$project$Indexer$KindDefault),
							A2(_elm_lang$core$List$map, _user$project$Indexer$valueToHintable, moduleDocs.values.values)),
						A2(_user$project$Indexer$moduleToHints, moduleDocs, importData)))));
	});
var _user$project$Indexer$getExposedAndUnexposedHints = F4(
	function (includeUnexposed, activeFilePath, imports, moduleDocsList) {
		var _p211 = A3(
			_elm_lang$core$List$foldl,
			F2(
				function (moduleDocs, _p212) {
					var _p213 = _p212;
					var tipeCases = A2(
						_elm_lang$core$List$concatMap,
						function (_) {
							return _.cases;
						},
						moduleDocs.values.tipes);
					var aliasesTipesAndValues = A2(
						_elm_lang$core$Basics_ops['++'],
						moduleDocs.values.aliases,
						A2(
							_elm_lang$core$Basics_ops['++'],
							A2(_elm_lang$core$List$map, _user$project$Indexer$tipeToValue, moduleDocs.values.tipes),
							moduleDocs.values.values));
					var allNames = _elm_lang$core$Set$fromList(
						A2(
							_elm_lang$core$Basics_ops['++'],
							A2(
								_elm_lang$core$List$map,
								function (_) {
									return _.name;
								},
								aliasesTipesAndValues),
							A2(
								_elm_lang$core$List$map,
								function (_) {
									return _.name;
								},
								tipeCases)));
					var _p214 = function () {
						var _p215 = A2(_elm_lang$core$Dict$get, moduleDocs.name, imports);
						if (_p215.ctor === 'Just') {
							var exposed = A2(
								_elm_lang$core$List$map,
								function (_p216) {
									var _p217 = _p216;
									var _p218 = _p217._1;
									var moduleNameToShow = (_elm_lang$core$Native_Utils.eq(_p218.moduleName, '') || _elm_lang$core$Native_Utils.eq(activeFilePath, _p218.sourcePath)) ? '' : _p218.moduleName;
									return _elm_lang$core$Native_Utils.update(
										_p218,
										{moduleName: moduleNameToShow, name: _p217._0});
								},
								A3(_user$project$Indexer$getFilteredHints, activeFilePath, moduleDocs, _p215._0));
							var exposedNames = _elm_lang$core$Set$fromList(
								A2(
									_elm_lang$core$List$map,
									function (_) {
										return _.name;
									},
									exposed));
							var unexposedNames = A2(
								_elm_lang$core$Set$filter,
								function (name) {
									return !A2(_elm_lang$core$Set$member, name, exposedNames);
								},
								allNames);
							return {
								ctor: '_Tuple2',
								_0: exposed,
								_1: includeUnexposed ? A3(_user$project$Indexer$getHintsForUnexposedNames, false, moduleDocs, unexposedNames) : {ctor: '[]'}
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: {ctor: '[]'},
								_1: includeUnexposed ? A3(_user$project$Indexer$getHintsForUnexposedNames, true, moduleDocs, allNames) : {ctor: '[]'}
							};
						}
					}();
					var exposedHints = _p214._0;
					var unexposedHints = _p214._1;
					return {
						ctor: '_Tuple2',
						_0: {ctor: '::', _0: exposedHints, _1: _p213._0},
						_1: {ctor: '::', _0: unexposedHints, _1: _p213._1}
					};
				}),
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			moduleDocsList);
		var exposedLists = _p211._0;
		var unexposedLists = _p211._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$List$concat(exposedLists),
			_1: _elm_lang$core$List$concat(unexposedLists)
		};
	});
var _user$project$Indexer$getExternalHints = F4(
	function (isGlobal, filePath, activeFileContents, allModuleDocs) {
		var moduleDocsToCheck = isGlobal ? A2(
			_elm_lang$core$List$filter,
			function (moduleDocs) {
				return !_elm_lang$core$Native_Utils.eq(moduleDocs.sourcePath, filePath);
			},
			allModuleDocs) : A2(
			_elm_lang$core$List$filter,
			function (moduleDocs) {
				return A2(
					_elm_lang$core$List$member,
					moduleDocs.name,
					_elm_lang$core$Dict$keys(activeFileContents.imports)) && (!_elm_lang$core$Native_Utils.eq(moduleDocs.sourcePath, filePath));
			},
			allModuleDocs);
		var _p219 = A4(_user$project$Indexer$getExposedAndUnexposedHints, isGlobal, filePath, activeFileContents.imports, moduleDocsToCheck);
		var importedHints = _p219._0;
		var unimportedHints = _p219._1;
		return {importedHints: importedHints, unimportedHints: unimportedHints};
	});
var _user$project$Indexer$All = {ctor: 'All'};
var _user$project$Indexer$getLocalHints = F3(
	function (filePath, activeFileContents, activeFileTokens) {
		var selfImport = A2(
			_elm_lang$core$Dict$singleton,
			activeFileContents.moduleDocs.name,
			{alias: _elm_lang$core$Maybe$Nothing, exposed: _user$project$Indexer$All});
		return {
			topLevelHints: _elm_lang$core$Tuple$first(
				A4(
					_user$project$Indexer$getExposedAndUnexposedHints,
					false,
					filePath,
					selfImport,
					{
						ctor: '::',
						_0: activeFileContents.moduleDocs,
						_1: {ctor: '[]'}
					})),
			variableHints: A2(
				_elm_lang$core$List$filter,
				function (hint) {
					return _elm_lang$core$Native_Utils.eq(hint.moduleName, '');
				},
				_elm_lang$core$List$concat(
					_elm_lang$core$Dict$values(activeFileTokens)))
		};
	});
var _user$project$Indexer$getImportsPlusActiveModule = function (fileContents) {
	return A3(
		_elm_lang$core$Dict$update,
		fileContents.moduleDocs.name,
		function (_p220) {
			return _elm_lang$core$Maybe$Just(
				{alias: _elm_lang$core$Maybe$Nothing, exposed: _user$project$Indexer$All});
		},
		fileContents.imports);
};
var _user$project$Indexer$Some = function (a) {
	return {ctor: 'Some', _0: a};
};
var _user$project$Indexer$None = {ctor: 'None'};
var _user$project$Indexer$toImport = function (_p221) {
	var _p222 = _p221;
	var exposedSet = function () {
		var _p223 = _p222.exposed;
		if (_p223.ctor === 'Just') {
			if (((_p223._0.ctor === '::') && (_p223._0._0 === '..')) && (_p223._0._1.ctor === '[]')) {
				return _user$project$Indexer$All;
			} else {
				return _user$project$Indexer$Some(
					_elm_lang$core$Set$fromList(_p223._0));
			}
		} else {
			return _user$project$Indexer$None;
		}
	}();
	return {
		ctor: '_Tuple2',
		_0: _p222.name,
		_1: A2(_user$project$Indexer$Import, _p222.alias, exposedSet)
	};
};
var _user$project$Indexer$defaultImports = _elm_lang$core$Dict$fromList(
	{
		ctor: '::',
		_0: A2(_user$project$Indexer_ops['=>'], 'Basics', _user$project$Indexer$All),
		_1: {
			ctor: '::',
			_0: A2(_user$project$Indexer_ops['=>'], 'Debug', _user$project$Indexer$None),
			_1: {
				ctor: '::',
				_0: A2(
					_user$project$Indexer_ops['=>'],
					'List',
					_user$project$Indexer$Some(
						_elm_lang$core$Set$fromList(
							{
								ctor: '::',
								_0: 'List',
								_1: {
									ctor: '::',
									_0: '::',
									_1: {ctor: '[]'}
								}
							}))),
				_1: {
					ctor: '::',
					_0: A2(
						_user$project$Indexer_ops['=>'],
						'Maybe',
						_user$project$Indexer$Some(
							_elm_lang$core$Set$singleton('Maybe'))),
					_1: {
						ctor: '::',
						_0: A2(
							_user$project$Indexer_ops['=>'],
							'Result',
							_user$project$Indexer$Some(
								_elm_lang$core$Set$singleton('Result'))),
						_1: {
							ctor: '::',
							_0: A2(
								_user$project$Indexer_ops['=>'],
								'Platform',
								_user$project$Indexer$Some(
									_elm_lang$core$Set$singleton('Program'))),
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'Platform.Cmd',
									_1: A2(
										_user$project$Indexer$Import,
										_elm_lang$core$Maybe$Just('Cmd'),
										_user$project$Indexer$Some(
											_elm_lang$core$Set$fromList(
												{
													ctor: '::',
													_0: 'Cmd',
													_1: {
														ctor: '::',
														_0: '!',
														_1: {ctor: '[]'}
													}
												})))
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'Platform.Sub',
										_1: A2(
											_user$project$Indexer$Import,
											_elm_lang$core$Maybe$Just('Sub'),
											_user$project$Indexer$Some(
												_elm_lang$core$Set$singleton('Sub')))
									},
									_1: {
										ctor: '::',
										_0: A2(_user$project$Indexer_ops['=>'], 'String', _user$project$Indexer$None),
										_1: {
											ctor: '::',
											_0: A2(_user$project$Indexer_ops['=>'], 'Tuple', _user$project$Indexer$None),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$Indexer$emptyFileContents = {moduleDocs: _user$project$Indexer$emptyModuleDocs, imports: _user$project$Indexer$defaultImports};
var _user$project$Indexer$getActiveFileContents = F2(
	function (maybeActiveFile, fileContentsDict) {
		var _p224 = maybeActiveFile;
		if (_p224.ctor === 'Just') {
			var _p225 = A2(_elm_lang$core$Dict$get, _p224._0.filePath, fileContentsDict);
			if (_p225.ctor === 'Just') {
				return _p225._0;
			} else {
				return _user$project$Indexer$emptyFileContents;
			}
		} else {
			return _user$project$Indexer$emptyFileContents;
		}
	});
var _user$project$Indexer$doGetImporterSourcePathsForToken = F4(
	function (maybeProjectDirectory, maybeToken, maybeIsCursorAtLastPartOfToken, model) {
		var _p226 = {ctor: '_Tuple3', _0: maybeProjectDirectory, _1: maybeToken, _2: maybeIsCursorAtLastPartOfToken};
		if ((((_p226.ctor === '_Tuple3') && (_p226._0.ctor === 'Just')) && (_p226._1.ctor === 'Just')) && (_p226._2.ctor === 'Just')) {
			var _p230 = _p226._1._0;
			var _p229 = _p226._0._0;
			var _p228 = _p226._2._0;
			var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p229, model.projectFileContentsDict);
			var activeFileContents = A2(_user$project$Indexer$getActiveFileContents, model.activeFile, fileContentsDict);
			var _p227 = _elm_lang$core$Native_Utils.eq(_p230, activeFileContents.moduleDocs.name) ? {ctor: '_Tuple2', _0: _p230, _1: true} : ((!_elm_lang$core$Native_Utils.eq(
				A2(_elm_lang$core$Dict$get, _p230, activeFileContents.imports),
				_elm_lang$core$Maybe$Nothing)) ? {ctor: '_Tuple2', _0: _p230, _1: true} : (_p228 ? {ctor: '_Tuple2', _0: _p230, _1: false} : {
				ctor: '_Tuple2',
				_0: _user$project$Indexer$getModuleName(_p230),
				_1: false
			}));
			var token = _p227._0;
			var willUseFullToken = _p227._1;
			return {
				ctor: '_Tuple2',
				_0: model,
				_1: _user$project$Indexer$importersForTokenReceivedCmd(
					{
						ctor: '_Tuple5',
						_0: _p229,
						_1: _p230,
						_2: willUseFullToken,
						_3: _p228,
						_4: A6(_user$project$Indexer$getImportersForToken, token, _p228, model.activeFile, model.activeFileTokens, activeFileContents, model.projectFileContentsDict)
					})
			};
		} else {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _user$project$Indexer$getExternalAndLocalHints = F8(
	function (isGlobal, maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs, maybeCachedExternal, maybeCachedLocal, activeFileTokens) {
		var _p231 = maybeActiveFile;
		if (_p231.ctor === 'Just') {
			var _p235 = _p231._0.projectDirectory;
			var _p234 = _p231._0.filePath;
			var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p235, projectFileContentsDict);
			var activeFileContents = A2(_user$project$Indexer$getActiveFileContents, maybeActiveFile, fileContentsDict);
			var local = function () {
				var _p232 = maybeCachedLocal;
				if (_p232.ctor === 'Just') {
					return _p232._0;
				} else {
					return A3(_user$project$Indexer$getLocalHints, _p234, activeFileContents, activeFileTokens);
				}
			}();
			var projectPackageDocs = A3(_user$project$Indexer$getProjectPackageDocs, maybeActiveFile, projectDependencies, packageDocs);
			var allModuleDocs = A2(
				_elm_lang$core$Basics_ops['++'],
				projectPackageDocs,
				A2(_user$project$Indexer$getProjectModuleDocs, _p235, projectFileContentsDict));
			var external = function () {
				var _p233 = maybeCachedExternal;
				if (_p233.ctor === 'Just') {
					return _p233._0;
				} else {
					return A4(_user$project$Indexer$getExternalHints, isGlobal, _p234, activeFileContents, allModuleDocs);
				}
			}();
			return {
				external: _elm_lang$core$Maybe$Just(external),
				local: _elm_lang$core$Maybe$Just(local)
			};
		} else {
			return {
				external: _elm_lang$core$Maybe$Just(
					{
						importedHints: {ctor: '[]'},
						unimportedHints: {ctor: '[]'}
					}),
				local: _elm_lang$core$Maybe$Just(
					{
						topLevelHints: {ctor: '[]'},
						variableHints: {ctor: '[]'}
					})
			};
		}
	});
var _user$project$Indexer$getHintsForPartial = function (partial) {
	return function (maybeInferredTipe) {
		return function (preceedingToken) {
			return function (isRegex) {
				return function (isTypeSignature) {
					return function (isFiltered) {
						return function (isGlobal) {
							return function (maybeActiveFile) {
								return function (projectFileContentsDict) {
									return function (projectDependencies) {
										return function (packageDocs) {
											return function (maybeHintsCache) {
												return function (activeFileTokens) {
													var _p236 = maybeActiveFile;
													if (_p236.ctor === 'Just') {
														var filterByPartial = A5(_user$project$Indexer$filterHintsByPartial, partial, maybeInferredTipe, isFiltered, isRegex, isTypeSignature);
														var filteredDefaultHints = filterByPartial(_user$project$Indexer$defaultSuggestions);
														var _p237 = function () {
															var _p238 = maybeHintsCache;
															if (_p238.ctor === 'Just') {
																var _p240 = _p238._0;
																var _p239 = {ctor: '_Tuple2', _0: _p240.external, _1: _p240.local};
																if ((_p239._0.ctor === 'Just') && (_p239._1.ctor === 'Just')) {
																	return _p240;
																} else {
																	return A8(_user$project$Indexer$getExternalAndLocalHints, isGlobal, maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs, _p239._0, _p239._1, activeFileTokens);
																}
															} else {
																return A8(_user$project$Indexer$getExternalAndLocalHints, isGlobal, maybeActiveFile, projectFileContentsDict, projectDependencies, packageDocs, _elm_lang$core$Maybe$Nothing, _elm_lang$core$Maybe$Nothing, activeFileTokens);
															}
														}();
														var external = _p237.external;
														var local = _p237.local;
														var _p241 = function () {
															var _p242 = {ctor: '_Tuple2', _0: external, _1: local};
															if (((_p242.ctor === '_Tuple2') && (_p242._0.ctor === 'Just')) && (_p242._1.ctor === 'Just')) {
																var _p244 = _p242._1._0;
																var _p243 = _p242._0._0;
																return {
																	ctor: '_Tuple3',
																	_0: A2(_elm_lang$core$Basics_ops['++'], _p243.importedHints, _p244.topLevelHints),
																	_1: _p243.unimportedHints,
																	_2: _p244.variableHints
																};
															} else {
																return {
																	ctor: '_Tuple3',
																	_0: {ctor: '[]'},
																	_1: {ctor: '[]'},
																	_2: {ctor: '[]'}
																};
															}
														}();
														var exposedAndTopLevelHints = _p241._0;
														var unexposedHints = _p241._1;
														var variableHints = _p241._2;
														var filteredExposedHints = filterByPartial(exposedAndTopLevelHints);
														var filteredUnexposedHints = filterByPartial(unexposedHints);
														var filteredVariableHints = filterByPartial(variableHints);
														var hints = function () {
															var _p245 = maybeInferredTipe;
															if (_p245.ctor === 'Just') {
																var _p250 = _p245._0;
																var partitionHints = function (hints) {
																	return A2(
																		_elm_lang$core$List$partition,
																		A2(_user$project$Indexer$partitionByTipe, _p250, preceedingToken),
																		hints);
																};
																var _p246 = partitionHints(filteredVariableHints);
																var variableHintsCompatible = _p246._0;
																var variableHintsNotCompatible = _p246._1;
																var _p247 = partitionHints(filteredDefaultHints);
																var defaultHintsCompatible = _p247._0;
																var defaultHintsNotCompatible = _p247._1;
																var _p248 = partitionHints(filteredExposedHints);
																var exposedHintsCompatible = _p248._0;
																var exposedHintsNotCompatible = _p248._1;
																var _p249 = partitionHints(filteredUnexposedHints);
																var unexposedHintsCompatible = _p249._0;
																var unexposedHintsNotCompatible = _p249._1;
																return A2(
																	_elm_lang$core$Basics_ops['++'],
																	A3(_user$project$Indexer$sortHintsByScore, _p250, preceedingToken, variableHintsCompatible),
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		A3(_user$project$Indexer$sortHintsByScore, _p250, preceedingToken, defaultHintsCompatible),
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			A3(_user$project$Indexer$sortHintsByScore, _p250, preceedingToken, exposedHintsCompatible),
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				A3(_user$project$Indexer$sortHintsByScore, _p250, preceedingToken, unexposedHintsCompatible),
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					_user$project$Indexer$sortHintsByName(
																						A2(
																							_elm_lang$core$Basics_ops['++'],
																							A4(_user$project$Indexer$filterTypeIncompatibleHints, partial, isFiltered, isRegex, variableHintsNotCompatible),
																							A2(
																								_elm_lang$core$Basics_ops['++'],
																								A4(_user$project$Indexer$filterTypeIncompatibleHints, partial, isFiltered, isRegex, defaultHintsNotCompatible),
																								A4(_user$project$Indexer$filterTypeIncompatibleHints, partial, isFiltered, isRegex, exposedHintsNotCompatible)))),
																					_user$project$Indexer$sortHintsByName(
																						A4(_user$project$Indexer$filterTypeIncompatibleHints, partial, isFiltered, isRegex, unexposedHintsNotCompatible)))))));
															} else {
																return function (hints) {
																	return isFiltered ? _user$project$Indexer$sortHintsByName(hints) : hints;
																}(
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		filteredVariableHints,
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			filteredDefaultHints,
																			A2(_elm_lang$core$Basics_ops['++'], filteredExposedHints, filteredUnexposedHints))));
															}
														}();
														return {
															ctor: '_Tuple2',
															_0: hints,
															_1: _elm_lang$core$Maybe$Just(
																{external: external, local: local})
														};
													} else {
														return {
															ctor: '_Tuple2',
															_0: {ctor: '[]'},
															_1: maybeHintsCache
														};
													}
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Indexer$doGetHintsForPartial = F8(
	function (partial, maybeInferredTipe, preceedingToken, isRegex, isTypeSignature, isFiltered, isGlobal, model) {
		var _p251 = _user$project$Indexer$getHintsForPartial(partial)(maybeInferredTipe)(preceedingToken)(isRegex)(isTypeSignature)(isFiltered)(isGlobal)(model.activeFile)(model.projectFileContentsDict)(model.projectDependencies)(model.packageDocs)(model.hintsCache)(model.activeFileTokens);
		var hints = _p251._0;
		var updatedHintsCache = _p251._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{hintsCache: updatedHintsCache}),
			_1: _user$project$Indexer$hintsForPartialReceivedCmd(
				{
					ctor: '_Tuple2',
					_0: partial,
					_1: A2(
						_elm_lang$core$List$map,
						A2(_user$project$Indexer$encodeHint, model.config.showAliasesOfType, model.activeFileTokens),
						hints)
				})
		};
	});
var _user$project$Indexer$getImportsPlusActiveModuleForActiveFile = F2(
	function (maybeActiveFile, fileContentsDict) {
		return _user$project$Indexer$getImportsPlusActiveModule(
			A2(_user$project$Indexer$getActiveFileContents, maybeActiveFile, fileContentsDict));
	});
var _user$project$Indexer$getActiveFileTokens = F5(
	function (maybeActiveFile, maybeActiveTopLevel, projectFileContentsDict, projectDependencies, packageDocs) {
		var _p252 = maybeActiveFile;
		if (_p252.ctor === 'Just') {
			var _p259 = _p252._0.projectDirectory;
			var _p258 = _p252._0.filePath;
			var insert = F2(
				function (_p253, dict) {
					var _p254 = _p253;
					return A3(
						_elm_lang$core$Dict$update,
						_p254._0,
						function (value) {
							return _elm_lang$core$Maybe$Just(
								{
									ctor: '::',
									_0: _p254._1,
									_1: A2(
										_elm_lang$core$Maybe$withDefault,
										{ctor: '[]'},
										value)
								});
						},
						dict);
				});
			var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p259, projectFileContentsDict);
			var getHints = function (moduleDocs) {
				return A2(
					_elm_lang$core$Maybe$map,
					A2(_user$project$Indexer$getFilteredHints, _p258, moduleDocs),
					A2(
						_elm_lang$core$Dict$get,
						moduleDocs.name,
						A2(_user$project$Indexer$getImportsPlusActiveModuleForActiveFile, maybeActiveFile, fileContentsDict)));
			};
			var projectPackageDocs = A3(_user$project$Indexer$getProjectPackageDocs, maybeActiveFile, projectDependencies, packageDocs);
			var topLevelTokens = A3(
				_elm_lang$core$List$foldl,
				insert,
				_elm_lang$core$Dict$empty,
				_elm_lang$core$List$concat(
					A2(
						_elm_lang$core$List$filterMap,
						getHints,
						A2(
							_elm_lang$core$Basics_ops['++'],
							projectPackageDocs,
							A2(_user$project$Indexer$getProjectModuleDocs, _p259, projectFileContentsDict)))));
			var topLevelArgTipePairs = A2(
				_elm_lang$core$List$concatMap,
				function (_p255) {
					var _p256 = _p255;
					return A3(
						_elm_lang$core$List$map2,
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						_p256.args,
						_user$project$Indexer$getTipeParts(_p256.tipe));
				},
				A2(_user$project$Indexer$getHintsForToken, maybeActiveTopLevel, topLevelTokens));
			var argumentHints = function () {
				var _p257 = maybeActiveTopLevel;
				if (_p257.ctor === 'Just') {
					return A2(
						_elm_lang$core$List$concatMap,
						A3(
							_user$project$Indexer$topLevelArgToHints,
							_p258,
							{ctor: '_Tuple4', _0: maybeActiveFile, _1: projectFileContentsDict, _2: projectDependencies, _3: packageDocs},
							topLevelTokens),
						topLevelArgTipePairs);
				} else {
					return {ctor: '[]'};
				}
			}();
			var activeFileTokens = A3(
				_elm_lang$core$List$foldl,
				insert,
				topLevelTokens,
				A2(
					_elm_lang$core$Basics_ops['++'],
					argumentHints,
					A2(
						_elm_lang$core$List$map,
						function (hint) {
							return {ctor: '_Tuple2', _0: hint.name, _1: hint};
						},
						A2(
							_elm_lang$core$List$filter,
							function (hint) {
								return !_elm_lang$core$Native_Utils.eq(hint.comment, '');
							},
							_user$project$Indexer$defaultSuggestions))));
			return activeFileTokens;
		} else {
			return _elm_lang$core$Dict$empty;
		}
	});
var _user$project$Indexer$topLevelArgToHints = F4(
	function (parentSourcePath, _p261, topLevelTokens, _p260) {
		var _p262 = _p261;
		var _p274 = _p262._1;
		var _p273 = _p262._2;
		var _p272 = _p262._3;
		var _p271 = _p262._0;
		var _p263 = _p260;
		var _p270 = _p263._1;
		var _p269 = _p263._0;
		var tipes = function () {
			var getRecordFields = function (tipeString) {
				return _elm_lang$core$List$concat(
					A2(
						_elm_lang$core$List$filterMap,
						function (field) {
							return A2(
								_elm_lang$core$Maybe$map,
								function (tipeString) {
									return A5(
										_user$project$Indexer$getRecordFieldTokens,
										field,
										tipeString,
										parentSourcePath,
										{ctor: '_Tuple4', _0: _p271, _1: _p274, _2: _p273, _3: _p272},
										topLevelTokens);
								},
								A2(
									_elm_lang$core$Dict$get,
									field,
									_elm_lang$core$Dict$fromList(
										_user$project$Indexer$getRecordTipeParts(tipeString))));
						},
						_user$project$Indexer$getRecordArgParts(_p269)));
			};
			var _p264 = {
				ctor: '_Tuple2',
				_0: _user$project$Indexer$isRecordString(_p269),
				_1: _user$project$Indexer$isRecordString(_p270)
			};
			if (_p264._0 === true) {
				if (_p264._1 === true) {
					return getRecordFields(_p270);
				} else {
					var _p265 = _elm_lang$core$List$head(
						A2(
							_user$project$Indexer$getHintsForToken,
							_elm_lang$core$Maybe$Just(_p270),
							topLevelTokens));
					if (_p265.ctor === 'Just') {
						return getRecordFields(_p265._0.tipe);
					} else {
						return {ctor: '[]'};
					}
				}
			} else {
				return A5(
					_user$project$Indexer$getRecordFieldTokens,
					_p269,
					_p270,
					parentSourcePath,
					{ctor: '_Tuple4', _0: _p271, _1: _p274, _2: _p273, _3: _p272},
					topLevelTokens);
			}
		}();
		var getHint = function (_p266) {
			var _p267 = _p266;
			var _p268 = _p267._0;
			var hint = {
				name: _p268,
				moduleName: '',
				sourcePath: '',
				comment: '',
				tipe: _p267._1,
				args: {ctor: '[]'},
				caseTipe: _elm_lang$core$Maybe$Nothing,
				cases: {ctor: '[]'},
				associativity: _elm_lang$core$Maybe$Nothing,
				precedence: _elm_lang$core$Maybe$Nothing,
				kind: _user$project$Indexer$KindVariable,
				isImported: true
			};
			return {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: _p268, _1: hint},
				_1: {ctor: '[]'}
			};
		};
		return A2(_elm_lang$core$List$concatMap, getHint, tipes);
	});
var _user$project$Indexer$getRecordFieldTokens = F5(
	function (name, tipeString, parentSourcePath, _p275, topLevelTokens) {
		var _p276 = _p275;
		return A8(
			_user$project$Indexer$getRecordFieldTokensRecur,
			name,
			tipeString,
			parentSourcePath,
			{ctor: '_Tuple4', _0: _p276._0, _1: _p276._1, _2: _p276._2, _3: _p276._3},
			topLevelTokens,
			true,
			_elm_lang$core$Maybe$Nothing,
			_elm_lang$core$Set$empty);
	});
var _user$project$Indexer$getRecordFieldTokensRecur = F8(
	function (name, tipeString, parentSourcePath, _p277, topLevelTokens, shouldAddSelf, maybeRootTipeString, visitedSourcePaths) {
		var _p278 = _p277;
		var _p293 = _p278._1;
		var _p292 = _p278._2;
		var _p291 = _p278._3;
		var _p290 = _p278._0;
		return A2(
			_elm_lang$core$List$append,
			function () {
				if (_user$project$Indexer$isRecordString(name)) {
					var getRecordFields = function (tipeString2) {
						return _elm_lang$core$List$concat(
							A2(
								_elm_lang$core$List$filterMap,
								function (field) {
									return A2(
										_elm_lang$core$Maybe$map,
										function (tipeString) {
											return A8(
												_user$project$Indexer$getRecordFieldTokensRecur,
												field,
												tipeString,
												parentSourcePath,
												{ctor: '_Tuple4', _0: _p290, _1: _p293, _2: _p292, _3: _p291},
												topLevelTokens,
												true,
												maybeRootTipeString,
												visitedSourcePaths);
										},
										A2(
											_elm_lang$core$Dict$get,
											field,
											_elm_lang$core$Dict$fromList(
												_user$project$Indexer$getRecordTipeParts(tipeString2))));
								},
								_user$project$Indexer$getRecordArgParts(name)));
					};
					if (_user$project$Indexer$isRecordString(tipeString)) {
						return getRecordFields(tipeString);
					} else {
						var _p279 = _elm_lang$core$List$head(
							A2(
								_user$project$Indexer$getHintsForToken,
								_elm_lang$core$Maybe$Just(tipeString),
								topLevelTokens));
						if (_p279.ctor === 'Just') {
							return getRecordFields(_p279._0.tipe);
						} else {
							return {ctor: '[]'};
						}
					}
				} else {
					if (_user$project$Indexer$isRecordString(tipeString)) {
						return A2(
							_elm_lang$core$List$concatMap,
							function (_p280) {
								var _p281 = _p280;
								return A8(
									_user$project$Indexer$getRecordFieldTokensRecur,
									A2(
										_elm_lang$core$Basics_ops['++'],
										name,
										A2(_elm_lang$core$Basics_ops['++'], '.', _p281._0)),
									_p281._1,
									parentSourcePath,
									{ctor: '_Tuple4', _0: _p290, _1: _p293, _2: _p292, _3: _p291},
									topLevelTokens,
									true,
									maybeRootTipeString,
									visitedSourcePaths);
							},
							_user$project$Indexer$getRecordTipeParts(tipeString));
					} else {
						if (_user$project$Indexer$isTupleString(name) && _user$project$Indexer$isTupleString(tipeString)) {
							return _elm_lang$core$List$concat(
								A2(
									_elm_lang$core$List$map,
									function (_p282) {
										var _p283 = _p282;
										return A8(
											_user$project$Indexer$getRecordFieldTokensRecur,
											_p283._0,
											_p283._1,
											parentSourcePath,
											{ctor: '_Tuple4', _0: _p290, _1: _p293, _2: _p292, _3: _p291},
											topLevelTokens,
											true,
											maybeRootTipeString,
											visitedSourcePaths);
									},
									A3(
										_elm_lang$core$List$map2,
										F2(
											function (v0, v1) {
												return {ctor: '_Tuple2', _0: v0, _1: v1};
											}),
										_user$project$Indexer$getTupleParts(name),
										_user$project$Indexer$getTupleParts(tipeString))));
						} else {
							var _p285 = _elm_lang$core$List$head(
								A2(
									_elm_lang$core$Basics$uncurry,
									F2(
										function (x, y) {
											return A2(_elm_lang$core$Basics_ops['++'], x, y);
										}),
									A2(
										_elm_lang$core$List$partition,
										function (_p284) {
											return _user$project$Indexer$isRecordString(
												function (_) {
													return _.tipe;
												}(_p284));
										},
										A2(
											_user$project$Indexer$getHintsForToken,
											_elm_lang$core$Maybe$Just(tipeString),
											topLevelTokens))));
							if (_p285.ctor === 'Just') {
								var _p289 = _p285._0;
								if ((!_elm_lang$core$Native_Utils.eq(_p289.kind, _user$project$Indexer$KindType)) && ((!_elm_lang$core$Native_Utils.eq(_p289.tipe, tipeString)) && (!A2(_elm_lang$core$Set$member, _p289.sourcePath, visitedSourcePaths)))) {
									var updatedVisitedSourcePaths = A2(_elm_lang$core$Set$insert, _p289.sourcePath, visitedSourcePaths);
									var maybeNewActiveFile = function () {
										var _p286 = _p290;
										if (_p286.ctor === 'Just') {
											return _elm_lang$core$Maybe$Just(
												_elm_lang$core$Native_Utils.update(
													_p286._0,
													{filePath: _p289.sourcePath}));
										} else {
											return _elm_lang$core$Maybe$Nothing;
										}
									}();
									var _p287 = {
										ctor: '_Tuple2',
										_0: _p289.sourcePath,
										_1: ((!_elm_lang$core$Native_Utils.eq(_p289.sourcePath, parentSourcePath)) && _user$project$Indexer$isProjectSourcePath(_p289.sourcePath)) ? A5(_user$project$Indexer$getActiveFileTokens, maybeNewActiveFile, _elm_lang$core$Maybe$Nothing, _p293, _p292, _p291) : topLevelTokens
									};
									var newParentSourcePath = _p287._0;
									var newTokens = _p287._1;
									var _p288 = maybeRootTipeString;
									if (_p288.ctor === 'Just') {
										return (!_elm_lang$core$Native_Utils.eq(_p289.name, _p288._0)) ? A8(
											_user$project$Indexer$getRecordFieldTokensRecur,
											name,
											_p289.tipe,
											newParentSourcePath,
											{ctor: '_Tuple4', _0: maybeNewActiveFile, _1: _p293, _2: _p292, _3: _p291},
											newTokens,
											false,
											_elm_lang$core$Maybe$Just(_p289.name),
											updatedVisitedSourcePaths) : {ctor: '[]'};
									} else {
										return A8(
											_user$project$Indexer$getRecordFieldTokensRecur,
											name,
											_p289.tipe,
											newParentSourcePath,
											{ctor: '_Tuple4', _0: maybeNewActiveFile, _1: _p293, _2: _p292, _3: _p291},
											newTokens,
											false,
											_elm_lang$core$Maybe$Just(_p289.name),
											updatedVisitedSourcePaths);
									}
								} else {
									return {ctor: '[]'};
								}
							} else {
								return {ctor: '[]'};
							}
						}
					}
				}
			}(),
			shouldAddSelf ? {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: name, _1: tipeString},
				_1: {ctor: '[]'}
			} : {ctor: '[]'});
	});
var _user$project$Indexer$doUpdateActiveTokenHints = F3(
	function (maybeActiveTopLevel, maybeToken, model) {
		var updatedActiveFileTokens = function () {
			var _p294 = maybeToken;
			if (_p294.ctor === 'Nothing') {
				return model.activeFileTokens;
			} else {
				if (_p294._0 === '') {
					return model.activeFileTokens;
				} else {
					return (!_elm_lang$core$Native_Utils.eq(model.activeTopLevel, maybeActiveTopLevel)) ? A5(_user$project$Indexer$getActiveFileTokens, model.activeFile, maybeActiveTopLevel, model.projectFileContentsDict, model.projectDependencies, model.packageDocs) : model.activeFileTokens;
				}
			}
		}();
		var updatedActiveTokenHints = function () {
			var _p295 = maybeToken;
			if (_p295.ctor === 'Nothing') {
				return {ctor: '[]'};
			} else {
				if (_p295._0 === '') {
					return {ctor: '[]'};
				} else {
					return A2(_user$project$Indexer$getHintsForToken, maybeToken, updatedActiveFileTokens);
				}
			}
		}();
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{activeTopLevel: maybeActiveTopLevel, activeFileTokens: updatedActiveFileTokens, activeToken: maybeToken, activeTokenHints: updatedActiveTokenHints}),
			_1: _user$project$Indexer$activeTokenHintsChangedCmd(
				{
					ctor: '_Tuple2',
					_0: A2(_elm_lang$core$Maybe$withDefault, '', maybeToken),
					_1: A2(
						_elm_lang$core$List$map,
						A2(_user$project$Indexer$encodeHint, model.config.showAliasesOfType, updatedActiveFileTokens),
						updatedActiveTokenHints)
				})
		};
	});
var _user$project$Indexer$doGetTokenInfo = F5(
	function (maybeProjectDirectory, maybeFilePath, maybeActiveTopLevel, maybeToken, model) {
		var _p296 = {ctor: '_Tuple2', _0: maybeProjectDirectory, _1: maybeFilePath};
		if (((_p296.ctor === '_Tuple2') && (_p296._0.ctor === 'Just')) && (_p296._1.ctor === 'Just')) {
			var _p299 = _p296._0._0;
			var _p298 = _p296._1._0;
			var fileTokens = function () {
				var _p297 = model.activeFile;
				if (_p297.ctor === 'Just') {
					return (_elm_lang$core$Native_Utils.eq(_p297._0.filePath, _p298) && _elm_lang$core$Native_Utils.eq(model.activeTopLevel, maybeActiveTopLevel)) ? model.activeFileTokens : A5(
						_user$project$Indexer$getActiveFileTokens,
						_elm_lang$core$Maybe$Just(
							{filePath: _p298, projectDirectory: _p299}),
						maybeActiveTopLevel,
						model.projectFileContentsDict,
						model.projectDependencies,
						model.packageDocs);
				} else {
					return A5(
						_user$project$Indexer$getActiveFileTokens,
						_elm_lang$core$Maybe$Just(
							{filePath: _p298, projectDirectory: _p299}),
						maybeActiveTopLevel,
						model.projectFileContentsDict,
						model.projectDependencies,
						model.packageDocs);
				}
			}();
			var tokenHints = A2(_user$project$Indexer$getHintsForToken, maybeToken, fileTokens);
			return {
				ctor: '_Tuple2',
				_0: model,
				_1: _user$project$Indexer$tokenInfoReceivedCmd(
					A2(
						_elm_lang$core$List$map,
						A2(_user$project$Indexer$encodeHint, model.config.showAliasesOfType, fileTokens),
						tokenHints))
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: model,
				_1: _user$project$Indexer$tokenInfoReceivedCmd(
					{ctor: '[]'})
			};
		}
	});
var _user$project$Indexer$doUpdateActiveFile = F4(
	function (maybeActiveFile, maybeActiveTopLevel, maybeToken, model) {
		var updatedActiveFileTokens = ((!_elm_lang$core$Native_Utils.eq(model.activeFile, maybeActiveFile)) || (!_elm_lang$core$Native_Utils.eq(model.activeTopLevel, maybeActiveTopLevel))) ? A5(_user$project$Indexer$getActiveFileTokens, maybeActiveFile, maybeActiveTopLevel, model.projectFileContentsDict, model.projectDependencies, model.packageDocs) : model.activeFileTokens;
		var updatedActiveTokenHints = A2(_user$project$Indexer$getHintsForToken, maybeToken, updatedActiveFileTokens);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{activeFile: maybeActiveFile, activeTopLevel: maybeActiveTopLevel, activeFileTokens: updatedActiveFileTokens, activeToken: maybeToken, activeTokenHints: updatedActiveTokenHints, hintsCache: _elm_lang$core$Maybe$Nothing}),
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: _user$project$Indexer$activeFileChangedCmd(maybeActiveFile),
					_1: {
						ctor: '::',
						_0: _user$project$Indexer$activeTokenHintsChangedCmd(
							{
								ctor: '_Tuple2',
								_0: A2(_elm_lang$core$Maybe$withDefault, '', maybeToken),
								_1: A2(
									_elm_lang$core$List$map,
									A2(_user$project$Indexer$encodeHint, model.config.showAliasesOfType, updatedActiveFileTokens),
									updatedActiveTokenHints)
							}),
						_1: {ctor: '[]'}
					}
				})
		};
	});
var _user$project$Indexer$doUpdateFileContents = F4(
	function (filePath, projectDirectory, fileContents, model) {
		var updatedProjectFileContentsDict = A4(_user$project$Indexer$updateFileContents, filePath, projectDirectory, fileContents, model.projectFileContentsDict);
		var updatedActiveFileTokens = A5(_user$project$Indexer$getActiveFileTokens, model.activeFile, model.activeTopLevel, updatedProjectFileContentsDict, model.projectDependencies, model.packageDocs);
		var updatedHintsCache = function () {
			var _p300 = model.hintsCache;
			if (_p300.ctor === 'Just') {
				var _p304 = _p300._0;
				var _p301 = _p304.external;
				if (_p301.ctor === 'Just') {
					var _p302 = model.activeFile;
					if (_p302.ctor === 'Just') {
						var _p303 = _p302._0;
						var newFileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p303.projectDirectory, updatedProjectFileContentsDict);
						var newActiveFileContents = A2(_user$project$Indexer$getActiveFileContents, model.activeFile, newFileContentsDict);
						var oldFileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p303.projectDirectory, model.projectFileContentsDict);
						var oldActiveFileContents = A2(_user$project$Indexer$getActiveFileContents, model.activeFile, oldFileContentsDict);
						var projectPackageDocs = A3(_user$project$Indexer$getProjectPackageDocs, model.activeFile, model.projectDependencies, model.packageDocs);
						return (_elm_lang$core$Native_Utils.eq(_p303.filePath, filePath) && (!_elm_lang$core$Native_Utils.eq(oldActiveFileContents.imports, newActiveFileContents.imports))) ? _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								_p304,
								{external: _elm_lang$core$Maybe$Nothing})) : model.hintsCache;
					} else {
						return model.hintsCache;
					}
				} else {
					return model.hintsCache;
				}
			} else {
				return model.hintsCache;
			}
		}();
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{projectFileContentsDict: updatedProjectFileContentsDict, activeFileTokens: updatedActiveFileTokens, hintsCache: updatedHintsCache}),
			_1: _user$project$Indexer$activeFileChangedCmd(model.activeFile)
		};
	});
var _user$project$Indexer$doRemoveFileContents = F3(
	function (filePath, projectDirectory, model) {
		var updatedProjectFileContentsDict = function () {
			var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, projectDirectory, model.projectFileContentsDict);
			var updatedFileContentsDict = A2(_elm_lang$core$Dict$remove, filePath, fileContentsDict);
			return A3(
				_elm_lang$core$Dict$update,
				projectDirectory,
				function (_p305) {
					return _elm_lang$core$Maybe$Just(updatedFileContentsDict);
				},
				model.projectFileContentsDict);
		}();
		var updatedActiveFileTokens = A5(_user$project$Indexer$getActiveFileTokens, model.activeFile, model.activeTopLevel, updatedProjectFileContentsDict, model.projectDependencies, model.packageDocs);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{projectFileContentsDict: updatedProjectFileContentsDict, activeFileTokens: updatedActiveFileTokens, hintsCache: _elm_lang$core$Maybe$Nothing}),
			_1: _user$project$Indexer$activeFileChangedCmd(model.activeFile)
		};
	});
var _user$project$Indexer$addLoadedPackageDocs = F2(
	function (loadedPackageDocs, model) {
		var existingPackages = A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.sourcePath;
			},
			model.packageDocs);
		var missingPackageDocs = A2(
			_elm_lang$core$List$filter,
			function (_p306) {
				var _p307 = _p306;
				return !A2(_elm_lang$core$List$member, _p307.sourcePath, existingPackages);
			},
			loadedPackageDocs);
		var updatedPackageDocs = A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_elm_lang$core$List$map, _user$project$Indexer$truncateModuleComment, missingPackageDocs),
			model.packageDocs);
		var updatedActiveFileTokens = A5(_user$project$Indexer$getActiveFileTokens, model.activeFile, model.activeTopLevel, model.projectFileContentsDict, model.projectDependencies, updatedPackageDocs);
		return _elm_lang$core$Native_Utils.update(
			model,
			{packageDocs: updatedPackageDocs, activeFileTokens: updatedActiveFileTokens});
	});
var _user$project$Indexer$getFunctionsMatchingType = F6(
	function (tipeString, maybeProjectDirectory, maybeFilePath, projectFileContentsDict, projectDependencies, packageDocs) {
		var _p308 = {ctor: '_Tuple2', _0: maybeProjectDirectory, _1: maybeFilePath};
		if (((_p308.ctor === '_Tuple2') && (_p308._0.ctor === 'Just')) && (_p308._1.ctor === 'Just')) {
			var activeFile = _elm_lang$core$Maybe$Just(
				{projectDirectory: _p308._0._0, filePath: _p308._1._0});
			var activeFileTokens = A5(_user$project$Indexer$getActiveFileTokens, activeFile, _elm_lang$core$Maybe$Nothing, projectFileContentsDict, projectDependencies, packageDocs);
			var _p309 = A8(_user$project$Indexer$getExternalAndLocalHints, true, activeFile, projectFileContentsDict, projectDependencies, packageDocs, _elm_lang$core$Maybe$Nothing, _elm_lang$core$Maybe$Nothing, activeFileTokens);
			var external = _p309.external;
			var local = _p309.local;
			var _p310 = function () {
				var _p311 = {ctor: '_Tuple2', _0: external, _1: local};
				if (((_p311.ctor === '_Tuple2') && (_p311._0.ctor === 'Just')) && (_p311._1.ctor === 'Just')) {
					var _p313 = _p311._1._0;
					var _p312 = _p311._0._0;
					return {
						ctor: '_Tuple3',
						_0: A2(_elm_lang$core$Basics_ops['++'], _p312.importedHints, _p313.topLevelHints),
						_1: _p312.unimportedHints,
						_2: _p313.variableHints
					};
				} else {
					return {
						ctor: '_Tuple3',
						_0: {ctor: '[]'},
						_1: {ctor: '[]'},
						_2: {ctor: '[]'}
					};
				}
			}();
			var exposedAndTopLevelHints = _p310._0;
			var unexposedHints = _p310._1;
			var variableHints = _p310._2;
			return A2(
				_elm_lang$core$List$filter,
				function (hint) {
					return A2(_user$project$Indexer$areMatchingTypes, tipeString, hint.tipe);
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					exposedAndTopLevelHints,
					A2(_elm_lang$core$Basics_ops['++'], unexposedHints, variableHints)));
		} else {
			return {ctor: '[]'};
		}
	});
var _user$project$Indexer$doGetFunctionsMatchingType = F4(
	function (tipeString, maybeProjectDirectory, maybeFilePath, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$functionsMatchingTypeReceivedCmd(
				A2(
					_elm_lang$core$List$map,
					A2(_user$project$Indexer$encodeHint, model.config.showAliasesOfType, _elm_lang$core$Dict$empty),
					A6(_user$project$Indexer$getFunctionsMatchingType, tipeString, maybeProjectDirectory, maybeFilePath, model.projectFileContentsDict, model.projectDependencies, model.packageDocs)))
		};
	});
var _user$project$Indexer$getSourcePathOfRecordFieldTokenRecur = F7(
	function (parentPartName, parentName, parentSourcePath, tailParts, _p314, rootTokens, tokens) {
		getSourcePathOfRecordFieldTokenRecur:
		while (true) {
			var _p315 = _p314;
			var _p334 = _p315._1;
			var _p333 = _p315._2;
			var _p332 = _p315._3;
			var _p331 = _p315._0;
			var _p316 = _elm_lang$core$List$head(tailParts);
			if (_p316.ctor === 'Just') {
				var _p330 = _p316._0;
				var doDefault = function (parentHint) {
					return _elm_lang$core$Native_Utils.eq(parentHint.sourcePath, '') ? A2(
						_elm_lang$core$Basics_ops['++'],
						parentSourcePath,
						A2(_elm_lang$core$Basics_ops['++'], _user$project$Indexer$filePathSeparator, parentHint.tipe)) : A2(
						_elm_lang$core$Basics_ops['++'],
						parentHint.sourcePath,
						A2(_elm_lang$core$Basics_ops['++'], _user$project$Indexer$filePathSeparator, parentHint.tipe));
				};
				var newPrefixSourcePath = function () {
					var _p317 = _elm_lang$core$List$head(
						A2(
							_user$project$Indexer$getHintsForToken,
							_elm_lang$core$Maybe$Just(parentName),
							tokens));
					if (_p317.ctor === 'Just') {
						var _p320 = _p317._0;
						if (_user$project$Indexer$isRecordString(_p320.tipe)) {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								parentSourcePath,
								A2(_elm_lang$core$Basics_ops['++'], _user$project$Indexer$filePathSeparator, parentPartName));
						} else {
							var _p318 = _elm_lang$core$List$head(
								A2(
									_user$project$Indexer$getHintsForToken,
									_elm_lang$core$Maybe$Just(_p320.tipe),
									tokens));
							if (_p318.ctor === 'Just') {
								var _p319 = _p318._0;
								return (!_elm_lang$core$Native_Utils.eq(_p319.sourcePath, parentSourcePath)) ? A2(
									_elm_lang$core$Basics_ops['++'],
									_p319.sourcePath,
									A2(_elm_lang$core$Basics_ops['++'], _user$project$Indexer$filePathSeparator, _p319.name)) : doDefault(_p320);
							} else {
								return doDefault(_p320);
							}
						}
					} else {
						var _p321 = _elm_lang$core$List$head(
							A2(
								_user$project$Indexer$getHintsForToken,
								_elm_lang$core$Maybe$Just(parentName),
								rootTokens));
						if (_p321.ctor === 'Just') {
							var _p324 = _p321._0;
							var _p322 = _elm_lang$core$List$head(
								A2(
									_user$project$Indexer$getHintsForToken,
									_elm_lang$core$Maybe$Just(_p324.tipe),
									tokens));
							if (_p322.ctor === 'Just') {
								var _p323 = _p322._0;
								return (!_elm_lang$core$Native_Utils.eq(_p323.sourcePath, parentSourcePath)) ? A2(
									_elm_lang$core$Basics_ops['++'],
									_p323.sourcePath,
									A2(_elm_lang$core$Basics_ops['++'], _user$project$Indexer$filePathSeparator, _p323.name)) : doDefault(_p324);
							} else {
								return doDefault(_p324);
							}
						} else {
							return parentSourcePath;
						}
					}
				}();
				var _p325 = function () {
					var _p326 = {
						ctor: '_Tuple2',
						_0: _elm_lang$core$List$head(
							A2(_elm_lang$core$String$split, _user$project$Indexer$filePathSeparator, parentSourcePath)),
						_1: _elm_lang$core$List$head(
							A2(_elm_lang$core$String$split, _user$project$Indexer$filePathSeparator, newPrefixSourcePath))
					};
					if (((_p326.ctor === '_Tuple2') && (_p326._0.ctor === 'Just')) && (_p326._1.ctor === 'Just')) {
						var _p329 = _p326._1._0;
						var maybeNewActiveFile = function () {
							var _p327 = _p331;
							if (_p327.ctor === 'Just') {
								return _elm_lang$core$Maybe$Just(
									_elm_lang$core$Native_Utils.update(
										_p327._0,
										{filePath: _p329}));
							} else {
								return _elm_lang$core$Maybe$Nothing;
							}
						}();
						var _p328 = maybeNewActiveFile;
						if (_p328.ctor === 'Just') {
							return ((!_elm_lang$core$Native_Utils.eq(_p326._0._0, _p329)) && _user$project$Indexer$isProjectSourcePath(_p329)) ? {
								ctor: '_Tuple2',
								_0: maybeNewActiveFile,
								_1: A5(_user$project$Indexer$getActiveFileTokens, maybeNewActiveFile, _elm_lang$core$Maybe$Nothing, _p334, _p333, _p332)
							} : {ctor: '_Tuple2', _0: _p331, _1: tokens};
						} else {
							return {ctor: '_Tuple2', _0: _p331, _1: tokens};
						}
					} else {
						return {ctor: '_Tuple2', _0: _p331, _1: tokens};
					}
				}();
				var updatedActiveFile = _p325._0;
				var updatedTokens = _p325._1;
				var _v221 = _p330,
					_v222 = A2(
					_elm_lang$core$Basics_ops['++'],
					parentName,
					A2(_elm_lang$core$Basics_ops['++'], '.', _p330)),
					_v223 = newPrefixSourcePath,
					_v224 = A2(
					_elm_lang$core$Maybe$withDefault,
					{ctor: '[]'},
					_elm_lang$core$List$tail(tailParts)),
					_v225 = {ctor: '_Tuple4', _0: updatedActiveFile, _1: _p334, _2: _p333, _3: _p332},
					_v226 = rootTokens,
					_v227 = updatedTokens;
				parentPartName = _v221;
				parentName = _v222;
				parentSourcePath = _v223;
				tailParts = _v224;
				_p314 = _v225;
				rootTokens = _v226;
				tokens = _v227;
				continue getSourcePathOfRecordFieldTokenRecur;
			} else {
				return parentSourcePath;
			}
		}
	});
var _user$project$Indexer$getSourcePathOfRecordFieldToken = F5(
	function (name, filePath, maybeActiveTopLevel, _p335, tokens) {
		var _p336 = _p335;
		var parts = A2(_elm_lang$core$String$split, '.', name);
		if (_elm_lang$core$Native_Utils.eq(
			_elm_lang$core$List$length(parts),
			1)) {
			var _p337 = maybeActiveTopLevel;
			if (_p337.ctor === 'Just') {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					filePath,
					A2(_elm_lang$core$Basics_ops['++'], _user$project$Indexer$filePathSeparator, _p337._0));
			} else {
				return '';
			}
		} else {
			var _p338 = _elm_lang$core$List$head(parts);
			if (_p338.ctor === 'Just') {
				var _p339 = _p338._0;
				return A7(
					_user$project$Indexer$getSourcePathOfRecordFieldTokenRecur,
					_p339,
					_p339,
					filePath,
					A2(
						_elm_lang$core$Maybe$withDefault,
						{ctor: '[]'},
						_elm_lang$core$List$tail(parts)),
					{ctor: '_Tuple4', _0: _p336._0, _1: _p336._1, _2: _p336._2, _3: _p336._3},
					tokens,
					tokens);
			} else {
				return '';
			}
		}
	});
var _user$project$Indexer$computeVariableSourcePaths = F2(
	function (_p340, tokens) {
		var _p341 = _p340;
		var _p344 = _p341._0;
		var _p342 = _p344;
		if (_p342.ctor === 'Just') {
			return A2(
				_elm_lang$core$Dict$map,
				F2(
					function (_p343, hints) {
						return A2(
							_elm_lang$core$List$map,
							function (hint) {
								return _elm_lang$core$Native_Utils.eq(hint.kind, _user$project$Indexer$KindVariable) ? _elm_lang$core$Native_Utils.update(
									hint,
									{
										sourcePath: A5(
											_user$project$Indexer$getSourcePathOfRecordFieldToken,
											hint.name,
											_p342._0.filePath,
											_p341._1,
											{ctor: '_Tuple4', _0: _p344, _1: _p341._2, _2: _p341._3, _3: _p341._4},
											tokens)
									}) : hint;
							},
							hints);
					}),
				tokens);
		} else {
			return tokens;
		}
	});
var _user$project$Indexer$getTokenAndActiveFileTokensForGoToDefinition = F3(
	function (maybeActiveTopLevel, maybeToken, model) {
		var activeFileTokens = A2(
			_user$project$Indexer$computeVariableSourcePaths,
			{ctor: '_Tuple5', _0: model.activeFile, _1: maybeActiveTopLevel, _2: model.projectFileContentsDict, _3: model.projectDependencies, _4: model.packageDocs},
			A5(_user$project$Indexer$getActiveFileTokens, model.activeFile, maybeActiveTopLevel, model.projectFileContentsDict, model.projectDependencies, model.packageDocs));
		var tokenToCheck = function () {
			var _p345 = {ctor: '_Tuple2', _0: maybeToken, _1: model.activeFile};
			if (_p345._0.ctor === 'Just') {
				if (_p345._1.ctor === 'Just') {
					var _p346 = _p345._0._0;
					var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p345._1._0.projectDirectory, model.projectFileContentsDict);
					var activeFileContents = A2(_user$project$Indexer$getActiveFileContents, model.activeFile, fileContentsDict);
					return _elm_lang$core$Native_Utils.eq(
						activeFileContents.moduleDocs.name,
						_user$project$Indexer$getModuleName(_p346)) ? _elm_lang$core$Maybe$Just(
						_user$project$Indexer$getLastName(_p346)) : _elm_lang$core$Maybe$Just(_p346);
				} else {
					return _elm_lang$core$Maybe$Just(_p345._0._0);
				}
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		}();
		return {ctor: '_Tuple2', _0: tokenToCheck, _1: activeFileTokens};
	});
var _user$project$Indexer$doGoToDefinition = F3(
	function (maybeActiveTopLevel, maybeToken, model) {
		var _p347 = A3(_user$project$Indexer$getTokenAndActiveFileTokensForGoToDefinition, maybeActiveTopLevel, maybeToken, model);
		var tokenToCheck = _p347._0;
		var activeFileTokens = _p347._1;
		var requests = A2(
			_elm_lang$core$List$map,
			function (hint) {
				var symbol = {
					fullName: _user$project$Indexer$getHintFullName(hint),
					sourcePath: hint.sourcePath,
					tipe: hint.tipe,
					caseTipe: hint.caseTipe,
					kind: hint.kind
				};
				return _user$project$Indexer$goToDefinitionCmd(
					A2(
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						model.activeFile,
						_user$project$Indexer$encodeSymbol(symbol)));
			},
			A2(_user$project$Indexer$getHintsForToken, tokenToCheck, activeFileTokens));
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(requests)
		};
	});
var _user$project$Indexer$doAskCanGoToDefinition = F3(
	function (maybeActiveTopLevel, token, model) {
		var _p348 = A3(
			_user$project$Indexer$getTokenAndActiveFileTokensForGoToDefinition,
			maybeActiveTopLevel,
			_elm_lang$core$Maybe$Just(token),
			model);
		var tokenToCheck = _p348._0;
		var activeFileTokens = _p348._1;
		var _p349 = tokenToCheck;
		if (_p349.ctor === 'Nothing') {
			return {
				ctor: '_Tuple2',
				_0: model,
				_1: _user$project$Indexer$canGoToDefinitionRepliedCmd(
					{ctor: '_Tuple2', _0: token, _1: false})
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: model,
				_1: _user$project$Indexer$canGoToDefinitionRepliedCmd(
					{
						ctor: '_Tuple2',
						_0: token,
						_1: A2(_elm_lang$core$Dict$member, _p349._0, activeFileTokens)
					})
			};
		}
	});
var _user$project$Indexer$importsToString = F2(
	function (imports, tokens) {
		return A2(
			_elm_lang$core$String$join,
			'\n',
			A2(
				_elm_lang$core$List$map,
				function (_p350) {
					var _p351 = _p350;
					var _p359 = _p351._0;
					var formatExposedSymbol = function (token) {
						var hints = A2(
							_elm_lang$core$Basics$uncurry,
							F2(
								function (x, y) {
									return A2(_elm_lang$core$Basics_ops['++'], x, y);
								}),
							A2(
								_elm_lang$core$List$partition,
								function (_p352) {
									return A2(
										F2(
											function (x, y) {
												return _elm_lang$core$Native_Utils.eq(x, y);
											}),
										_p359,
										function (_) {
											return _.moduleName;
										}(_p352));
								},
								A2(
									_user$project$Indexer$getHintsForToken,
									_elm_lang$core$Maybe$Just(token),
									tokens)));
						var formatSymbol = function (token) {
							return ((!_elm_lang$core$Native_Utils.eq(token, '..')) && _user$project$Helper$isInfix(token)) ? A2(
								_elm_lang$core$Basics_ops['++'],
								'(',
								A2(_elm_lang$core$Basics_ops['++'], token, ')')) : token;
						};
						var _p353 = _elm_lang$core$List$head(hints);
						if (_p353.ctor === 'Just') {
							var _p354 = _p353._0.caseTipe;
							if (_p354.ctor === 'Just') {
								return A2(
									_elm_lang$core$Basics_ops['++'],
									_p354._0,
									A2(
										_elm_lang$core$Basics_ops['++'],
										'(',
										A2(
											_elm_lang$core$Basics_ops['++'],
											formatSymbol(token),
											')')));
							} else {
								return formatSymbol(token);
							}
						} else {
							return formatSymbol(token);
						}
					};
					var exposingPart = function () {
						var _p355 = _p351._1.exposed;
						switch (_p355.ctor) {
							case 'None':
								return '';
							case 'All':
								return ' exposing (..)';
							default:
								var nonDefaultExposedSymbols = A2(
									_elm_lang$core$Set$filter,
									function (exposedSymbolName) {
										var _p356 = A2(_elm_lang$core$Dict$get, _p359, _user$project$Indexer$defaultImports);
										if (_p356.ctor === 'Just') {
											var _p357 = _p356._0.exposed;
											if (_p357.ctor === 'Some') {
												return !A2(_elm_lang$core$Set$member, exposedSymbolName, _p357._0);
											} else {
												return true;
											}
										} else {
											return true;
										}
									},
									_p355._0);
								return A2(
									_elm_lang$core$Basics_ops['++'],
									' exposing (',
									A2(
										_elm_lang$core$Basics_ops['++'],
										A2(
											_elm_lang$core$String$join,
											', ',
											A2(
												_elm_lang$core$List$map,
												formatExposedSymbol,
												_elm_lang$core$Set$toList(nonDefaultExposedSymbols))),
										')'));
						}
					}();
					var importPart = function () {
						var _p358 = _p351._1.alias;
						if (_p358.ctor === 'Just') {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'import ',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_p359,
									A2(_elm_lang$core$Basics_ops['++'], ' as ', _p358._0)));
						} else {
							return A2(_elm_lang$core$Basics_ops['++'], 'import ', _p359);
						}
					}();
					return A2(_elm_lang$core$Basics_ops['++'], importPart, exposingPart);
				},
				_elm_lang$core$Dict$toList(imports)));
	});
var _user$project$Indexer$doAddImport = F5(
	function (filePath, projectDirectory, moduleName, maybeSymbolName, model) {
		var fileContents = A2(
			_user$project$Indexer$getActiveFileContents,
			_elm_lang$core$Maybe$Just(
				{filePath: filePath, projectDirectory: projectDirectory}),
			A2(_user$project$Indexer$getFileContentsOfProject, projectDirectory, model.projectFileContentsDict));
		var updatedImports = A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (moduleName, moduleImport) {
					return !A2(
						_elm_lang$core$List$member,
						{ctor: '_Tuple2', _0: moduleName, _1: moduleImport},
						_elm_lang$core$Dict$toList(_user$project$Indexer$defaultImports));
				}),
			function () {
				var _p360 = A2(_elm_lang$core$Dict$get, moduleName, fileContents.imports);
				if (_p360.ctor === 'Just') {
					var _p367 = _p360._0;
					var _p361 = maybeSymbolName;
					if (_p361.ctor === 'Just') {
						var _p366 = _p361._0;
						var _p362 = _p367.exposed;
						switch (_p362.ctor) {
							case 'All':
								return fileContents.imports;
							case 'Some':
								return _elm_lang$core$Native_Utils.eq(_p366, '..') ? A3(
									_elm_lang$core$Dict$update,
									moduleName,
									function (_p363) {
										return _elm_lang$core$Maybe$Just(
											_elm_lang$core$Native_Utils.update(
												_p367,
												{exposed: _user$project$Indexer$All}));
									},
									fileContents.imports) : A3(
									_elm_lang$core$Dict$update,
									moduleName,
									function (_p364) {
										return _elm_lang$core$Maybe$Just(
											_elm_lang$core$Native_Utils.update(
												_p367,
												{
													exposed: _user$project$Indexer$Some(
														A2(_elm_lang$core$Set$insert, _p366, _p362._0))
												}));
									},
									fileContents.imports);
							default:
								return A3(
									_elm_lang$core$Dict$update,
									moduleName,
									function (_p365) {
										return _elm_lang$core$Maybe$Just(
											_elm_lang$core$Native_Utils.update(
												_p367,
												{
													exposed: _user$project$Indexer$Some(
														_elm_lang$core$Set$singleton(_p366))
												}));
									},
									fileContents.imports);
						}
					} else {
						return fileContents.imports;
					}
				} else {
					var importToAdd = function () {
						var _p368 = maybeSymbolName;
						if (_p368.ctor === 'Just') {
							return {
								alias: _elm_lang$core$Maybe$Nothing,
								exposed: _user$project$Indexer$Some(
									_elm_lang$core$Set$singleton(_p368._0))
							};
						} else {
							return {alias: _elm_lang$core$Maybe$Nothing, exposed: _user$project$Indexer$None};
						}
					}();
					return A3(_elm_lang$core$Dict$insert, moduleName, importToAdd, fileContents.imports);
				}
			}());
		var updatedFileContents = _elm_lang$core$Native_Utils.update(
			fileContents,
			{imports: updatedImports});
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					projectFileContentsDict: A4(_user$project$Indexer$updateFileContents, filePath, projectDirectory, updatedFileContents, model.projectFileContentsDict)
				}),
			_1: _user$project$Indexer$updateImportsCmd(
				{
					ctor: '_Tuple2',
					_0: filePath,
					_1: A2(_user$project$Indexer$importsToString, updatedImports, model.activeFileTokens)
				})
		};
	});
var _user$project$Indexer$update = F2(
	function (msg, model) {
		var _p369 = msg;
		switch (_p369.ctor) {
			case 'MaybeDocsDownloaded':
				if (_p369._1.ctor === 'Err') {
					return {
						ctor: '_Tuple2',
						_0: model,
						_1: _user$project$Indexer$downloadDocsFailedCmd(
							_elm_lang$core$Basics$toString(_p369._1._0))
					};
				} else {
					var _p370 = A3(
						_elm_lang$core$List$foldl,
						F2(
							function (_p372, _p371) {
								var _p373 = _p372;
								var _p381 = _p373._0;
								var _p374 = _p371;
								var _p380 = _p374._0;
								var _p379 = _p374._1;
								var _p375 = _p373._1;
								if (_p375.ctor === 'Ok') {
									return {
										ctor: '_Tuple2',
										_0: A2(
											_elm_lang$core$Basics_ops['++'],
											_p380,
											{
												ctor: '::',
												_0: {
													ctor: '_Tuple2',
													_0: _p375._0._1,
													_1: {ctor: '_Tuple2', _0: _p381, _1: _p375._0._0}
												},
												_1: {ctor: '[]'}
											}),
										_1: _p379
									};
								} else {
									var errorDetails = function () {
										var _p376 = _p375._0;
										switch (_p376.ctor) {
											case 'BadUrl':
												return A2(_elm_lang$core$Basics_ops['++'], 'BadUrl ', _p376._0);
											case 'Timeout':
												return 'Timeout';
											case 'NetworkError':
												return 'NetworkError';
											case 'BadStatus':
												var _p377 = _p376._0.status;
												return A2(
													_elm_lang$core$Basics_ops['++'],
													'BadStatus ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_elm_lang$core$Basics$toString(_p377.code),
														A2(_elm_lang$core$Basics_ops['++'], ' ', _p377.message)));
											default:
												var _p378 = _p376._1.status;
												return A2(
													_elm_lang$core$Basics_ops['++'],
													'BadPayload ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_elm_lang$core$Basics$toString(_p378.code),
														A2(_elm_lang$core$Basics_ops['++'], ' ', _p378.message)));
										}
									}();
									return {
										ctor: '_Tuple2',
										_0: _p380,
										_1: A2(
											_elm_lang$core$Basics_ops['++'],
											_p379,
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: _p381, _1: errorDetails},
												_1: {ctor: '[]'}
											})
									};
								}
							}),
						{
							ctor: '_Tuple2',
							_0: {ctor: '[]'},
							_1: {ctor: '[]'}
						},
						A3(
							_elm_lang$core$List$map2,
							F2(
								function (v0, v1) {
									return {ctor: '_Tuple2', _0: v0, _1: v1};
								}),
							_p369._0,
							_p369._1._0));
					var successes = _p370._0;
					var failures = _p370._1;
					var loadedPackageDocs = A2(_elm_lang$core$List$concatMap, _elm_lang$core$Tuple$first, successes);
					var loadedDependenciesAndJson = A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$second, successes);
					return {
						ctor: '_Tuple2',
						_0: A2(_user$project$Indexer$addLoadedPackageDocs, loadedPackageDocs, model),
						_1: _elm_lang$core$Platform_Cmd$batch(
							A2(
								_elm_lang$core$Basics_ops['++'],
								{
									ctor: '::',
									_0: _user$project$Indexer$docsDownloadedCmd(loadedDependenciesAndJson),
									_1: {ctor: '[]'}
								},
								(_elm_lang$core$Native_Utils.cmp(
									_elm_lang$core$List$length(failures),
									0) > 0) ? A2(
									_elm_lang$core$Basics_ops['++'],
									{
										ctor: '::',
										_0: _user$project$Indexer$downloadDocsFailedCmd(
											A2(
												_elm_lang$core$String$join,
												'\n',
												A2(
													_elm_lang$core$List$map,
													function (_p382) {
														var _p383 = _p382;
														return A2(
															_elm_lang$core$Basics_ops['++'],
															_user$project$Indexer$toPackageUri(_p383._0),
															A2(
																_elm_lang$core$Basics_ops['++'],
																'documentation.json (',
																A2(_elm_lang$core$Basics_ops['++'], _p383._1, ')')));
													},
													failures))),
										_1: {ctor: '[]'}
									},
									function () {
										var projectDirectories = _elm_lang$core$Dict$keys(model.projectFileContentsDict);
										var notFoundDependencies = A2(
											_elm_lang$core$List$map,
											_elm_lang$core$Tuple$first,
											A2(
												_elm_lang$core$List$filter,
												function (_p384) {
													var _p385 = _p384;
													return _elm_lang$core$Native_Utils.eq(_p385._1, 'BadStatus 404 Not found');
												},
												failures));
										return (_elm_lang$core$Native_Utils.cmp(
											_elm_lang$core$List$length(notFoundDependencies),
											0) > 0) ? {
											ctor: '::',
											_0: _user$project$Indexer$dependenciesNotFoundCmd(
												{ctor: '_Tuple2', _0: projectDirectories, _1: notFoundDependencies}),
											_1: {ctor: '[]'}
										} : {ctor: '[]'};
									}()) : {ctor: '[]'}))
					};
				}
			case 'DocsRead':
				var loadedPackageDocs = A2(
					_elm_lang$core$List$concatMap,
					function (_p386) {
						var _p387 = _p386;
						return A2(
							_user$project$Indexer$toModuleDocs,
							_user$project$Indexer$toPackageUri(_p387._0),
							_p387._1);
					},
					_p369._0);
				return {
					ctor: '_Tuple2',
					_0: A2(_user$project$Indexer$addLoadedPackageDocs, loadedPackageDocs, model),
					_1: _user$project$Indexer$docsReadCmd(
						{ctor: '_Tuple0'})
				};
			case 'UpdateActiveTokenHints':
				return A3(_user$project$Indexer$doUpdateActiveTokenHints, _p369._0._0, _p369._0._1, model);
			case 'UpdateActiveFile':
				return A4(_user$project$Indexer$doUpdateActiveFile, _p369._0._0, _p369._0._1, _p369._0._2, model);
			case 'UpdateFileContents':
				return A4(_user$project$Indexer$doUpdateFileContents, _p369._0, _p369._1, _p369._2, model);
			case 'RemoveFileContents':
				return A3(_user$project$Indexer$doRemoveFileContents, _p369._0._0, _p369._0._1, model);
			case 'UpdateProjectDependencies':
				return A3(_user$project$Indexer$doUpdateProjectDependencies, _p369._0._0, _p369._0._1, model);
			case 'DownloadMissingPackageDocs':
				return A2(_user$project$Indexer$doDownloadMissingPackageDocs, _p369._0, model);
			case 'GoToDefinition':
				return A3(_user$project$Indexer$doGoToDefinition, _p369._0._0, _p369._0._1, model);
			case 'AskCanGoToDefinition':
				return A3(_user$project$Indexer$doAskCanGoToDefinition, _p369._0._0, _p369._0._1, model);
			case 'ShowGoToSymbolView':
				return A3(_user$project$Indexer$doShowGoToSymbolView, _p369._0._0, _p369._0._1, model);
			case 'GetHintsForPartial':
				return A8(_user$project$Indexer$doGetHintsForPartial, _p369._0._0, _p369._0._1, _p369._0._2, _p369._0._3, _p369._0._4, _p369._0._5, _p369._0._6, model);
			case 'GetSuggestionsForImport':
				return A3(_user$project$Indexer$doGetSuggestionsForImport, _p369._0._0, _p369._0._1, model);
			case 'GetImporterSourcePathsForToken':
				return A4(_user$project$Indexer$doGetImporterSourcePathsForToken, _p369._0._0, _p369._0._1, _p369._0._2, model);
			case 'ShowAddImportView':
				return A3(_user$project$Indexer$doShowAddImportView, _p369._0._0, _p369._0._1, model);
			case 'AddImport':
				return A5(_user$project$Indexer$doAddImport, _p369._0._0, _p369._0._1, _p369._0._2, _p369._0._3, model);
			case 'ConstructFromTypeAnnotation':
				return A2(_user$project$Indexer$doConstructFromTypeAnnotation, _p369._0, model);
			case 'ConstructCaseOf':
				return A2(_user$project$Indexer$doConstructCaseOf, _p369._0, model);
			case 'ConstructDefaultValueForType':
				return A2(_user$project$Indexer$doConstructDefaultValueForType, _p369._0, model);
			case 'ConstructDefaultArguments':
				return A2(_user$project$Indexer$doConstructDefaultArguments, _p369._0, model);
			case 'InferenceEntered':
				var _p388 = _p369._0;
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _user$project$Indexer$activeTokenHintsChangedCmd(
						{
							ctor: '_Tuple2',
							_0: _p388.name,
							_1: A2(
								_elm_lang$core$List$map,
								A2(_user$project$Indexer$encodeHint, model.config.showAliasesOfType, model.activeFileTokens),
								_user$project$Indexer$inferenceToHints(_p388))
						})
				};
			case 'ConfigChanged':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{config: _p369._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'GetAliasesOfType':
				return A2(_user$project$Indexer$doGetAliasesOfType, _p369._0, model);
			case 'ClearLocalHintsCache':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							hintsCache: function () {
								var _p389 = model.hintsCache;
								if (_p389.ctor === 'Just') {
									return _elm_lang$core$Maybe$Just(
										_elm_lang$core$Native_Utils.update(
											_p389._0,
											{local: _elm_lang$core$Maybe$Nothing}));
								} else {
									return _elm_lang$core$Maybe$Nothing;
								}
							}()
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'GetTokenInfo':
				return A5(_user$project$Indexer$doGetTokenInfo, _p369._0._0, _p369._0._1, _p369._0._2, _p369._0._3, model);
			default:
				return A4(_user$project$Indexer$doGetFunctionsMatchingType, _p369._0._0, _p369._0._1, _p369._0._2, model);
		}
	});
var _user$project$Indexer$toImportDict = function (rawImports) {
	return A2(
		_elm_lang$core$Dict$union,
		_elm_lang$core$Dict$fromList(
			A2(_elm_lang$core$List$map, _user$project$Indexer$toImport, rawImports)),
		_user$project$Indexer$defaultImports);
};
var _user$project$Indexer$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: _user$project$Indexer$activeTokenChangedSub(_user$project$Indexer$UpdateActiveTokenHints),
			_1: {
				ctor: '::',
				_0: _user$project$Indexer$activeFileChangedSub(_user$project$Indexer$UpdateActiveFile),
				_1: {
					ctor: '::',
					_0: _user$project$Indexer$fileContentsChangedSub(
						function (_p390) {
							var _p391 = _p390;
							var _p392 = _p391._2;
							var encodedValues = _p392.values;
							var decodeValue = function (encoded) {
								return _elm_lang$core$Native_Utils.update(
									encoded,
									{
										associativity: _user$project$Indexer$decodeAssociativity(encoded.associativity)
									});
							};
							var moduleDocs = _elm_lang$core$Native_Utils.update(
								_p392,
								{
									values: _elm_lang$core$Native_Utils.update(
										encodedValues,
										{
											values: A2(_elm_lang$core$List$map, decodeValue, encodedValues.values),
											aliases: A2(_elm_lang$core$List$map, decodeValue, encodedValues.aliases)
										})
								});
							return A3(
								_user$project$Indexer$UpdateFileContents,
								_p391._0,
								_p391._1,
								A2(
									_user$project$Indexer$FileContents,
									moduleDocs,
									_user$project$Indexer$toImportDict(_p391._3)));
						}),
					_1: {
						ctor: '::',
						_0: _user$project$Indexer$fileContentsRemovedSub(_user$project$Indexer$RemoveFileContents),
						_1: {
							ctor: '::',
							_0: _user$project$Indexer$projectDependenciesChangedSub(_user$project$Indexer$UpdateProjectDependencies),
							_1: {
								ctor: '::',
								_0: _user$project$Indexer$downloadMissingPackageDocsSub(_user$project$Indexer$DownloadMissingPackageDocs),
								_1: {
									ctor: '::',
									_0: _user$project$Indexer$docsReadSub(_user$project$Indexer$DocsRead),
									_1: {
										ctor: '::',
										_0: _user$project$Indexer$goToDefinitionSub(_user$project$Indexer$GoToDefinition),
										_1: {
											ctor: '::',
											_0: _user$project$Indexer$askCanGoToDefinitionSub(_user$project$Indexer$AskCanGoToDefinition),
											_1: {
												ctor: '::',
												_0: _user$project$Indexer$showGoToSymbolViewSub(_user$project$Indexer$ShowGoToSymbolView),
												_1: {
													ctor: '::',
													_0: _user$project$Indexer$getHintsForPartialSub(_user$project$Indexer$GetHintsForPartial),
													_1: {
														ctor: '::',
														_0: _user$project$Indexer$getSuggestionsForImportSub(_user$project$Indexer$GetSuggestionsForImport),
														_1: {
															ctor: '::',
															_0: _user$project$Indexer$getImportersForTokenSub(_user$project$Indexer$GetImporterSourcePathsForToken),
															_1: {
																ctor: '::',
																_0: _user$project$Indexer$showAddImportViewSub(_user$project$Indexer$ShowAddImportView),
																_1: {
																	ctor: '::',
																	_0: _user$project$Indexer$addImportSub(_user$project$Indexer$AddImport),
																	_1: {
																		ctor: '::',
																		_0: _user$project$Indexer$constructFromTypeAnnotationSub(_user$project$Indexer$ConstructFromTypeAnnotation),
																		_1: {
																			ctor: '::',
																			_0: _user$project$Indexer$constructCaseOfSub(_user$project$Indexer$ConstructCaseOf),
																			_1: {
																				ctor: '::',
																				_0: _user$project$Indexer$constructDefaultValueForTypeSub(_user$project$Indexer$ConstructDefaultValueForType),
																				_1: {
																					ctor: '::',
																					_0: _user$project$Indexer$constructDefaultArgumentsSub(_user$project$Indexer$ConstructDefaultArguments),
																					_1: {
																						ctor: '::',
																						_0: _user$project$Indexer$inferenceEnteredSub(_user$project$Indexer$InferenceEntered),
																						_1: {
																							ctor: '::',
																							_0: _user$project$Indexer$configChangedSub(_user$project$Indexer$ConfigChanged),
																							_1: {
																								ctor: '::',
																								_0: _user$project$Indexer$getAliasesOfTypeSub(_user$project$Indexer$GetAliasesOfType),
																								_1: {
																									ctor: '::',
																									_0: _user$project$Indexer$clearLocalHintsCacheSub(
																										function (_p393) {
																											return _user$project$Indexer$ClearLocalHintsCache;
																										}),
																									_1: {
																										ctor: '::',
																										_0: _user$project$Indexer$getTokenInfoSub(_user$project$Indexer$GetTokenInfo),
																										_1: {
																											ctor: '::',
																											_0: _user$project$Indexer$getFunctionsMatchingTypeSub(_user$project$Indexer$GetFunctionsMatchingType),
																											_1: {ctor: '[]'}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _user$project$Indexer$main = _elm_lang$core$Platform$program(
	{init: _user$project$Indexer$init, update: _user$project$Indexer$update, subscriptions: _user$project$Indexer$subscriptions})();

var Elm = {};
Elm['Indexer'] = Elm['Indexer'] || {};
if (typeof _user$project$Indexer$main !== 'undefined') {
    _user$project$Indexer$main(Elm['Indexer'], 'Indexer', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

