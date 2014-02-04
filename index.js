var RSVP = require('rsvp')

// strategy - promise to provide object with lock(key) and unlock(key) functions
exports.create = function(strategy) {
  return function(key, resolver) {
    return new RSVP.Promise(function(resolve, reject) {
      strategy.lock(key).then(function() {
        var myResolve = function(result) {
          strategy.unlock(key).then(function() {
            resolve(result)
          }, reject)
        }
        var myReject = function(err) {
          strategy.unlock(key).then(function() {
            reject(result)
          }, reject)
        }
        resolver(myResolve, myReject)
      }, reject)
    })
  }
}

