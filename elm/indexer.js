
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
		var name = v.func ? v.func.name : v.name;
		return '<function' + (name === '' ? '' : ':') + name + '>';
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

	function postInitSend(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		var value = result._0;
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		currentSend(incomingValue);
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
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
		start = 1;
	}
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
	}
	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function toFloat(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
		}
		start = 1;
	}
	var dotCount = 0;
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if ('0' <= c && c <= '9')
		{
			continue;
		}
		if (c === '.')
		{
			dotCount += 1;
			if (dotCount <= 1)
			{
				continue;
			}
		}
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	return _elm_lang$core$Result$Ok(parseFloat(s));
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

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

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

			case 'index':
				context += '[' + problem.index + ']';
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

var _user$project$Indexer$infixRegex = _elm_lang$core$Regex$regex('^[~!@#$%^&*\\-+=:|<>.?/]+$');
var _user$project$Indexer$isInfix = function (token) {
	return A2(_elm_lang$core$Regex$contains, _user$project$Indexer$infixRegex, token);
};
var _user$project$Indexer$capitalizedRegex = _elm_lang$core$Regex$regex('^[A-Z]');
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
					if (_p3.ctor === 'Nothing') {
						return _elm_lang$core$Maybe$Just(symbolName);
					} else {
						return _elm_lang$core$Maybe$Just(
							A2(
								_elm_lang$core$Basics_ops['++'],
								_p3._0,
								A2(
									_elm_lang$core$Basics_ops['++'],
									'(',
									A2(_elm_lang$core$Basics_ops['++'], symbolName, ')'))));
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
		_elm_lang$core$List$reverse(
			A2(
				_elm_lang$core$Maybe$withDefault,
				{ctor: '[]'},
				_elm_lang$core$List$tail(
					_elm_lang$core$List$reverse(
						A2(_elm_lang$core$String$split, '.', fullName))))));
};
var _user$project$Indexer$getLastName = function (fullName) {
	return A3(
		_elm_lang$core$List$foldl,
		_elm_lang$core$Basics$always,
		'',
		A2(_elm_lang$core$String$split, '.', fullName));
};
var _user$project$Indexer$defaultTypes = _elm_lang$core$Set$fromList(
	{
		ctor: '::',
		_0: 'Maybe',
		_1: {
			ctor: '::',
			_0: 'Result',
			_1: {ctor: '[]'}
		}
	});
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
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_elm_lang$core$Maybe$withDefault, moduleName, alias),
			A2(_elm_lang$core$Basics_ops['++'], '.', name));
	});
var _user$project$Indexer$isRecordString = function (str) {
	return A2(_elm_lang$core$String$startsWith, '{', str);
};
var _user$project$Indexer$isTupleString = function (str) {
	return A2(_elm_lang$core$String$startsWith, '(', str);
};
var _user$project$Indexer$tipeToValue = function (_p6) {
	var _p7 = _p6;
	return {
		name: _p7.name,
		comment: _p7.comment,
		tipe: _p7.tipe,
		args: _elm_lang$core$Maybe$Just(_p7.args)
	};
};
var _user$project$Indexer$getRecordTipePartsRecur = F5(
	function (str, _p9, lookingForTipe, parts, _p8) {
		getRecordTipePartsRecur:
		while (true) {
			var _p10 = _p9;
			var _p21 = _p10._1;
			var _p20 = _p10._0;
			var _p11 = _p8;
			var _p19 = _p11._0;
			var _p18 = _p11._1;
			var _p12 = str;
			if (_p12 === '') {
				return A3(
					_elm_lang$core$Dict$insert,
					_elm_lang$core$String$trim(_p20),
					_elm_lang$core$String$trim(_p21),
					parts);
			} else {
				var _p13 = function () {
					var _p14 = _elm_lang$core$String$uncons(str);
					if (_p14.ctor === 'Nothing') {
						return {ctor: '_Tuple2', _0: '', _1: str};
					} else {
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$String$fromChar(_p14._0._0),
							_1: _p14._0._1
						};
					}
				}();
				var thisChar = _p13._0;
				var thisRest = _p13._1;
				if (_elm_lang$core$Native_Utils.eq(_p19, 0) && (_elm_lang$core$Native_Utils.eq(_p18, 0) && _elm_lang$core$Native_Utils.eq(thisChar, ','))) {
					var _v9 = thisRest,
						_v10 = {ctor: '_Tuple2', _0: '', _1: ''},
						_v11 = false,
						_v12 = A3(
						_elm_lang$core$Dict$insert,
						_elm_lang$core$String$trim(_p20),
						_elm_lang$core$String$trim(_p21),
						parts),
						_v13 = {ctor: '_Tuple2', _0: 0, _1: 0};
					str = _v9;
					_p9 = _v10;
					lookingForTipe = _v11;
					parts = _v12;
					_p8 = _v13;
					continue getRecordTipePartsRecur;
				} else {
					if (_elm_lang$core$Native_Utils.eq(_p19, 0) && (_elm_lang$core$Native_Utils.eq(_p18, 0) && _elm_lang$core$Native_Utils.eq(thisChar, ':'))) {
						var _v14 = thisRest,
							_v15 = {ctor: '_Tuple2', _0: _p20, _1: ''},
							_v16 = true,
							_v17 = parts,
							_v18 = {ctor: '_Tuple2', _0: 0, _1: 0};
						str = _v14;
						_p9 = _v15;
						lookingForTipe = _v16;
						parts = _v17;
						_p8 = _v18;
						continue getRecordTipePartsRecur;
					} else {
						var _p15 = lookingForTipe ? {
							ctor: '_Tuple2',
							_0: _p20,
							_1: A2(_elm_lang$core$Basics_ops['++'], _p21, thisChar)
						} : {
							ctor: '_Tuple2',
							_0: A2(_elm_lang$core$Basics_ops['++'], _p20, thisChar),
							_1: _p21
						};
						var updatedFieldAcc = _p15._0;
						var updatedTipeAcc = _p15._1;
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
						var _v20 = thisRest,
							_v21 = {ctor: '_Tuple2', _0: updatedFieldAcc, _1: updatedTipeAcc},
							_v22 = lookingForTipe,
							_v23 = parts,
							_v24 = {ctor: '_Tuple2', _0: updatedOpenParentheses, _1: updatedOpenBraces};
						str = _v20;
						_p9 = _v21;
						lookingForTipe = _v22;
						parts = _v23;
						_p8 = _v24;
						continue getRecordTipePartsRecur;
					}
				}
			}
		}
	});
var _user$project$Indexer$getRecordTipeParts = function (tipeString) {
	var _p22 = A3(_elm_lang$core$String$slice, 1, -1, tipeString);
	if (_p22 === '') {
		return _elm_lang$core$Dict$empty;
	} else {
		return A5(
			_user$project$Indexer$getRecordTipePartsRecur,
			_p22,
			{ctor: '_Tuple2', _0: '', _1: ''},
			false,
			_elm_lang$core$Dict$empty,
			{ctor: '_Tuple2', _0: 0, _1: 0});
	}
};
var _user$project$Indexer$getRecordArgParts = function (recordString) {
	var _p23 = A3(_elm_lang$core$String$slice, 1, -1, recordString);
	if (_p23 === '') {
		return {ctor: '[]'};
	} else {
		return A2(
			_elm_lang$core$List$map,
			_elm_lang$core$String$trim,
			A2(_elm_lang$core$String$split, ',', _p23));
	}
};
var _user$project$Indexer$getTuplePartsRecur = F4(
	function (str, acc, parts, _p24) {
		getTuplePartsRecur:
		while (true) {
			var _p25 = _p24;
			var _p32 = _p25._0;
			var _p31 = _p25._1;
			var _p26 = str;
			if (_p26 === '') {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					parts,
					{
						ctor: '::',
						_0: _elm_lang$core$String$trim(acc),
						_1: {ctor: '[]'}
					});
			} else {
				var _p27 = function () {
					var _p28 = _elm_lang$core$String$uncons(str);
					if (_p28.ctor === 'Nothing') {
						return {ctor: '_Tuple2', _0: '', _1: str};
					} else {
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$String$fromChar(_p28._0._0),
							_1: _p28._0._1
						};
					}
				}();
				var thisChar = _p27._0;
				var thisRest = _p27._1;
				if (_elm_lang$core$Native_Utils.eq(_p32, 0) && (_elm_lang$core$Native_Utils.eq(_p31, 0) && _elm_lang$core$Native_Utils.eq(thisChar, ','))) {
					var _v30 = thisRest,
						_v31 = '',
						_v32 = A2(
						_elm_lang$core$Basics_ops['++'],
						parts,
						{
							ctor: '::',
							_0: _elm_lang$core$String$trim(acc),
							_1: {ctor: '[]'}
						}),
						_v33 = {ctor: '_Tuple2', _0: 0, _1: 0};
					str = _v30;
					acc = _v31;
					parts = _v32;
					_p24 = _v33;
					continue getTuplePartsRecur;
				} else {
					var _p29 = function () {
						var _p30 = thisChar;
						switch (_p30) {
							case '(':
								return {ctor: '_Tuple2', _0: _p32 + 1, _1: _p31};
							case ')':
								return {ctor: '_Tuple2', _0: _p32 - 1, _1: _p31};
							case '{':
								return {ctor: '_Tuple2', _0: _p32, _1: _p31 + 1};
							case '}':
								return {ctor: '_Tuple2', _0: _p32, _1: _p31 - 1};
							default:
								return {ctor: '_Tuple2', _0: _p32, _1: _p31};
						}
					}();
					var updatedOpenParentheses = _p29._0;
					var updatedOpenBraces = _p29._1;
					var _v35 = thisRest,
						_v36 = A2(_elm_lang$core$Basics_ops['++'], acc, thisChar),
						_v37 = parts,
						_v38 = {ctor: '_Tuple2', _0: updatedOpenParentheses, _1: updatedOpenBraces};
					str = _v35;
					acc = _v36;
					parts = _v37;
					_p24 = _v38;
					continue getTuplePartsRecur;
				}
			}
		}
	});
var _user$project$Indexer$getTupleArgParts = function (tupleString) {
	var _p33 = A3(_elm_lang$core$String$slice, 1, -1, tupleString);
	if (_p33 === '') {
		return {ctor: '[]'};
	} else {
		return A4(
			_user$project$Indexer$getTuplePartsRecur,
			_p33,
			'',
			{ctor: '[]'},
			{ctor: '_Tuple2', _0: 0, _1: 0});
	}
};
var _user$project$Indexer$getTipePartsRecur = F4(
	function (str, acc, parts, _p34) {
		getTipePartsRecur:
		while (true) {
			var _p35 = _p34;
			var _p43 = _p35._0;
			var _p42 = _p35._1;
			var _p36 = str;
			if (_p36 === '') {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					parts,
					{
						ctor: '::',
						_0: _elm_lang$core$String$trim(acc),
						_1: {ctor: '[]'}
					});
			} else {
				var getCharAndRest = function (s) {
					var _p37 = _elm_lang$core$String$uncons(s);
					if (_p37.ctor === 'Nothing') {
						return {ctor: '_Tuple2', _0: '', _1: s};
					} else {
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$String$fromChar(_p37._0._0),
							_1: _p37._0._1
						};
					}
				};
				var _p38 = getCharAndRest(str);
				var thisChar = _p38._0;
				var thisRest = _p38._1;
				var _p39 = getCharAndRest(thisRest);
				var nextChar = _p39._0;
				var nextRest = _p39._1;
				if (_elm_lang$core$Native_Utils.eq(_p43, 0) && (_elm_lang$core$Native_Utils.eq(_p42, 0) && (_elm_lang$core$Native_Utils.eq(thisChar, '-') && _elm_lang$core$Native_Utils.eq(nextChar, '>')))) {
					var _v43 = nextRest,
						_v44 = '',
						_v45 = A2(
						_elm_lang$core$Basics_ops['++'],
						parts,
						{
							ctor: '::',
							_0: _elm_lang$core$String$trim(acc),
							_1: {ctor: '[]'}
						}),
						_v46 = {ctor: '_Tuple2', _0: 0, _1: 0};
					str = _v43;
					acc = _v44;
					parts = _v45;
					_p34 = _v46;
					continue getTipePartsRecur;
				} else {
					var _p40 = function () {
						var _p41 = thisChar;
						switch (_p41) {
							case '(':
								return {ctor: '_Tuple2', _0: _p43 + 1, _1: _p42};
							case ')':
								return {ctor: '_Tuple2', _0: _p43 - 1, _1: _p42};
							case '{':
								return {ctor: '_Tuple2', _0: _p43, _1: _p42 + 1};
							case '}':
								return {ctor: '_Tuple2', _0: _p43, _1: _p42 - 1};
							default:
								return {ctor: '_Tuple2', _0: _p43, _1: _p42};
						}
					}();
					var updatedOpenParentheses = _p40._0;
					var updatedOpenBraces = _p40._1;
					var _v48 = thisRest,
						_v49 = A2(_elm_lang$core$Basics_ops['++'], acc, thisChar),
						_v50 = parts,
						_v51 = {ctor: '_Tuple2', _0: updatedOpenParentheses, _1: updatedOpenBraces};
					str = _v48;
					acc = _v49;
					parts = _v50;
					_p34 = _v51;
					continue getTipePartsRecur;
				}
			}
		}
	});
var _user$project$Indexer$getTipeParts = function (tipeString) {
	var _p44 = tipeString;
	if (_p44 === '') {
		return {ctor: '[]'};
	} else {
		return A4(
			_user$project$Indexer$getTipePartsRecur,
			_p44,
			'',
			{ctor: '[]'},
			{ctor: '_Tuple2', _0: 0, _1: 0});
	}
};
var _user$project$Indexer$symbolKindToString = function (kind) {
	var _p45 = kind;
	switch (_p45.ctor) {
		case 'KindDefault':
			return 'default';
		case 'KindTypeAlias':
			return 'type alias';
		case 'KindType':
			return 'type';
		case 'KindTypeCase':
			return 'type case';
		default:
			return 'module';
	}
};
var _user$project$Indexer$encodeHint = function (hint) {
	return {
		name: hint.name,
		moduleName: hint.moduleName,
		sourcePath: hint.sourcePath,
		comment: hint.comment,
		tipe: hint.tipe,
		caseTipe: hint.caseTipe,
		kind: _user$project$Indexer$symbolKindToString(hint.kind)
	};
};
var _user$project$Indexer$encodeSymbol = function (symbol) {
	return {
		fullName: symbol.fullName,
		sourcePath: symbol.sourcePath,
		caseTipe: symbol.caseTipe,
		kind: _user$project$Indexer$symbolKindToString(symbol.kind)
	};
};
var _user$project$Indexer$optionalTaskSequence = function (list) {
	var _p46 = list;
	if (_p46.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		var _p48 = _p46._1;
		return A2(
			_elm_lang$core$Task$onError,
			function (_p47) {
				return _user$project$Indexer$optionalTaskSequence(_p48);
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (value) {
					return A2(
						_elm_lang$core$Task$map,
						F2(
							function (x, y) {
								return {ctor: '::', _0: x, _1: y};
							})(value),
						_user$project$Indexer$optionalTaskSequence(_p48));
				},
				_p46._0));
	}
};
var _user$project$Indexer$packageDocsPrefix = 'http://package.elm-lang.org/packages/';
var _user$project$Indexer$toPackageUri = function (_p49) {
	var _p50 = _p49;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_user$project$Indexer$packageDocsPrefix,
		A2(
			_elm_lang$core$Basics_ops['++'],
			_p50._0,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'/',
				A2(_elm_lang$core$Basics_ops['++'], _p50._1, '/'))));
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
var _user$project$Indexer$formatSourcePath = F2(
	function (_p51, valueName) {
		var _p52 = _p51;
		var _p53 = _p52.sourcePath;
		var anchor = _elm_lang$core$Native_Utils.eq(valueName, '') ? '' : A2(_elm_lang$core$Basics_ops['++'], '#', valueName);
		return A2(_elm_lang$core$String$startsWith, _user$project$Indexer$packageDocsPrefix, _p53) ? A2(
			_elm_lang$core$Basics_ops['++'],
			_p53,
			A2(
				_elm_lang$core$Basics_ops['++'],
				_user$project$Indexer$dotToHyphen(_p52.name),
				anchor)) : _p53;
	});
var _user$project$Indexer$nameToHints = F4(
	function (moduleDocs, _p55, kind, _p54) {
		var _p56 = _p55;
		var _p57 = _p54;
		var _p59 = _p57.name;
		var moduleLocalName = A3(_user$project$Indexer$getModuleLocalName, moduleDocs.name, _p56.alias, _p59);
		var hint = {
			name: _p59,
			moduleName: moduleDocs.name,
			sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, _p59),
			comment: _p57.comment,
			tipe: _p57.tipe,
			args: function () {
				var _p58 = _p57.args;
				if (_p58.ctor === 'Nothing') {
					return {ctor: '[]'};
				} else {
					return _p58._0;
				}
			}(),
			caseTipe: _elm_lang$core$Maybe$Nothing,
			kind: kind
		};
		return A2(_user$project$Indexer$isExposed, _p59, _p56.exposed) ? {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _p59, _1: hint},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: moduleLocalName, _1: hint},
				_1: {ctor: '[]'}
			}
		} : {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: moduleLocalName, _1: hint},
			_1: {ctor: '[]'}
		};
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
	var _p60 = hint.moduleName;
	if (_p60 === '') {
		return hint.name;
	} else {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			hint.moduleName,
			A2(_elm_lang$core$Basics_ops['++'], '.', hint.name));
	}
};
var _user$project$Indexer$getSuggestionsForImport = F4(
	function (partial, maybeActiveFile, projectFileContentsDict, projectPackageDocs) {
		var _p61 = maybeActiveFile;
		if (_p61.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			var suggestions = A2(
				_elm_lang$core$List$map,
				function (_p62) {
					var _p63 = _p62;
					var _p65 = _p63.sourcePath;
					var _p64 = _p63.name;
					return {
						name: _p64,
						comment: _p63.comment,
						sourcePath: A2(_elm_lang$core$String$startsWith, _user$project$Indexer$packageDocsPrefix, _p65) ? A2(
							_elm_lang$core$Basics_ops['++'],
							_p65,
							_user$project$Indexer$dotToHyphen(_p64)) : ''
					};
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(_user$project$Indexer$getProjectModuleDocs, _p61._0.projectDirectory, projectFileContentsDict),
					projectPackageDocs));
			return A2(
				_elm_lang$core$List$sortBy,
				function (_) {
					return _.name;
				},
				A2(
					_elm_lang$core$List$filter,
					function (_p66) {
						var _p67 = _p66;
						return A2(_elm_lang$core$String$startsWith, partial, _p67.name);
					},
					suggestions));
		}
	});
var _user$project$Indexer$getHintsForToken = F2(
	function (maybeToken, tokens) {
		var _p68 = maybeToken;
		if (_p68.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			return A2(
				_elm_lang$core$Maybe$withDefault,
				{ctor: '[]'},
				A2(_elm_lang$core$Dict$get, _p68._0, tokens));
		}
	});
var _user$project$Indexer$getImportersForToken = F6(
	function (token, isCursorAtLastPartOfToken, maybeActiveFile, tokens, activeFileContents, projectFileContentsDict) {
		var _p69 = maybeActiveFile;
		if (_p69.ctor === 'Just') {
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
				var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p69._0.projectDirectory, projectFileContentsDict);
				var hints = A2(
					_user$project$Indexer$getHintsForToken,
					_elm_lang$core$Maybe$Just(token),
					tokens);
				return A2(
					_elm_lang$core$List$concatMap,
					function (_p70) {
						var _p71 = _p70;
						var _p77 = _p71.moduleDocs;
						var _p76 = _p71.imports;
						var getSourcePathAndLocalNames = function (hint) {
							var isHintAModule = function (hint) {
								return _elm_lang$core$Native_Utils.eq(hint.moduleName, '') && A2(_elm_lang$core$Regex$contains, _user$project$Indexer$capitalizedRegex, hint.name);
							};
							var isHintThisModule = isHintAModule(hint) && _elm_lang$core$Native_Utils.eq(hint.name, _p77.name);
							var isHintAnImport = isHintAModule(hint) && (!_elm_lang$core$Native_Utils.eq(
								A2(_elm_lang$core$Dict$get, token, _p76),
								_elm_lang$core$Maybe$Nothing));
							if (isHintThisModule) {
								return _elm_lang$core$Maybe$Just(
									{
										ctor: '_Tuple4',
										_0: _p77.sourcePath,
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
											_0: _p77.sourcePath,
											_1: true,
											_2: false,
											_3: {
												ctor: '::',
												_0: hint.name,
												_1: {ctor: '[]'}
											}
										});
								} else {
									var _p72 = A2(_elm_lang$core$Dict$get, hint.moduleName, _p76);
									if (_p72.ctor === 'Nothing') {
										var isHintInThisModule = _elm_lang$core$Native_Utils.eq(hint.moduleName, _p77.name);
										return isHintInThisModule ? _elm_lang$core$Maybe$Just(
											{
												ctor: '_Tuple4',
												_0: _p77.sourcePath,
												_1: false,
												_2: false,
												_3: {
													ctor: '::',
													_0: hint.name,
													_1: {ctor: '[]'}
												}
											}) : _elm_lang$core$Maybe$Nothing;
									} else {
										var _p75 = _p72._0.alias;
										var localNames = function () {
											var _p73 = {ctor: '_Tuple2', _0: _p75, _1: _p72._0.exposed};
											switch (_p73._1.ctor) {
												case 'None':
													if (_p73._0.ctor === 'Nothing') {
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
																_p73._0._0,
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
															_0: A3(_user$project$Indexer$getModuleLocalName, hint.moduleName, _p75, hint.name),
															_1: {ctor: '[]'}
														}
													};
												default:
													return A2(_elm_lang$core$Set$member, hint.name, _p73._1._0) ? {
														ctor: '::',
														_0: hint.name,
														_1: {
															ctor: '::',
															_0: A3(_user$project$Indexer$getModuleLocalName, hint.moduleName, _p75, hint.name),
															_1: {ctor: '[]'}
														}
													} : {
														ctor: '::',
														_0: A3(_user$project$Indexer$getModuleLocalName, hint.moduleName, _p75, hint.name),
														_1: {ctor: '[]'}
													};
											}
										}();
										var names = _elm_lang$core$Set$toList(
											_elm_lang$core$Set$fromList(localNames));
										var _p74 = names;
										if (_p74.ctor === '[]') {
											return _elm_lang$core$Maybe$Nothing;
										} else {
											return _elm_lang$core$Maybe$Just(
												{ctor: '_Tuple4', _0: _p77.sourcePath, _1: false, _2: false, _3: names});
										}
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
var _user$project$Indexer$getProjectPackageDocs = F3(
	function (maybeActiveFile, projectDependencies, packageDocs) {
		var _p78 = maybeActiveFile;
		if (_p78.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			var _p79 = A2(_elm_lang$core$Dict$get, _p78._0.projectDirectory, projectDependencies);
			if (_p79.ctor === 'Nothing') {
				return {ctor: '[]'};
			} else {
				var packageUris = A2(_elm_lang$core$List$map, _user$project$Indexer$toPackageUri, _p79._0);
				return A2(
					_elm_lang$core$List$filter,
					function (moduleDocs) {
						return A2(_elm_lang$core$List$member, moduleDocs.sourcePath, packageUris);
					},
					packageDocs);
			}
		}
	});
var _user$project$Indexer$truncateModuleComment = function (moduleDocs) {
	var truncatedComment = function () {
		var _p80 = _elm_lang$core$List$head(
			A2(_elm_lang$core$String$split, '\n\n', moduleDocs.comment));
		if (_p80.ctor === 'Nothing') {
			return '';
		} else {
			return _p80._0;
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
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(fileContents)),
			fileContentsDict);
		return A3(
			_elm_lang$core$Dict$update,
			projectDirectory,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(updatedFileContentsDict)),
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
var _user$project$Indexer$emptyModel = {
	packageDocs: {ctor: '[]'},
	projectFileContentsDict: _elm_lang$core$Dict$empty,
	activeTokens: _elm_lang$core$Dict$empty,
	activeHints: {ctor: '[]'},
	activeFile: _elm_lang$core$Maybe$Nothing,
	activeTopLevel: _elm_lang$core$Maybe$Nothing,
	projectDependencies: _elm_lang$core$Dict$empty
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
																												return _elm_lang$core$Json_Decode$succeed(
																													{name: name, comment: comment, tipe: tipe, args: args});
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
																												_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)));
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
																								return _elm_lang$core$Json_Decode$succeed(
																									{name: name, comment: comment, tipe: tipe, args: args});
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
	_elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
				_1: {ctor: '[]'}
			}
		}));
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
var _user$project$Indexer$getHintsForPartialSub = _elm_lang$core$Native_Platform.incomingPort('getHintsForPartialSub', _elm_lang$core$Json_Decode$string);
var _user$project$Indexer$getSuggestionsForImportSub = _elm_lang$core$Native_Platform.incomingPort('getSuggestionsForImportSub', _elm_lang$core$Json_Decode$string);
var _user$project$Indexer$askCanGoToDefinitionSub = _elm_lang$core$Native_Platform.incomingPort('askCanGoToDefinitionSub', _elm_lang$core$Json_Decode$string);
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
		return null;
	});
var _user$project$Indexer$goToDefinitionCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'goToDefinitionCmd',
	function (v) {
		return [
			(v._0.ctor === 'Nothing') ? null : {filePath: v._0._0.filePath, projectDirectory: v._0._0.projectDirectory},
			{
			fullName: v._1.fullName,
			sourcePath: v._1.sourcePath,
			caseTipe: (v._1.caseTipe.ctor === 'Nothing') ? null : v._1.caseTipe._0,
			kind: v._1.kind
		}
		];
	});
var _user$project$Indexer$doGoToDefinition = F2(
	function (maybeToken, model) {
		var requests = A2(
			_elm_lang$core$List$map,
			function (hint) {
				var symbol = {
					fullName: _user$project$Indexer$getHintFullName(hint),
					sourcePath: hint.sourcePath,
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
			A2(_user$project$Indexer$getHintsForToken, maybeToken, model.activeTokens));
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(requests)
		};
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
var _user$project$Indexer$activeHintsChangedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'activeHintsChangedCmd',
	function (v) {
		return _elm_lang$core$Native_List.toArray(v).map(
			function (v) {
				return {
					name: v.name,
					moduleName: v.moduleName,
					sourcePath: v.sourcePath,
					comment: v.comment,
					tipe: v.tipe,
					caseTipe: (v.caseTipe.ctor === 'Nothing') ? null : v.caseTipe._0,
					kind: v.kind
				};
			});
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
						_elm_lang$core$Basics$always(
							_elm_lang$core$Maybe$Just(dependencies)),
						model.projectDependencies)
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
					caseTipe: (v.caseTipe.ctor === 'Nothing') ? null : v.caseTipe._0,
					kind: v.kind
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
var _user$project$Indexer$doGetSuggestionsForImport = F2(
	function (partial, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$suggestionsForImportReceivedCmd(
				{
					ctor: '_Tuple2',
					_0: partial,
					_1: A4(
						_user$project$Indexer$getSuggestionsForImport,
						partial,
						model.activeFile,
						model.projectFileContentsDict,
						A3(_user$project$Indexer$getProjectPackageDocs, model.activeFile, model.projectDependencies, model.packageDocs))
				})
		};
	});
var _user$project$Indexer$canGoToDefinitionRepliedCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'canGoToDefinitionRepliedCmd',
	function (v) {
		return [v._0, v._1];
	});
var _user$project$Indexer$doAskCanGoToDefinition = F2(
	function (token, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$canGoToDefinitionRepliedCmd(
				{
					ctor: '_Tuple2',
					_0: token,
					_1: A2(_elm_lang$core$Dict$member, token, model.activeTokens)
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
var _user$project$Indexer$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {packageDocs: a, projectFileContentsDict: b, activeTokens: c, activeHints: d, activeFile: e, activeTopLevel: f, projectDependencies: g};
	});
var _user$project$Indexer$ActiveFile = F2(
	function (a, b) {
		return {filePath: a, projectDirectory: b};
	});
var _user$project$Indexer$FileContents = F2(
	function (a, b) {
		return {moduleDocs: a, imports: b};
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
var _user$project$Indexer$Value = F4(
	function (a, b, c, d) {
		return {name: a, comment: b, tipe: c, args: d};
	});
var _user$project$Indexer$decodeModuleDocs = function (packageUri) {
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
				A2(_elm_lang$core$Json_Decode$index, 0, _elm_lang$core$Json_Decode$string))));
	var value = A5(
		_elm_lang$core$Json_Decode$map4,
		_user$project$Indexer$Value,
		name,
		comment,
		A2(_elm_lang$core$Json_Decode$field, 'type', _elm_lang$core$Json_Decode$string),
		_elm_lang$core$Json_Decode$maybe(args));
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
		_user$project$Indexer$ModuleDocs(packageUri),
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
				ctor: '_Tuple3',
				_0: dependency,
				_1: jsonString,
				_2: A2(
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
var _user$project$Indexer$Symbol = F4(
	function (a, b, c, d) {
		return {fullName: a, sourcePath: b, caseTipe: c, kind: d};
	});
var _user$project$Indexer$EncodedSymbol = F4(
	function (a, b, c, d) {
		return {fullName: a, sourcePath: b, caseTipe: c, kind: d};
	});
var _user$project$Indexer$Hint = F8(
	function (a, b, c, d, e, f, g, h) {
		return {name: a, moduleName: b, sourcePath: c, comment: d, tipe: e, args: f, caseTipe: g, kind: h};
	});
var _user$project$Indexer$EncodedHint = F7(
	function (a, b, c, d, e, f, g) {
		return {name: a, moduleName: b, sourcePath: c, comment: d, tipe: e, caseTipe: f, kind: g};
	});
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
var _user$project$Indexer$AskCanGoToDefinition = function (a) {
	return {ctor: 'AskCanGoToDefinition', _0: a};
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
var _user$project$Indexer$UpdateActiveHints = function (a) {
	return {ctor: 'UpdateActiveHints', _0: a};
};
var _user$project$Indexer$DocsRead = function (a) {
	return {ctor: 'DocsRead', _0: a};
};
var _user$project$Indexer$MaybeDocsDownloaded = function (a) {
	return {ctor: 'MaybeDocsDownloaded', _0: a};
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
							_user$project$Indexer$MaybeDocsDownloaded,
							_user$project$Indexer$downloadPackageDocsList(dependencies)),
						_1: {ctor: '[]'}
					}
				})
		};
	});
var _user$project$Indexer$KindModule = {ctor: 'KindModule'};
var _user$project$Indexer$moduleToHints = F2(
	function (moduleDocs, _p81) {
		var _p82 = _p81;
		var _p83 = moduleDocs;
		var name = _p83.name;
		var comment = _p83.comment;
		var sourcePath = _p83.sourcePath;
		var hint = {
			name: name,
			moduleName: '',
			sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, ''),
			comment: comment,
			tipe: '',
			args: {ctor: '[]'},
			caseTipe: _elm_lang$core$Maybe$Nothing,
			kind: _user$project$Indexer$KindModule
		};
		var _p84 = _p82.alias;
		if (_p84.ctor === 'Nothing') {
			return {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: name, _1: hint},
				_1: {ctor: '[]'}
			};
		} else {
			return {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: name, _1: hint},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: _p84._0, _1: hint},
					_1: {ctor: '[]'}
				}
			};
		}
	});
var _user$project$Indexer$KindTypeCase = {ctor: 'KindTypeCase'};
var _user$project$Indexer$unionTagsToHints = F3(
	function (moduleDocs, _p86, _p85) {
		var _p87 = _p86;
		var _p88 = _p85;
		var _p89 = _p88.name;
		var addHints = F2(
			function (tag, hints) {
				var moduleLocalName = A3(_user$project$Indexer$getModuleLocalName, moduleDocs.name, _p87.alias, tag);
				var hint = {
					name: tag,
					moduleName: moduleDocs.name,
					sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, _p89),
					comment: _p88.comment,
					tipe: _p88.tipe,
					args: _p88.args,
					caseTipe: _elm_lang$core$Maybe$Just(_p89),
					kind: _user$project$Indexer$KindTypeCase
				};
				var fullName = A2(
					_elm_lang$core$Basics_ops['++'],
					moduleDocs.name,
					A2(_elm_lang$core$Basics_ops['++'], '.', tag));
				return (A2(_elm_lang$core$Set$member, _p89, _user$project$Indexer$defaultTypes) || A2(_user$project$Indexer$isExposed, tag, _p87.exposed)) ? {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: tag, _1: hint},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: moduleLocalName, _1: hint},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: fullName, _1: hint},
							_1: hints
						}
					}
				} : {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: moduleLocalName, _1: hint},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: fullName, _1: hint},
						_1: hints
					}
				};
			});
		return A3(
			_elm_lang$core$List$foldl,
			addHints,
			{ctor: '[]'},
			_p88.cases);
	});
var _user$project$Indexer$KindType = {ctor: 'KindType'};
var _user$project$Indexer$getRecordFieldTokens = F5(
	function (name, tipeString, topLevelTokens, shouldAddSelf, maybeRootTipeString) {
		return A2(
			_elm_lang$core$List$append,
			function () {
				if (_user$project$Indexer$isRecordString(name)) {
					var getRecordFields = function (tipeString1) {
						return _elm_lang$core$List$concat(
							A2(
								_elm_lang$core$List$filterMap,
								function (field) {
									return A2(
										_elm_lang$core$Maybe$map,
										function (tipeString) {
											return A5(_user$project$Indexer$getRecordFieldTokens, field, tipeString, topLevelTokens, true, maybeRootTipeString);
										},
										A2(
											_elm_lang$core$Dict$get,
											field,
											_user$project$Indexer$getRecordTipeParts(tipeString1)));
								},
								_user$project$Indexer$getRecordArgParts(name)));
					};
					if (_user$project$Indexer$isRecordString(tipeString)) {
						return getRecordFields(tipeString);
					} else {
						var _p90 = _elm_lang$core$List$head(
							A2(
								_user$project$Indexer$getHintsForToken,
								_elm_lang$core$Maybe$Just(tipeString),
								topLevelTokens));
						if (_p90.ctor === 'Nothing') {
							return {ctor: '[]'};
						} else {
							return getRecordFields(_p90._0.tipe);
						}
					}
				} else {
					if (_user$project$Indexer$isRecordString(tipeString)) {
						return A2(
							_elm_lang$core$List$concatMap,
							function (_p91) {
								var _p92 = _p91;
								return A5(
									_user$project$Indexer$getRecordFieldTokens,
									A2(
										_elm_lang$core$Basics_ops['++'],
										name,
										A2(_elm_lang$core$Basics_ops['++'], '.', _p92._0)),
									_p92._1,
									topLevelTokens,
									true,
									maybeRootTipeString);
							},
							_elm_lang$core$Dict$toList(
								_user$project$Indexer$getRecordTipeParts(tipeString)));
					} else {
						if (_user$project$Indexer$isTupleString(name) && _user$project$Indexer$isTupleString(tipeString)) {
							return _elm_lang$core$List$concat(
								A2(
									_elm_lang$core$List$map,
									function (_p93) {
										var _p94 = _p93;
										return A5(_user$project$Indexer$getRecordFieldTokens, _p94._0, _p94._1, topLevelTokens, true, maybeRootTipeString);
									},
									A3(
										_elm_lang$core$List$map2,
										F2(
											function (v0, v1) {
												return {ctor: '_Tuple2', _0: v0, _1: v1};
											}),
										_user$project$Indexer$getTupleArgParts(name),
										_user$project$Indexer$getTupleArgParts(tipeString))));
						} else {
							var _p95 = _elm_lang$core$List$head(
								A2(
									_user$project$Indexer$getHintsForToken,
									_elm_lang$core$Maybe$Just(tipeString),
									topLevelTokens));
							if (_p95.ctor === 'Nothing') {
								return {ctor: '[]'};
							} else {
								var _p98 = _p95._0;
								var _p96 = A2(
									_elm_lang$core$Debug$log,
									'maybeRootTipeString',
									{ctor: '_Tuple3', _0: _p98, _1: tipeString, _2: maybeRootTipeString});
								if ((!_elm_lang$core$Native_Utils.eq(_p98.kind, _user$project$Indexer$KindType)) && (!_elm_lang$core$Native_Utils.eq(_p98.tipe, tipeString))) {
									var _p97 = maybeRootTipeString;
									if (_p97.ctor === 'Nothing') {
										return A5(
											_user$project$Indexer$getRecordFieldTokens,
											name,
											_p98.tipe,
											topLevelTokens,
											false,
											_elm_lang$core$Maybe$Just(_p98.name));
									} else {
										return (!_elm_lang$core$Native_Utils.eq(_p98.name, _p97._0)) ? A5(
											_user$project$Indexer$getRecordFieldTokens,
											name,
											_p98.tipe,
											topLevelTokens,
											false,
											_elm_lang$core$Maybe$Just(_p98.name)) : {ctor: '[]'};
									}
								} else {
									return {ctor: '[]'};
								}
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
var _user$project$Indexer$KindTypeAlias = {ctor: 'KindTypeAlias'};
var _user$project$Indexer$KindDefault = {ctor: 'KindDefault'};
var _user$project$Indexer$getModuleSymbols = function (moduleDocs) {
	var _p99 = moduleDocs;
	var sourcePath = _p99.sourcePath;
	var values = _p99.values;
	var moduleDocsSymbol = {fullName: moduleDocs.name, sourcePath: sourcePath, caseTipe: _elm_lang$core$Maybe$Nothing, kind: _user$project$Indexer$KindModule};
	var valueSymbols = A2(
		_elm_lang$core$List$map,
		function (value) {
			var kind = A2(_elm_lang$core$Regex$contains, _user$project$Indexer$capitalizedRegex, value.name) ? _user$project$Indexer$KindTypeAlias : _user$project$Indexer$KindDefault;
			return {
				fullName: A2(
					_elm_lang$core$Basics_ops['++'],
					moduleDocs.name,
					A2(_elm_lang$core$Basics_ops['++'], '.', value.name)),
				sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, value.name),
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
				function (caseName) {
					return {
						fullName: A2(
							_elm_lang$core$Basics_ops['++'],
							moduleDocs.name,
							A2(_elm_lang$core$Basics_ops['++'], '.', caseName)),
						sourcePath: A2(_user$project$Indexer$formatSourcePath, moduleDocs, caseName),
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
			function (_p100) {
				var _p101 = _p100;
				return _user$project$Indexer$getModuleSymbols(_p101.moduleDocs);
			},
			_elm_lang$core$Dict$values(fileContentsDict));
		return A2(
			_elm_lang$core$List$filter,
			function (_p102) {
				var _p103 = _p102;
				return !A2(_elm_lang$core$String$startsWith, _user$project$Indexer$packageDocsPrefix, _p103.sourcePath);
			},
			allFileSymbols);
	});
var _user$project$Indexer$doShowGoToSymbolView = F3(
	function (maybeProjectDirectory, maybeToken, model) {
		var _p104 = maybeProjectDirectory;
		if (_p104.ctor === 'Nothing') {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		} else {
			var hints = A2(_user$project$Indexer$getHintsForToken, maybeToken, model.activeTokens);
			var defaultSymbolName = function () {
				var _p105 = _elm_lang$core$List$head(hints);
				if (_p105.ctor === 'Nothing') {
					return maybeToken;
				} else {
					var _p107 = _p105._0;
					var _p106 = model.activeFile;
					if (_p106.ctor === 'Nothing') {
						return _elm_lang$core$Maybe$Just(_p107.name);
					} else {
						return _elm_lang$core$Native_Utils.eq(_p106._0.filePath, _p107.sourcePath) ? _elm_lang$core$Maybe$Just(
							_user$project$Indexer$getLastName(_p107.name)) : _elm_lang$core$Maybe$Just(_p107.name);
					}
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
							A2(_user$project$Indexer$getProjectFileSymbols, _p104._0, model.projectFileContentsDict))
					})
			};
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
		var _p108 = maybeActiveFile;
		if (_p108.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			return A2(
				_elm_lang$core$List$append,
				A2(_user$project$Indexer$getProjectFileSymbols, _p108._0.projectDirectory, projectFileContentsDict),
				A3(_user$project$Indexer$getProjectDependencySymbols, maybeActiveFile, projectDependencies, packageDocs));
		}
	});
var _user$project$Indexer$doShowAddImportView = F3(
	function (filePath, maybeToken, model) {
		var defaultSymbolName = function () {
			var _p109 = maybeToken;
			if (_p109.ctor === 'Nothing') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p111 = _p109._0;
				var _p110 = _user$project$Indexer$getModuleName(_p111);
				if (_p110 === '') {
					return _elm_lang$core$Maybe$Just(
						_user$project$Indexer$getLastName(_p111));
				} else {
					return _elm_lang$core$Maybe$Just(
						_user$project$Indexer$getModuleName(_p111));
				}
			}
		}();
		var moduleAndSymbols = A2(
			_elm_lang$core$List$map,
			_user$project$Indexer$getModuleAndSymbolName,
			A2(
				_elm_lang$core$List$filter,
				function (_p112) {
					var _p113 = _p112;
					return (!_elm_lang$core$Native_Utils.eq(_p113.sourcePath, filePath)) && (!_elm_lang$core$Native_Utils.eq(
						_user$project$Indexer$getLastName(_p113.fullName),
						''));
				},
				A4(_user$project$Indexer$getProjectSymbols, model.activeFile, model.projectFileContentsDict, model.projectDependencies, model.packageDocs)));
		var modulesOnly = A2(
			_elm_lang$core$List$filter,
			function (_p114) {
				var _p115 = _p114;
				var _p116 = _p115._1;
				if (_p116.ctor === 'Nothing') {
					return true;
				} else {
					return false;
				}
			},
			moduleAndSymbols);
		var moduleAndSymbolsAndAllExposed = A2(
			_elm_lang$core$List$sortWith,
			F2(
				function (_p118, _p117) {
					var _p119 = _p118;
					var _p120 = _p117;
					var filterKey = F2(
						function (moduleName, symbolName) {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								moduleName,
								function () {
									var _p121 = symbolName;
									if (_p121.ctor === 'Nothing') {
										return '';
									} else {
										return A2(_elm_lang$core$Basics_ops['++'], ' ', _p121._0);
									}
								}());
						});
					return A2(
						_elm_lang$core$Basics$compare,
						A2(filterKey, _p119._0, _p119._1),
						A2(filterKey, _p120._0, _p120._1));
				}),
			A2(
				_elm_lang$core$List$append,
				moduleAndSymbols,
				A2(
					_elm_lang$core$List$map,
					function (_p122) {
						var _p123 = _p122;
						return {
							ctor: '_Tuple2',
							_0: _p123._0,
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
var _user$project$Indexer$emptyHint = {
	name: '',
	moduleName: '',
	sourcePath: '',
	comment: '',
	tipe: '',
	args: {ctor: '[]'},
	caseTipe: _elm_lang$core$Maybe$Nothing,
	kind: _user$project$Indexer$KindDefault
};
var _user$project$Indexer$defaultSuggestions = A2(
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
						_0: 'number',
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
																							_0: 'open',
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
																														_0: 'hiding',
																														_1: {
																															ctor: '::',
																															_0: 'export',
																															_1: {
																																ctor: '::',
																																_0: 'foreign',
																																_1: {
																																	ctor: '::',
																																	_0: 'perform',
																																	_1: {
																																		ctor: '::',
																																		_0: 'deriving',
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
							}
						}
					}
				}
			}
		}
	});
var _user$project$Indexer$getFilteredHints = F3(
	function (moduleDocs, maybeActiveTopLevel, importData) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$List$concatMap,
				A2(_user$project$Indexer$unionTagsToHints, moduleDocs, importData),
				moduleDocs.values.tipes),
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$List$concatMap,
					A3(_user$project$Indexer$nameToHints, moduleDocs, importData, _user$project$Indexer$KindTypeAlias),
					moduleDocs.values.aliases),
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$List$concatMap,
						A3(_user$project$Indexer$nameToHints, moduleDocs, importData, _user$project$Indexer$KindType),
						A2(_elm_lang$core$List$map, _user$project$Indexer$tipeToValue, moduleDocs.values.tipes)),
					A2(
						_elm_lang$core$Basics_ops['++'],
						A2(
							_elm_lang$core$List$concatMap,
							A3(_user$project$Indexer$nameToHints, moduleDocs, importData, _user$project$Indexer$KindDefault),
							moduleDocs.values.values),
						A2(_user$project$Indexer$moduleToHints, moduleDocs, importData)))));
	});
var _user$project$Indexer$topLevelArgToHints = F3(
	function (maybeActiveTopLevel, topLevelTokens, _p124) {
		var _p125 = _p124;
		var _p132 = _p125._1;
		var _p131 = _p125._0;
		var tipes = function () {
			var getRecordFields = function (tipeString) {
				return _elm_lang$core$List$concat(
					A2(
						_elm_lang$core$List$filterMap,
						function (field) {
							return A2(
								_elm_lang$core$Maybe$map,
								function (tipeString) {
									return A5(_user$project$Indexer$getRecordFieldTokens, field, tipeString, topLevelTokens, true, _elm_lang$core$Maybe$Nothing);
								},
								A2(
									_elm_lang$core$Dict$get,
									field,
									_user$project$Indexer$getRecordTipeParts(tipeString)));
						},
						_user$project$Indexer$getRecordArgParts(_p131)));
			};
			var _p126 = {
				ctor: '_Tuple2',
				_0: _user$project$Indexer$isRecordString(_p131),
				_1: _user$project$Indexer$isRecordString(_p132)
			};
			if (_p126._0 === true) {
				if (_p126._1 === true) {
					return getRecordFields(_p132);
				} else {
					var _p127 = _elm_lang$core$List$head(
						A2(
							_user$project$Indexer$getHintsForToken,
							_elm_lang$core$Maybe$Just(_p132),
							topLevelTokens));
					if (_p127.ctor === 'Nothing') {
						return {ctor: '[]'};
					} else {
						return getRecordFields(_p127._0.tipe);
					}
				}
			} else {
				return A5(_user$project$Indexer$getRecordFieldTokens, _p131, _p132, topLevelTokens, true, _elm_lang$core$Maybe$Nothing);
			}
		}();
		var getHint = function (_p128) {
			var _p129 = _p128;
			var _p130 = _p129._0;
			var hint = {
				name: _p130,
				moduleName: '',
				sourcePath: '',
				comment: '',
				tipe: _p129._1,
				args: {ctor: '[]'},
				caseTipe: _elm_lang$core$Maybe$Nothing,
				kind: _user$project$Indexer$KindDefault
			};
			return {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: _p130, _1: hint},
				_1: {ctor: '[]'}
			};
		};
		return A2(_elm_lang$core$List$concatMap, getHint, tipes);
	});
var _user$project$Indexer$All = {ctor: 'All'};
var _user$project$Indexer$getImportsPlusActiveModule = function (fileContents) {
	return A3(
		_elm_lang$core$Dict$update,
		fileContents.moduleDocs.name,
		_elm_lang$core$Basics$always(
			_elm_lang$core$Maybe$Just(
				{alias: _elm_lang$core$Maybe$Nothing, exposed: _user$project$Indexer$All})),
		fileContents.imports);
};
var _user$project$Indexer$Some = function (a) {
	return {ctor: 'Some', _0: a};
};
var _user$project$Indexer$None = {ctor: 'None'};
var _user$project$Indexer$toImport = function (_p133) {
	var _p134 = _p133;
	var exposedSet = function () {
		var _p135 = _p134.exposed;
		if (_p135.ctor === 'Nothing') {
			return _user$project$Indexer$None;
		} else {
			if (((_p135._0.ctor === '::') && (_p135._0._0 === '..')) && (_p135._0._1.ctor === '[]')) {
				return _user$project$Indexer$All;
			} else {
				return _user$project$Indexer$Some(
					_elm_lang$core$Set$fromList(_p135._0));
			}
		}
	}();
	return {
		ctor: '_Tuple2',
		_0: _p134.name,
		_1: A2(_user$project$Indexer$Import, _p134.alias, exposedSet)
	};
};
var _user$project$Indexer$defaultImports = _elm_lang$core$Dict$fromList(
	{
		ctor: '::',
		_0: A2(_user$project$Indexer_ops['=>'], 'Basics', _user$project$Indexer$All),
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
						_0: A2(_user$project$Indexer_ops['=>'], 'String', _user$project$Indexer$None),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Indexer_ops['=>'], 'Tuple', _user$project$Indexer$None),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Indexer_ops['=>'], 'Debug', _user$project$Indexer$None),
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
		var _p136 = maybeActiveFile;
		if (_p136.ctor === 'Nothing') {
			return _user$project$Indexer$emptyFileContents;
		} else {
			var _p137 = A2(_elm_lang$core$Dict$get, _p136._0.filePath, fileContentsDict);
			if (_p137.ctor === 'Just') {
				return _p137._0;
			} else {
				return _user$project$Indexer$emptyFileContents;
			}
		}
	});
var _user$project$Indexer$doGetImporterSourcePathsForToken = F4(
	function (maybeProjectDirectory, maybeToken, maybeIsCursorAtLastPartOfToken, model) {
		var _p138 = {ctor: '_Tuple3', _0: maybeProjectDirectory, _1: maybeToken, _2: maybeIsCursorAtLastPartOfToken};
		if ((((_p138.ctor === '_Tuple3') && (_p138._0.ctor === 'Just')) && (_p138._1.ctor === 'Just')) && (_p138._2.ctor === 'Just')) {
			var _p142 = _p138._1._0;
			var _p141 = _p138._0._0;
			var _p140 = _p138._2._0;
			var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p141, model.projectFileContentsDict);
			var activeFileContents = A2(_user$project$Indexer$getActiveFileContents, model.activeFile, fileContentsDict);
			var _p139 = _elm_lang$core$Native_Utils.eq(_p142, activeFileContents.moduleDocs.name) ? {ctor: '_Tuple2', _0: _p142, _1: true} : ((!_elm_lang$core$Native_Utils.eq(
				A2(_elm_lang$core$Dict$get, _p142, activeFileContents.imports),
				_elm_lang$core$Maybe$Nothing)) ? {ctor: '_Tuple2', _0: _p142, _1: true} : (_p140 ? {ctor: '_Tuple2', _0: _p142, _1: false} : {
				ctor: '_Tuple2',
				_0: _user$project$Indexer$getModuleName(_p142),
				_1: false
			}));
			var token = _p139._0;
			var willUseFullToken = _p139._1;
			return {
				ctor: '_Tuple2',
				_0: model,
				_1: _user$project$Indexer$importersForTokenReceivedCmd(
					{
						ctor: '_Tuple5',
						_0: _p141,
						_1: _p142,
						_2: willUseFullToken,
						_3: _p140,
						_4: A6(_user$project$Indexer$getImportersForToken, token, _p140, model.activeFile, model.activeTokens, activeFileContents, model.projectFileContentsDict)
					})
			};
		} else {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _user$project$Indexer$getImportsPlusActiveModuleForActiveFile = F2(
	function (maybeActiveFile, fileContentsDict) {
		return _user$project$Indexer$getImportsPlusActiveModule(
			A2(_user$project$Indexer$getActiveFileContents, maybeActiveFile, fileContentsDict));
	});
var _user$project$Indexer$getExposedHints = F3(
	function (maybeActiveFile, projectFileContentsDict, projectPackageDocs) {
		var _p143 = maybeActiveFile;
		if (_p143.ctor === 'Nothing') {
			return _elm_lang$core$Set$empty;
		} else {
			var _p149 = _p143._0.projectDirectory;
			var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p149, projectFileContentsDict);
			var importsPlusActiveModule = A2(_user$project$Indexer$getImportsPlusActiveModuleForActiveFile, maybeActiveFile, fileContentsDict);
			var importedModuleNames = _elm_lang$core$Dict$keys(importsPlusActiveModule);
			var importedModuleDocs = A2(
				_elm_lang$core$List$filter,
				function (moduleDocs) {
					return A2(_elm_lang$core$List$member, moduleDocs.name, importedModuleNames);
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					projectPackageDocs,
					A2(_user$project$Indexer$getProjectModuleDocs, _p149, projectFileContentsDict)));
			var imports = _elm_lang$core$Dict$values(importsPlusActiveModule);
			return _elm_lang$core$Set$fromList(
				A2(
					_elm_lang$core$List$concatMap,
					function (moduleDocs) {
						var exposed = function () {
							var _p144 = A2(_elm_lang$core$Dict$get, moduleDocs.name, importsPlusActiveModule);
							if (_p144.ctor === 'Nothing') {
								return _user$project$Indexer$None;
							} else {
								return _p144._0.exposed;
							}
						}();
						return A2(
							_elm_lang$core$List$map,
							function (name) {
								return {ctor: '_Tuple2', _0: moduleDocs.name, _1: name};
							},
							A2(
								_elm_lang$core$Basics_ops['++'],
								A2(
									_elm_lang$core$List$map,
									function (_) {
										return _.name;
									},
									A2(
										_elm_lang$core$List$filter,
										function (_p145) {
											var _p146 = _p145;
											return A2(_user$project$Indexer$isExposed, _p146.name, exposed);
										},
										A2(
											_elm_lang$core$Basics_ops['++'],
											moduleDocs.values.aliases,
											A2(
												_elm_lang$core$Basics_ops['++'],
												A2(_elm_lang$core$List$map, _user$project$Indexer$tipeToValue, moduleDocs.values.tipes),
												moduleDocs.values.values)))),
								A2(
									_elm_lang$core$List$concatMap,
									function (_p147) {
										var _p148 = _p147;
										return A2(
											_elm_lang$core$List$filter,
											function (kase) {
												return A2(_elm_lang$core$Set$member, _p148.name, _user$project$Indexer$defaultTypes) || A2(_user$project$Indexer$isExposed, kase, exposed);
											},
											_p148.cases);
									},
									moduleDocs.values.tipes)));
					},
					importedModuleDocs));
		}
	});
var _user$project$Indexer$getHintsForPartial = F5(
	function (partial, maybeActiveFile, projectFileContentsDict, projectPackageDocs, tokens) {
		var _p150 = maybeActiveFile;
		if (_p150.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			var defaultHints = A2(
				_elm_lang$core$List$filter,
				function (_p151) {
					var _p152 = _p151;
					return A2(_elm_lang$core$String$startsWith, partial, _p152.name);
				},
				_user$project$Indexer$defaultSuggestions);
			var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p150._0.projectDirectory, projectFileContentsDict);
			var activeFileContents = A2(_user$project$Indexer$getActiveFileContents, maybeActiveFile, fileContentsDict);
			var importAliases = A2(
				_elm_lang$core$List$filterMap,
				function (_p153) {
					var _p154 = _p153;
					var _p155 = _p154.alias;
					if (_p155.ctor === 'Nothing') {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						var _p156 = _p155._0;
						return A2(_elm_lang$core$String$startsWith, partial, _p156) ? _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								_user$project$Indexer$emptyHint,
								{name: _p156})) : _elm_lang$core$Maybe$Nothing;
					}
				},
				_elm_lang$core$Dict$values(activeFileContents.imports));
			var exposedSet = A3(_user$project$Indexer$getExposedHints, maybeActiveFile, projectFileContentsDict, projectPackageDocs);
			var exposedNames = A2(_elm_lang$core$Set$map, _elm_lang$core$Tuple$second, exposedSet);
			var maybeIncludeHint = function (hint) {
				var isIncluded = (_elm_lang$core$Native_Utils.eq(hint.moduleName, '') || A2(
					_elm_lang$core$Set$member,
					{ctor: '_Tuple2', _0: hint.moduleName, _1: hint.name},
					exposedSet)) ? A2(_elm_lang$core$String$startsWith, partial, hint.name) : true;
				if (!isIncluded) {
					return _elm_lang$core$Maybe$Nothing;
				} else {
					var nameToShow = function () {
						if (_elm_lang$core$Native_Utils.eq(hint.moduleName, '')) {
							return hint.name;
						} else {
							if (A2(
								_elm_lang$core$Set$member,
								{ctor: '_Tuple2', _0: hint.moduleName, _1: hint.name},
								exposedSet)) {
								return hint.name;
							} else {
								var moduleNamePrefix = function () {
									var _p157 = A2(_elm_lang$core$Dict$get, hint.moduleName, activeFileContents.imports);
									if (_p157.ctor === 'Nothing') {
										return '';
									} else {
										var _p158 = _p157._0.alias;
										if (_p158.ctor === 'Nothing') {
											return A2(_elm_lang$core$Basics_ops['++'], hint.moduleName, '.');
										} else {
											return A2(_elm_lang$core$Basics_ops['++'], _p158._0, '.');
										}
									}
								}();
								return A2(_elm_lang$core$Basics_ops['++'], moduleNamePrefix, hint.name);
							}
						}
					}();
					var moduleNameToShow = (_elm_lang$core$Native_Utils.eq(hint.moduleName, '') || _elm_lang$core$Native_Utils.eq(activeFileContents.moduleDocs.name, hint.moduleName)) ? '' : hint.moduleName;
					return _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							hint,
							{name: nameToShow, moduleName: moduleNameToShow}));
				}
			};
			var hints = A2(
				_elm_lang$core$List$concatMap,
				_elm_lang$core$Basics$identity,
				_elm_lang$core$Dict$values(
					A2(
						_elm_lang$core$Dict$map,
						F2(
							function (token, hints) {
								var isIncluded = A2(
									_elm_lang$core$Set$member,
									_user$project$Indexer$getLastName(token),
									exposedNames) ? (A2(
									_elm_lang$core$String$startsWith,
									partial,
									_user$project$Indexer$getLastName(token)) || A2(_elm_lang$core$String$startsWith, partial, token)) : A2(_elm_lang$core$String$startsWith, partial, token);
								return isIncluded ? A2(_elm_lang$core$List$filterMap, maybeIncludeHint, hints) : {ctor: '[]'};
							}),
						tokens)));
			return A2(
				_elm_lang$core$List$sortBy,
				function (_) {
					return _.name;
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					importAliases,
					A2(_elm_lang$core$Basics_ops['++'], hints, defaultHints)));
		}
	});
var _user$project$Indexer$doGetHintsForPartial = F2(
	function (partial, model) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$Indexer$hintsForPartialReceivedCmd(
				{
					ctor: '_Tuple2',
					_0: partial,
					_1: A2(
						_elm_lang$core$List$map,
						_user$project$Indexer$encodeHint,
						A5(
							_user$project$Indexer$getHintsForPartial,
							partial,
							model.activeFile,
							model.projectFileContentsDict,
							A3(_user$project$Indexer$getProjectPackageDocs, model.activeFile, model.projectDependencies, model.packageDocs),
							model.activeTokens))
				})
		};
	});
var _user$project$Indexer$getActiveTokens = F4(
	function (maybeActiveFile, maybeActiveTopLevel, projectFileContentsDict, projectPackageDocs) {
		var _p159 = maybeActiveFile;
		if (_p159.ctor === 'Nothing') {
			return _elm_lang$core$Dict$empty;
		} else {
			var _p164 = _p159._0.projectDirectory;
			var insert = F2(
				function (_p160, dict) {
					var _p161 = _p160;
					return A3(
						_elm_lang$core$Dict$update,
						_p161._0,
						function (value) {
							return _elm_lang$core$Maybe$Just(
								{
									ctor: '::',
									_0: _p161._1,
									_1: A2(
										_elm_lang$core$Maybe$withDefault,
										{ctor: '[]'},
										value)
								});
						},
						dict);
				});
			var fileContentsDict = A2(_user$project$Indexer$getFileContentsOfProject, _p164, projectFileContentsDict);
			var getHints = function (moduleDocs) {
				return A2(
					_elm_lang$core$Maybe$map,
					A2(_user$project$Indexer$getFilteredHints, moduleDocs, maybeActiveTopLevel),
					A2(
						_elm_lang$core$Dict$get,
						moduleDocs.name,
						A2(_user$project$Indexer$getImportsPlusActiveModuleForActiveFile, maybeActiveFile, fileContentsDict)));
			};
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
							A2(_user$project$Indexer$getProjectModuleDocs, _p164, projectFileContentsDict)))));
			var topLevelArgTipePairs = A2(
				_elm_lang$core$List$concatMap,
				function (_p162) {
					var _p163 = _p162;
					return A3(
						_elm_lang$core$List$map2,
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						_p163.args,
						_user$project$Indexer$getTipeParts(_p163.tipe));
				},
				A2(_user$project$Indexer$getHintsForToken, maybeActiveTopLevel, topLevelTokens));
			var argHints = A2(
				_elm_lang$core$List$concatMap,
				A2(_user$project$Indexer$topLevelArgToHints, maybeActiveTopLevel, topLevelTokens),
				topLevelArgTipePairs);
			return A3(_elm_lang$core$List$foldl, insert, topLevelTokens, argHints);
		}
	});
var _user$project$Indexer$doUpdateActiveHints = F3(
	function (maybeActiveTopLevel, maybeToken, model) {
		var updatedActiveTokens = A4(
			_user$project$Indexer$getActiveTokens,
			model.activeFile,
			maybeActiveTopLevel,
			model.projectFileContentsDict,
			A3(_user$project$Indexer$getProjectPackageDocs, model.activeFile, model.projectDependencies, model.packageDocs));
		var updatedActiveHints = A2(_user$project$Indexer$getHintsForToken, maybeToken, updatedActiveTokens);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{activeTopLevel: maybeActiveTopLevel, activeHints: updatedActiveHints}),
			_1: _user$project$Indexer$activeHintsChangedCmd(
				A2(_elm_lang$core$List$map, _user$project$Indexer$encodeHint, updatedActiveHints))
		};
	});
var _user$project$Indexer$doUpdateActiveFile = F4(
	function (maybeActiveFile, maybeActiveTopLevel, maybeToken, model) {
		var updatedActiveTokens = A4(
			_user$project$Indexer$getActiveTokens,
			maybeActiveFile,
			maybeActiveTopLevel,
			model.projectFileContentsDict,
			A3(_user$project$Indexer$getProjectPackageDocs, maybeActiveFile, model.projectDependencies, model.packageDocs));
		var updatedActiveHints = A2(_user$project$Indexer$getHintsForToken, maybeToken, updatedActiveTokens);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{activeFile: maybeActiveFile, activeTopLevel: maybeActiveTopLevel, activeTokens: updatedActiveTokens, activeHints: updatedActiveHints}),
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: _user$project$Indexer$activeFileChangedCmd(maybeActiveFile),
					_1: {
						ctor: '::',
						_0: _user$project$Indexer$activeHintsChangedCmd(
							A2(_elm_lang$core$List$map, _user$project$Indexer$encodeHint, updatedActiveHints)),
						_1: {ctor: '[]'}
					}
				})
		};
	});
var _user$project$Indexer$doUpdateFileContents = F4(
	function (filePath, projectDirectory, fileContents, model) {
		var updatedProjectFileContentsDict = A4(_user$project$Indexer$updateFileContents, filePath, projectDirectory, fileContents, model.projectFileContentsDict);
		var updatedActiveTokens = A4(
			_user$project$Indexer$getActiveTokens,
			model.activeFile,
			model.activeTopLevel,
			updatedProjectFileContentsDict,
			A3(_user$project$Indexer$getProjectPackageDocs, model.activeFile, model.projectDependencies, model.packageDocs));
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{projectFileContentsDict: updatedProjectFileContentsDict, activeTokens: updatedActiveTokens}),
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
				_elm_lang$core$Basics$always(
					_elm_lang$core$Maybe$Just(updatedFileContentsDict)),
				model.projectFileContentsDict);
		}();
		var updatedActiveTokens = A4(
			_user$project$Indexer$getActiveTokens,
			model.activeFile,
			model.activeTopLevel,
			updatedProjectFileContentsDict,
			A3(_user$project$Indexer$getProjectPackageDocs, model.activeFile, model.projectDependencies, model.packageDocs));
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{projectFileContentsDict: updatedProjectFileContentsDict, activeTokens: updatedActiveTokens}),
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
			function (_p165) {
				var _p166 = _p165;
				return !A2(_elm_lang$core$List$member, _p166.sourcePath, existingPackages);
			},
			loadedPackageDocs);
		var updatedPackageDocs = A2(
			_elm_lang$core$Basics_ops['++'],
			A2(_elm_lang$core$List$map, _user$project$Indexer$truncateModuleComment, missingPackageDocs),
			model.packageDocs);
		var updatedActiveTokens = A4(
			_user$project$Indexer$getActiveTokens,
			model.activeFile,
			model.activeTopLevel,
			model.projectFileContentsDict,
			A3(_user$project$Indexer$getProjectPackageDocs, model.activeFile, model.projectDependencies, updatedPackageDocs));
		return _elm_lang$core$Native_Utils.update(
			model,
			{packageDocs: updatedPackageDocs, activeTokens: updatedActiveTokens});
	});
var _user$project$Indexer$importsToString = F2(
	function (imports, tokens) {
		return A2(
			_elm_lang$core$String$join,
			'\n',
			A2(
				_elm_lang$core$List$map,
				function (_p167) {
					var _p168 = _p167;
					var _p175 = _p168._0;
					var formatExposedSymbol = function (token) {
						var hints = A2(
							_user$project$Indexer$getHintsForToken,
							_elm_lang$core$Maybe$Just(token),
							tokens);
						var formatSymbol = function (token) {
							return ((!_elm_lang$core$Native_Utils.eq(token, '..')) && _user$project$Indexer$isInfix(token)) ? A2(
								_elm_lang$core$Basics_ops['++'],
								'(',
								A2(_elm_lang$core$Basics_ops['++'], token, ')')) : token;
						};
						var _p169 = _elm_lang$core$List$head(hints);
						if (_p169.ctor === 'Nothing') {
							return formatSymbol(token);
						} else {
							var _p170 = _p169._0.caseTipe;
							if (_p170.ctor === 'Nothing') {
								return formatSymbol(token);
							} else {
								return A2(
									_elm_lang$core$Basics_ops['++'],
									_p170._0,
									A2(
										_elm_lang$core$Basics_ops['++'],
										'(',
										A2(
											_elm_lang$core$Basics_ops['++'],
											formatSymbol(token),
											')')));
							}
						}
					};
					var exposingPart = function () {
						var _p171 = _p168._1.exposed;
						switch (_p171.ctor) {
							case 'None':
								return '';
							case 'All':
								return ' exposing (..)';
							default:
								var nonDefaultExposedSymbols = A2(
									_elm_lang$core$Set$filter,
									function (exposedSymbolName) {
										var _p172 = A2(_elm_lang$core$Dict$get, _p175, _user$project$Indexer$defaultImports);
										if (_p172.ctor === 'Nothing') {
											return true;
										} else {
											var _p173 = _p172._0.exposed;
											if (_p173.ctor === 'Some') {
												return !A2(_elm_lang$core$Set$member, exposedSymbolName, _p173._0);
											} else {
												return true;
											}
										}
									},
									_p171._0);
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
						var _p174 = _p168._1.alias;
						if (_p174.ctor === 'Nothing') {
							return A2(_elm_lang$core$Basics_ops['++'], 'import ', _p175);
						} else {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'import ',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_p175,
									A2(_elm_lang$core$Basics_ops['++'], ' as ', _p174._0)));
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
				var _p176 = A2(_elm_lang$core$Dict$get, moduleName, fileContents.imports);
				if (_p176.ctor === 'Nothing') {
					var importToAdd = function () {
						var _p177 = maybeSymbolName;
						if (_p177.ctor === 'Nothing') {
							return {alias: _elm_lang$core$Maybe$Nothing, exposed: _user$project$Indexer$None};
						} else {
							return {
								alias: _elm_lang$core$Maybe$Nothing,
								exposed: _user$project$Indexer$Some(
									_elm_lang$core$Set$singleton(_p177._0))
							};
						}
					}();
					return A3(_elm_lang$core$Dict$insert, moduleName, importToAdd, fileContents.imports);
				} else {
					var _p181 = _p176._0;
					var _p178 = maybeSymbolName;
					if (_p178.ctor === 'Nothing') {
						return fileContents.imports;
					} else {
						var _p180 = _p178._0;
						var _p179 = _p181.exposed;
						switch (_p179.ctor) {
							case 'All':
								return fileContents.imports;
							case 'Some':
								return _elm_lang$core$Native_Utils.eq(_p180, '..') ? A3(
									_elm_lang$core$Dict$update,
									moduleName,
									_elm_lang$core$Basics$always(
										_elm_lang$core$Maybe$Just(
											_elm_lang$core$Native_Utils.update(
												_p181,
												{exposed: _user$project$Indexer$All}))),
									fileContents.imports) : A3(
									_elm_lang$core$Dict$update,
									moduleName,
									_elm_lang$core$Basics$always(
										_elm_lang$core$Maybe$Just(
											_elm_lang$core$Native_Utils.update(
												_p181,
												{
													exposed: _user$project$Indexer$Some(
														A2(_elm_lang$core$Set$insert, _p180, _p179._0))
												}))),
									fileContents.imports);
							default:
								return A3(
									_elm_lang$core$Dict$update,
									moduleName,
									_elm_lang$core$Basics$always(
										_elm_lang$core$Maybe$Just(
											_elm_lang$core$Native_Utils.update(
												_p181,
												{
													exposed: _user$project$Indexer$Some(
														_elm_lang$core$Set$singleton(_p180))
												}))),
									fileContents.imports);
						}
					}
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
					_1: A2(_user$project$Indexer$importsToString, updatedImports, model.activeTokens)
				})
		};
	});
var _user$project$Indexer$update = F2(
	function (msg, model) {
		var _p182 = msg;
		switch (_p182.ctor) {
			case 'MaybeDocsDownloaded':
				if (_p182._0.ctor === 'Err') {
					return {
						ctor: '_Tuple2',
						_0: model,
						_1: _user$project$Indexer$downloadDocsFailedCmd(
							{ctor: '_Tuple0'})
					};
				} else {
					var _p187 = _p182._0._0;
					var loadedDependenciesAndJson = A2(
						_elm_lang$core$List$map,
						function (_p183) {
							var _p184 = _p183;
							return {ctor: '_Tuple2', _0: _p184._0, _1: _p184._1};
						},
						_p187);
					var loadedPackageDocs = A2(
						_elm_lang$core$List$concatMap,
						function (_p185) {
							var _p186 = _p185;
							return _p186._2;
						},
						_p187);
					return {
						ctor: '_Tuple2',
						_0: A2(_user$project$Indexer$addLoadedPackageDocs, loadedPackageDocs, model),
						_1: _user$project$Indexer$docsDownloadedCmd(loadedDependenciesAndJson)
					};
				}
			case 'DocsRead':
				var loadedPackageDocs = A2(
					_elm_lang$core$List$concatMap,
					function (_p188) {
						var _p189 = _p188;
						return A2(
							_user$project$Indexer$toModuleDocs,
							_user$project$Indexer$toPackageUri(_p189._0),
							_p189._1);
					},
					_p182._0);
				return {
					ctor: '_Tuple2',
					_0: A2(_user$project$Indexer$addLoadedPackageDocs, loadedPackageDocs, model),
					_1: _user$project$Indexer$docsReadCmd(
						{ctor: '_Tuple0'})
				};
			case 'UpdateActiveHints':
				return A3(_user$project$Indexer$doUpdateActiveHints, _p182._0._0, _p182._0._1, model);
			case 'UpdateActiveFile':
				return A4(_user$project$Indexer$doUpdateActiveFile, _p182._0._0, _p182._0._1, _p182._0._2, model);
			case 'UpdateFileContents':
				return A4(_user$project$Indexer$doUpdateFileContents, _p182._0, _p182._1, _p182._2, model);
			case 'RemoveFileContents':
				return A3(_user$project$Indexer$doRemoveFileContents, _p182._0._0, _p182._0._1, model);
			case 'UpdateProjectDependencies':
				return A3(_user$project$Indexer$doUpdateProjectDependencies, _p182._0._0, _p182._0._1, model);
			case 'DownloadMissingPackageDocs':
				return A2(_user$project$Indexer$doDownloadMissingPackageDocs, _p182._0, model);
			case 'GoToDefinition':
				return A2(_user$project$Indexer$doGoToDefinition, _p182._0, model);
			case 'ShowGoToSymbolView':
				return A3(_user$project$Indexer$doShowGoToSymbolView, _p182._0._0, _p182._0._1, model);
			case 'GetHintsForPartial':
				return A2(_user$project$Indexer$doGetHintsForPartial, _p182._0, model);
			case 'GetSuggestionsForImport':
				return A2(_user$project$Indexer$doGetSuggestionsForImport, _p182._0, model);
			case 'AskCanGoToDefinition':
				return A2(_user$project$Indexer$doAskCanGoToDefinition, _p182._0, model);
			case 'GetImporterSourcePathsForToken':
				return A4(_user$project$Indexer$doGetImporterSourcePathsForToken, _p182._0._0, _p182._0._1, _p182._0._2, model);
			case 'ShowAddImportView':
				return A3(_user$project$Indexer$doShowAddImportView, _p182._0._0, _p182._0._1, model);
			default:
				return A5(_user$project$Indexer$doAddImport, _p182._0._0, _p182._0._1, _p182._0._2, _p182._0._3, model);
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
			_0: _user$project$Indexer$activeTokenChangedSub(_user$project$Indexer$UpdateActiveHints),
			_1: {
				ctor: '::',
				_0: _user$project$Indexer$activeFileChangedSub(_user$project$Indexer$UpdateActiveFile),
				_1: {
					ctor: '::',
					_0: _user$project$Indexer$fileContentsChangedSub(
						function (_p190) {
							var _p191 = _p190;
							return A3(
								_user$project$Indexer$UpdateFileContents,
								_p191._0,
								_p191._1,
								A2(
									_user$project$Indexer$FileContents,
									_p191._2,
									_user$project$Indexer$toImportDict(_p191._3)));
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
											_0: _user$project$Indexer$showGoToSymbolViewSub(_user$project$Indexer$ShowGoToSymbolView),
											_1: {
												ctor: '::',
												_0: _user$project$Indexer$getHintsForPartialSub(_user$project$Indexer$GetHintsForPartial),
												_1: {
													ctor: '::',
													_0: _user$project$Indexer$getSuggestionsForImportSub(_user$project$Indexer$GetSuggestionsForImport),
													_1: {
														ctor: '::',
														_0: _user$project$Indexer$askCanGoToDefinitionSub(_user$project$Indexer$AskCanGoToDefinition),
														_1: {
															ctor: '::',
															_0: _user$project$Indexer$getImportersForTokenSub(_user$project$Indexer$GetImporterSourcePathsForToken),
															_1: {
																ctor: '::',
																_0: _user$project$Indexer$showAddImportViewSub(_user$project$Indexer$ShowAddImportView),
																_1: {
																	ctor: '::',
																	_0: _user$project$Indexer$addImportSub(_user$project$Indexer$AddImport),
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

