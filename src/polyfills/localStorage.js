// A fake localStorage only to make tests able
// to run code depending on the localStorage api.
if (!global.localStorage) {
  let data = {};
  global.localStorage = {
    setItem (id, val) { return data[id] = String(val); },
    getItem (id) { return data.hasOwnProperty(id) ? data[id] : undefined; },
    removeItem (id) { return delete data[id]; },
    clear () { return data = {}; }
  };
}