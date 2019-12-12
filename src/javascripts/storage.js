import store from "store/dist/store.modern";
var operations = require('store/plugins/operations')
import hash from "hash.js";

function getKey(key) {
  return hash
  .sha256()
  .update(document.URL)
  .digest("hex") +
  "." +
  key;
}
var urlHashPlugin = function() {
  return {
    set: function(super_fn, key, value) {
      return super_fn(getKey(key), value);
    },
    get: function(super_fn, key) {
      return super_fn(getKey(key));
    },
    remove: function(super_fn, key) {
      return super_fn(getKey(key));
    }
  };
};
store.addPlugin(urlHashPlugin);
store.addPlugin(operations);

export default store;
