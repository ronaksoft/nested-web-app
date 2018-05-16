var MD5 = function (string) {

  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }

  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }

  function F(x, y, z) {
    return (x & y) | ((~x) & z);
  }

  function G(x, y, z) {
    return (x & z) | (y & (~z));
  }

  function H(x, y, z) {
    return (x ^ y ^ z);
  }

  function I(x, y, z) {
    return (y ^ (x | (~z)));
  }

  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function WordToHex(lValue) {
    var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  function Utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }

    return utftext;
  }

  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  string = Utf8Encode(string);

  x = ConvertToWordArray(string);

  a = 0x67452301;
  b = 0xEFCDAB89;
  c = 0x98BADCFE;
  d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }

  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

  return temp.toLowerCase();
};

var nst = {
  domain: '_DOMAIN_',
  selectedDomain: '',
  cyrus: '_WS_CYRUS_CYRUS_URL_CONF_',
  xerxes: '',
  oauth: {
    clientId: '',
    redirectUri: '',
    scope: 'read',
    token: '',
    appRedirect: null
  },
  user: {},
  enable: true,
  nestedConfigs: [],
  c: {
    sk: null,
    ss: null
  },
  init: function () {
    nst.reconfigCyrus();
    nst.selectedDomain = nst.domain;
    nst.c.sk = nst.getCookie('nsk') || nst.getCookie('_sk') || null;
    nst.c.ss = nst.getCookie('nss') || nst.getCookie('_ss') || null;
    var params = nst.getUrlParams();
    nst.oauth.clientId = params['client_id'];
    nst.oauth.redirectUri = params['redirect_uri'];
    nst.oauth.scope = params['scope'];
    nst.oauth.token = params['token'];
    nst.oauth.appRedirect = params['app_redirect'] || null;

    if (nst.c.sk && nst.c.ss) {
      nst.http('account/get', {}, function (data) {
        nst.fillUserData(data);
      }, function () {
        nst.switchToLogin();
      });
    } else {
      nst.switchToLogin();
    }

    document.querySelector('.js-change-workspace').addEventListener('click', function () {
      nst.switchToWorkspace();
    });

    document.querySelector('.js-login-to-other').addEventListener('click', function () {
      nst.switchToWorkspace();
    });

    document.querySelector('.workspace form').addEventListener('submit', function (event) {
      event.preventDefault();
      var domain = document.querySelector('.workspace form input[name="domain"]').value;
      nst.setWorkspace(domain);
    });

    document.querySelector('.sign-in form').addEventListener('submit', function (event) {
      event.preventDefault();
      var user = document.querySelector('.sign-in form input[name="username"]').value;
      var pass = document.querySelector('.sign-in form input[name="password"]').value;
      nst.login(user, pass);
    });

    document.querySelector('.js-get-access').addEventListener('click', function () {
      nst.checkToken();
    });

    document.querySelector('.js-confirm-access').addEventListener('click', function () {
      nst.confirmAccess();
    });
  },
  getUrlParams: function () {
    var params = window.location.search.split('?')[1];
    params = params.split('&');
    var parts = [];
    params.forEach(function (part) {
      var items = decodeURIComponent(part).split('=');
      parts[items[0]] = items[1];
    });
    return parts;
  },
  reconfigCyrus: function () {
    var url = nst.cyrus.split('://');
    var host = url[1].split('/api');
    host = host.join('');
    if (url[0] === 'wss') {
      nst.cyrus = 'https://' + host + '/api';
      nst.xerxes = 'https://' + host + '/file';
    } else {
      nst.cyrus = 'http://' + host + '/api';
      nst.xerxes = 'http://' + host + '/file';
    }
  },
  getValue: function (elem) {
    return document.querySelector(elem).value;
  },
  fillUserData: function (data) {
    nst.user = data;
    nst.addClass('.panel-body .page', 'hide');
    nst.removeClass('.panel-body .page.select-account', 'hide');
    nst.addClass('.js-login-header', 'hide');
    nst.addClass('.js-workspace-header', 'hide');
    nst.setAttr('.user-logo img', 'src', nst.getImage(data.picture));
    nst.setText('.user-name', data.fname + ' ' + data.lname);
    nst.setText('.user-id', data._id + '@' + nst.selectedDomain);
    nst.addClass('.company-detail', 'hide');
    nst.removeGlobalError();
  },
  setText: function (elem, text) {
    var elems = document.querySelectorAll(elem);
    for (var i = 0; i < elems.length; i++) {
      elems[i].innerHTML = text;
    }
  },
  setAttr: function (elem, name, text) {
    var elems = document.querySelectorAll(elem);
    for (var i = 0; i < elems.length; i++) {
      elems[i].setAttribute(name, text);
    }
  },
  addClass: function (elem, text) {
    var elems = document.querySelectorAll(elem);
    for (var i = 0; i < elems.length; i++) {
      elems[i].classList.add(text);
    }
  },
  removeClass: function (elem, text) {
    var elems = document.querySelectorAll(elem);
    for (var i = 0; i < elems.length; i++) {
      elems[i].classList.remove(text);
    }
  },
  getImage: function (data) {
    return data.x128 === '' ? '/assets/icons/absents_place.svg' : (nst.xerxes + '/view/x/' + data.x128);
  },
  focusIt: function (query) {
    var objs = document.querySelectorAll(query + ' input');
    if (objs) {
      objs[0].focus();
    }
  },
  switchToWorkspace: function () {
    nst.addClass('.panel-body .page', 'hide');
    nst.removeClass('.panel-body .page.workspace', 'hide');
    nst.removeClass('.js-workspace-header', 'hide');
    nst.addClass('.js-login-header', 'hide');
    nst.focusIt('.panel-body .page.workspace');
    nst.addClass('.company-detail', 'hide');
    nst.removeGlobalError();
  },
  switchToLogin: function (data) {
    nst.addClass('.panel-body .page', 'hide');
    nst.removeClass('.panel-body .page.sign-in', 'hide');
    nst.addClass('.js-workspace-header', 'hide');
    nst.removeClass('.js-login-header', 'hide');
    nst.focusIt('.panel-body .page.sign-in');
    nst.setAttr('.company-detail img', 'src', nst.xerxes + '/view/x/' + data.company_logo);
    nst.setText('.company-detail h1', data.company_name);
    nst.setText('.company-detail p', data.company_desc);
    nst.removeClass('.company-detail', 'hide');
    nst.removeGlobalError();
  },
  switchToAccess: function () {
    var access = nst.oauth.scope.split(',');
    access = access.map(function (item) {
      return '-<b>' + item + '</b>';
    }).join('<br>');
    nst.setText('.user-desc', 'client_id: <b>' + nst.oauth.clientId + '</b> wants these permission(s):<br>' + access + '<br> Do you allow?');
    nst.addClass('.panel-body .page', 'hide');
    nst.removeClass('.panel-body .page.access-account', 'hide');
    nst.addClass('.js-login-header', 'hide');
    nst.addClass('.js-workspace-header', 'hide');
    nst.addClass('.company-detail', 'hide');
    nst.removeGlobalError();
  },
  checkToken: function () {
    nst.http('app/has_token', {
      app_id: nst.oauth.clientId
    }, function () {
      nst.confirmAccess();
    }, function () {
      nst.switchToAccess();
    });
  },
  confirmAccess: function () {
    nst.http('app/create_token', {
      app_id: nst.oauth.clientId
    }, function (app) {
      nst.removeGlobalError();
      var parameters = {
        token: nst.oauth.token,
        app_id: nst.oauth.clientId,
        app_token: app.token,
        app_domain: nst.selectedDomain,
        username: nst.user._id,
        fname: nst.user.fname,
        lname: nst.user.lname,
        email: nst.user.email,
        picture: nst.getImage(nst.user.picture)
      };
      nst.xhr({
        method: 'POST',
        async: true
      }, nst.oauth.redirectUri, parameters, function (data) {
        if (data.status === 'ok') {
          if (nst.oauth.appRedirect) {
            window.location.href = nst.oauth.appRedirect;
          } else {
            window.close();
          }
        } else {
          nst.setGlobalError(data.data);
        }
      });
    }, function () {
      nst.setGlobalError('can\'t create token for this app, contact your admin!');
    });
  },
  setGlobalError: function (text) {
    nst.setText('.js-global-error', text);
    nst.removeClass('.js-global-error', 'hide');
  },
  removeGlobalError: function () {
    nst.setText('.js-global-error', '');
    nst.addClass('.js-global-error', 'hide');
  },
  setWorkspace: function (domain) {
    var config = nst.getServerInfo(domain);
    if (config) {
      nst.cyrus = config.cyrus;
      nst.xerxes = config.xerxes;
      nst.selectedDomain = config.domain;
      nst.domain = config.domain;
      nst.removeGlobalError();
      nst.http('system/get_string_constants', {}, function (data) {
          nst.switchToLogin(data);
      });
    } else {
      nst.setGlobalError('Domain is invalid');
    }
  },
  login: function (user, pass) {
    user = user.split('@');
    var domain = user[1];
    user = user[0];
    var config = nst.getServerInfo(domain);
    nst.cyrus = config.cyrus;
    nst.xerxes = config.xerxes;
    nst.selectedDomain = config.domain;
    nst.http('session/register', {
      uid: user,
      pass: MD5(pass)
    }, function (data) {
      nst.addClass('.sign-in .error', 'hide');
      nst.c.sk = data._sk;
      nst.c.ss = data._ss;
      nst.fillUserData(data.account);
    }, function () {
      nst.removeClass('.sign-in .error', 'hide');
    });
  },
  getServerInfo: function (domain) {
    if (domain === undefined) {
      if (!nst.nestedConfigs.hasOwnProperty(nst.domain)) {
        nst.nestedConfigs[nst.domain] = {
          cyrus: nst.cyrus,
          xerxes: nst.xerxes,
          domain: nst.domain
        };
      }
      return nst.nestedConfigs[nst.domain];
    } else {
      if (nst.nestedConfigs.hasOwnProperty(domain)) {
        return nst.nestedConfigs[domain];
      }
      var remote = nst.xhr({
        method: 'GET',
        async: false
      }, 'https://npc.nested.me/dns/discover/' + domain);
      if (!remote) {
        return null;
      }
      var config = nst.parseConfigFromRemote(remote.data, domain);
      nst.nestedConfigs[domain] = config;
      return config;
    }
  },
  parseConfigFromRemote: function (data, domain) {
    var cyrus = [];
    var xerxes = [];
    data.forEach(function (configs, key1) {
      var config = configs.split(';');
      config.forEach(function (item, key2) {
        if (item.indexOf('cyrus:') === 0) {
          cyrus.push(item);
        } else if (item.indexOf('xerxes:') === 0) {
          xerxes.push(item);
        }
      });
    });
    var cyrusHttpUrl = '';
    var cyrusWsUrl = '';
    var config = {};
    cyrus.forEach(function (item, key3) {
      config = nst.parseConfigData(item);
      if (config.protocol === 'http' || config.protocol === 'https') {
        cyrusHttpUrl = nst.getCompleteUrl(config);
      } else if (config.protocol === 'ws' || config.protocol === 'wss') {
        cyrusWsUrl = nst.getCompleteUrl(config);
      }
    });
    return {
      cyrus: cyrusHttpUrl + '/api',
      xerxes: cyrusHttpUrl + '/file',
      domain: domain
    }
  },
  parseConfigData: function (data) {
    var items = data.split(':');
    return {
      name: items[0],
      protocol: items[1],
      port: items[2],
      url: items[3]
    };
  },
  getCompleteUrl: function (config) {
    return config.protocol + '://' + config.url + ':' + config.port;
  },
  http: function (cmd, params, callback, catchCallback) {
    var http = new XMLHttpRequest();
    // var url = 'https://webapp.ronaksoftware.com:81/'
    var parameters = {
      _ss: nst.c.ss,
      _sk: nst.c.sk,
      _cid: 'Web OAuth for ' + nst.oauth.clientId,
      cmd: cmd,
      data: params
    };

    if (['session/recall', 'session/register', 'system/get_string_constants'].indexOf(cmd) > -1) {
      delete parameters['_sk'];
      delete parameters['_ss'];
    }

    http.open('POST', nst.cyrus, true);
    http.setRequestHeader('accept', 'application/json');
    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200) {
        var data = JSON.parse(http.responseText);
        if (data.status === 'ok') {
          if (typeof callback === 'function') {
            callback(data.data);
          }
        } else {
          if (typeof catchCallback === 'function') {
            catchCallback(data.data);
          }
        }
      }
    };
    parameters = JSON.stringify(parameters);
    http.send(parameters);
  },
  xhr: function (config, url, params, callback, catchCallback) {
    var http = new XMLHttpRequest();
    var async = config.async === undefined ? true : config.async;
    var method = config.method || 'GET';
    http.open(method, url, async);
    http.setRequestHeader('accept', 'application/json');
    if (async) {
      http.onreadystatechange = function () {
        if (http.readyState === 4) {
          if (http.status === 200) {
            var data = JSON.parse(http.responseText);
            if (typeof callback === 'function') {
              callback(data);
            }
          } else {
            if (typeof catchCallback === 'function') {
              catchCallback(http.statusText);
            }
          }
        }
      };
    }
    var formData = new FormData();
    if (params && method === 'POST') {
      formData = new FormData();
      for (var key in params) {
        formData.append(key, params[key]);
      }
    } else {
      formData = null;
    }
    try {
      http.send(formData);
      if (!async) {
        if (http.status === 200) {
          return JSON.parse(http.responseText);
        } else {
          return null;
        }
      }
    } catch(e) {
      return null;
    }
  },
  setCookie: function (cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  },
  getCookie: function (name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    } else {
      return null;
    }
  }
};
