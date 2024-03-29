'use strict';

var codecFactory = require('./address-codec');

var ALPHABETS = {
  bitcoin: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  ripple: 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz',
  tipple: 'RPShNAF39wBUDnEGHJKLM4pQrsT7VWXYZ2bcdeCg65jkm8ofqi1tuvaxyz',
  stellar: 'gsphnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCr65jkm8oFqi1tuvAxyz',
    ledgerd: 'Lpshnaf39wBUDNEGHJKrM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz'
};

function addMethods(codecMethods, api) {
  function addVersion(name, opts) {
    function add(operation) {
      var encode = operation === 'encode';
      var func = api[operation + name] = function (arg, arg2) {
        var params = opts;
        if (arg2 && encode) {
          params = {
            expectedLength: opts.expectedLength,
            version: opts.versions[opts.versionTypes.indexOf(arg2)]
          };
        }
        return api[operation](arg, params);
      };
      return func;
    }
    var decode = add('decode');
    add('encode');
    api['isValid' + name] = function (arg) {
      try {
        decode(arg);
      } catch (e) {
        return false;
      }
      return true;
    };
  }
  for (var k in codecMethods) {
    addVersion(k, codecMethods[k]);
  }
  return api;
}

function buildCodecsMap(alphabets, Codec) {
  var codecs = {};
  for (var _name in ALPHABETS) {
    codecs[_name] = new Codec(ALPHABETS[_name]);
  }if (alphabets !== ALPHABETS) {
    for (var _name2 in alphabets) {
      codecs[_name2] = new Codec(alphabets[_name2]);
    }
  }
  return codecs;
}

function apiFactory(options) {
  var _options$alphabets = options.alphabets;
  var alphabets = _options$alphabets === undefined ? ALPHABETS : _options$alphabets;
  var _options$codecMethods = options.codecMethods;
  var codecMethods = _options$codecMethods === undefined ? {} : _options$codecMethods;
  var _options$defaultAlphabet = options.defaultAlphabet;
  var defaultAlphabet = _options$defaultAlphabet === undefined ? Object.keys(alphabets)[0] : _options$defaultAlphabet;

  var Codec = codecFactory(options);
  var codecs = buildCodecsMap(alphabets, Codec);

  return addMethods(codecMethods, {
    Codec: Codec,
    codecs: codecs,
    decode: function decode(string) {
      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var _opts$alphabet = opts.alphabet;
      var alphabet = _opts$alphabet === undefined ? defaultAlphabet : _opts$alphabet;

      return codecs[alphabet].decode(string, opts);
    },
    encode: function encode(bytes) {
      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var _opts$alphabet2 = opts.alphabet;
      var alphabet = _opts$alphabet2 === undefined ? defaultAlphabet : _opts$alphabet2;

      return codecs[alphabet].encode(bytes, opts);
    }
  });
}

module.exports = apiFactory;