//declare ls
window.ls = localStorage;

// fallback to memory Storage, if browser doesn't support localStorage, e.g. Safari Incognito
(function () {
  var items = {};

  function MemoryStorage() {
  }

  MemoryStorage.prototype.getItem = function (key) {
    return items[key];
  };

  MemoryStorage.prototype.setItem = function (key, value) {
    items[key] = value;
  };

  MemoryStorage.prototype.removeItem = function (key) {
    delete items[key];
  };

  MemoryStorage.prototype.key = function (index) {
    return Object.keys(items)[index];
  };

  MemoryStorage.prototype.get = function () {
    return items;
  };

  Object.defineProperty(MemoryStorage.prototype, "length", {
    get: function length() {
      return Object.keys(items).length;
    }
  });

  try {
    var x = 'test-localstorage-' + Date.now();
    localStorage.setItem(x, x);
    var y = localStorage.getItem(x);
    localStorage.removeItem(x);
    if (y !== x) {
      window.ls = new MemoryStorage();
    }
  } catch (e) {
    window.ls = new MemoryStorage();
  }
})();