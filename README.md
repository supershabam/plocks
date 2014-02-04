plocks
======

a promise library with built-in distributed locking

## why

Locking is stateful, and promises nicely encapsulate state.

## use case - cache results across cluster

You have an expensive operation to compute, or perhaps an operation with limited resouces (e.g. twitter api tokens). Since this operation can take some time to compute, you want to ensure that only one machine is computing the result at once and then storing it in a cache for other machines to use.

## example usage

```javascript
var plocks = require('plocks')
var Plock = plocks.create({
  strategy: plocks.strategies.local // many ways to implement a lock
})

// it's wasteful to have two machines fetching the same user id, so let's use a
// locking promise to make sure we're the only code executing to get the user
function fetchAndCacheTwitterUser(id) {
  var lockKey = 'twitterUser:' + id
  return new Plock(lockKey, function(resolve, reject) {
    // check cache again (since previous lock could have set cache)
    twitterUserFromCache(id).then(resolve, function() {
      fetchTwitterUser(id).then(function(user) {
        twitterUserSetCache(id, user).then(resolve, reject)
      }, reject)
    })
  })
}

// now, let's use our locking promise in a promise chain to check cache
// before attempting to lock and fetch the user.
function twitterUser(id) {
  return twitterUserFromCache(id).catch(function() {
    return fetchAndCacheTwitterUser(id)
  })
}
```

Locking and caching is hard to do correctly, using a locking promise handles much of the complexity. That's a small amount of code to orchestrate your entire cluster of workers/apis to maximize your cache hits and minimize burning through limited twitter tokens.

## license

MIT
