// A fake localStorage only to make tests able
// to run code depending on the localStorage api.
if (!(global as any).localStorage) {
  let data: {[key: string]: string} = {};
  (global as any).localStorage = {
    setItem (id: string, val: string) { return data[id] = String(val); },
    getItem (id: string) { return data.hasOwnProperty(id) ? data[id] : undefined; },
    removeItem (id: string) { return delete data[id]; },
    clear () { return data = {}; }
  };
}
