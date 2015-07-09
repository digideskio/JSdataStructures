import taser from 'taser';

/*!
 * TODO:
 * 1. Add a `between` method (Linear)
 * 2. `getValues` should return values in order
 * 3. `forEach` should iterate values in order
 * 4. Add time complexity for all methods
 * 5. Find best time to rebalance
 */
let BinarySearchTree = class BinarySearchTree {

  constructor (value, parent, opts) {
    taser(['number'], value);
    taser(['object', 'undefined'], parent);
    taser(['object', 'undefined'], opts);
    this.value = value;
    this.left = null;
    this.right = null;
    // Options
    opts = (opts === undefined) ? {} : opts;
    this.opts = {};
    this.opts.selfRebalance = (opts.selfRebalance === undefined) ? true : opts.selfRebalance;
  }

  insert (value) {
    taser(['number'], value);
    return this._insert(value) && this._checkForRebalance();
  }

  remove (value) {
    taser(['number'], value);
    return this._remove(value) && this._checkForRebalance();
  }

  contains (value) {
    taser(['number'], value);
    return this._contains(value);
  }

  getValues () {
    return this._getValues('_forEach');
  }

  getValuesDepthFirst () {
    return this._getValues('forEachDepthFirst');
  }

  getValuesBreadthFirst () {
    return this._getValues('forEachBreadthFirst');
  }

  forEach (callback) {
    taser(['function'], callback);
    return this._forEach(value => callback(value));
  }

  forEachDepthFirst (callback) {
    taser(['function'], callback);
    return this._forEachDepthFirst(value => callback(value));
  }

  forEachBreadthFirst (callback) {
    taser(['function'], callback);
    // NOTE: Naive implementation. Is there a faster way?
    // NOTE: Implement with a priority queue?
    let values = {};
    let maxLevel = 0;
    this._forEachDepthFirst((value, level, leftValue, rightValue) => {
      if (values[level] === undefined) values[level] = [];
      values[level].push(value);
      maxLevel = Math.max(maxLevel, level);
    });
    for (let key = 0; key <= maxLevel; key += 1) {
      for (let i = 0; i < values[key].length; i += 1) {
        callback(values[key][i]);
      }
    }
    return;
  }

  between (lowerValue, higherValue) {
    let low = Math.min(lowerValue, higherValue);
    let high = Math.max(lowerValue, higherValue);
    return this._between(low, high, []);
  }

  getMaxDepth () {
    let getMaxDepth = (side) => {
      if (this[side] === null) return 0;
      return this[side].getMaxDepth();
    };
    return Math.max.apply(null, [ getMaxDepth('left') + 1, getMaxDepth('right') + 1 ]);
  }

  getMinDepth () {
    let _getMinDepth = (side) => {
      if (this[side] === null) return 0;
      return this[side].getMinDepth();
    };
    return Math.min.apply(null, [ _getMinDepth('left') + 1, _getMinDepth('right') + 1 ]);
  }

  _insert (value) {
    if (this.value === null) this.value = value;
    if (value < this.value) {
      if (this.left instanceof BinarySearchTree) return this.left._insert(value);
      this.left = new BinarySearchTree(value);
      return true;
    }
    if (value > this.value) {
      if (this.right instanceof BinarySearchTree) return this.right._insert(value);
      this.right = new BinarySearchTree(value);
      return true;
    }
    return false;
  }

  _remove (value, parent, direction) {
    // TODO: Simplify function
    if (value === this.value) {
      // If node has no children, delete the node and return
      if (this.left === null && this.right === null) {
        if (parent) {
          parent[direction] = null;
          return true;
        }
        throw new Error('Binary Tree cannot be empty');
      }
      // If node has 1 child, make that node the new node
      if (this.left === null || this.right === null) {
        if (this.left !== null) {
          this.value = this.left.value;
          this.right = this.left.right;
          this.left = this.left.left;
        }
        if (this.right !== null) {
          this.value = this.right.value;
          this.left = this.right.left;
          this.right = this.right.right;
        }
        return true;
      }
      /*!
       * A node having two children is the most complex scenario. Basically,
       * we're going to promote a node in the child binary trees to be the new
       * node representing this value
       */
      // Get depth for both sides
      let leftDepth = (this.left === null) ? 0 : this.left.getMaxDepth();
      let rightDepth = (this.right === null) ? 0 : this.right.getMaxDepth();
      // Get side with deepest depth
      let biggerSide = (leftDepth > rightDepth) ? 'left' : 'right';
      // Get the min/max value for the biggerSide and remove it, so that it can
      // be set as the new value
      let minOrMax = (biggerSide === 'left') ? 'max' : 'min';
      let newNodeValue = Math[minOrMax].apply(null, this[biggerSide].getValues());
      this._remove(newNodeValue);
      this.value = newNodeValue;
      return true;
    }
    if (value < this.value && this.left instanceof BinarySearchTree)
      return this.left._remove(value, this, 'left');
    if (value > this.value && this.right instanceof BinarySearchTree)
      return this.right._remove(value, this, 'right');
    return false;
  }

  _contains (value) {
    if (value === this.value) return true;
    if (value < this.value && this.left instanceof BinarySearchTree)
      return this.left._contains(value);
    if (value > this.value && this.right instanceof BinarySearchTree)
      return this.right._contains(value);
    return false;
  }

  _getValues (method) {
    let values = [];
    this[method]((value) => {
      values.push(value);
    });
    return values;
  }

  _forEach (callback, level) {
    level = (level !== undefined) ? level : 0;
    let getValue = (x) => (x === null) ? null : x.value;
    if (this.left !== null) this.left._forEach(callback, level + 1);
    callback(this.value, level, getValue(this.left), getValue(this.right));
    if (this.right !== null) this.right._forEach(callback, level + 1);
    return;
  }

  _forEachDepthFirst (callback, level) {
    level = (level !== undefined) ? level : 0;
    let getValue = (x) => (x === null) ? null : x.value;
    callback(this.value, level, getValue(this.left), getValue(this.right));
    if (this.left !== null) this.left._forEachDepthFirst(callback, level + 1);
    if (this.right !== null) this.right._forEachDepthFirst(callback, level + 1);
    return;
  }

  _between (low, high, values) {
    let callIfNotNull = (side) => {
      if (this[side] !== null) return this[side]._between(low, high, values);
      return [];
    };
    if (low <= this.value && this.value < high) {
      return values
        .concat(callIfNotNull('left'))
        .concat([this.value])
        .concat(callIfNotNull('right'));
    }
    if (this.value >= high && this.left !== null) {
      return values.concat(callIfNotNull('left'));
    }
    if (this.value < low && this.right !== null) {
      return values.concat(callIfNotNull('right'));
    }
  }

  _checkForRebalance () {
    if (this.opts.selfRebalance && this.getMaxDepth() / 2 >= this.getMinDepth()) {
      this._rebalance();
      return true;
    }
    return false;
  }

  _rebalance () {
    // NOTE: Naive recursive implementation. Is there a faster way?
    let insertValues = (values) => {
      if (values.length === 0) return true;
      let middleIndex = Math.floor(values.length / 2);
      let middleValue = values.splice(middleIndex, 1)[0];
      let rightValues = values.splice(middleIndex, Infinity);
      let leftValues = values.slice();
      this._insert(middleValue);
      return insertValues(leftValues) && insertValues(rightValues);
    };
    let values = this.getValues(); // Linear operation
    this.value = null;
    this.left = null;
    this.right = null;
    insertValues(values); // Linear operation
  }
};

export default BinarySearchTree;