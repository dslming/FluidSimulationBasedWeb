function AsyncTaskQueue() {
  this.onComplete = new Signal,
    this.onProgress = new Signal,
    this._queue = [],
    this._childQueues = [],
    this._currentIndex = 0,
    this._isRunning = !1
}
AsyncTaskQueue.prototype = {
  queue: function(e, t) {
    var n = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
    this._queue.push({
      func: e,
      args: n.slice(1)
    })
  },
  addChildQueue: function(e) {
    this._childQueues.push(e)
  },
  execute: function() {
    if (this._isRunning)
      throw new Error("Already running!");
    this._isRunning = !0,
      this._currentIndex = 0,
      this._executeTask()
  },
  _executeTask: function() {
    setTimeout(this._executeImpl.bind(this))
  },
  _executeImpl: function() {
    if (this.onProgress.dispatch(this._currentIndex / this._queue.length),
      this._childQueues.length > 0) {
      var e = this._childQueues.shift();
      e.onComplete.bind(this._executeImpl, this),
        e.execute()
    } else if (this._queue.length === this._currentIndex)
      this.onComplete.dispatch();
    else {
      var t = this._queue[this._currentIndex];
      t.func.apply(this, t.args),
        ++this._currentIndex,
        this._executeTask()
    }
  }
}
