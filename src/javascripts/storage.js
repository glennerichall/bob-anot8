import store from "store/dist/store.modern";
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
    }
  };
};
store.addPlugin(urlHashPlugin);

export default store;
