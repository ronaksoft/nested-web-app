const fs = require('fs');

const config = {
  SSL_DIR: '/ronak/',
  WORKING_DIR: process.cwd(),
  SCRIPT_DIR: process.cwd() + '/scripts/',
  TMP_DIR: process.cwd() + '/nestedConfig/',
  PUBLIC_CERT: process.env['WEBAPP_PUBLIC_KEY'],
  PRIVATE_CERT: process.env['WEBAPP_PRIVATE_KEY'],
  HTTP_PORT: process.env['NST_ADDR_PORT'],
  DOMAIN: process.env['NST_DOMAIN'],
  DISABLE_FCM: process.env['DISABLE_FCM'],
  RIVER: process.env['RIVER'],
  DEFAULT_LOCALE: process.env['DEFAULT_LOCALE'],
  SHOW_FOOTER: process.env['SHOW_FOOTER'],
  IFRAME_ENABLE: process.env['IFRAME_ENABLE']
};

const defaultConfig = {
  WS_CYRUS: "_WS_CYRUS_CYRUS_URL_CONF_",
  HTTP_CYRUS: "_HTTP_CYRUS_URL_CONF_",
  XERXES: "_XERXES_URL_CONF_",
  GOOGLE_ANALYTICS_TOKEN: "UA-80877772-5",
  DOMAIN: "_DOMAIN_",
  UPLOAD_SIZE_LIMIT: 104857600,
  DISABLE_FCM: "_DISABLE_FCM_",
  RIVER: "_RIVER_",
  DEFAULT_LOCALE: "_DEFAULT_LOCALE_", // en, fa
  SHOW_FOOTER: "_SHOW_FOOTER_", // false, true
  IFRAME_ENABLE: "_IFRAME_ENABLE_"
};

const newConfig = {
  WS_CYRUS: process.env['NST_WS_CYRUS_URL'] || defaultConfig.WS_CYRUS,
  HTTP_CYRUS: process.env['NST_HTTP_CYRUS_URL'] || defaultConfig.HTTP_CYRUS,
  XERXES: process.env['NST_HTTP_CYRUS_URL'] || defaultConfig.XERXES,
  GOOGLE_ANALYTICS_TOKEN: process.env['NST_GOOGLE_ANALYTICS_TOKEN'] || '-',
  UPLOAD_SIZE_LIMIT: process.env['NST_UPLOAD_SIZE_LIMIT'] || defaultConfig.UPLOAD_SIZE_LIMIT,
  DOMAIN: process.env['NST_DOMAIN'] || "nested.me",
  DISABLE_FCM: process.env['DISABLE_FCM'] || defaultConfig.DISABLE_FCM,
  RIVER: process.env['RIVER'] || defaultConfig.RIVER,
  DEFAULT_LOCALE: process.env['DEFAULT_LOCALE'] || defaultConfig.DEFAULT_LOCALE,
  SHOW_FOOTER: process.env['SHOW_FOOTER'] || defaultConfig.SHOW_FOOTER,
  IFRAME_ENABLE: process.env['IFRAME_ENABLE'] || defaultConfig.IFRAME_ENABLE
};

function isConfigApplyed() {
  if (!fs.existsSync(config.TMP_DIR)) {
    fs.mkdirSync(config.TMP_DIR);
    return false
  }
  return true;
}

function copyFile(source, target) {
  return new Promise(function (resolve, reject) {
    var rd = fs.createReadStream(source);
    rd.on('error', rejectCleanup);
    var wr = fs.createWriteStream(target);
    wr.on('error', rejectCleanup);
    function rejectCleanup(err) {
      rd.destroy();
      wr.end();
      reject(err);
    }

    wr.on('finish', resolve);
    rd.pipe(wr);
  });
}

function copyDefaultFiles(files) {
  return new Promise((rs, rj) => {
    let promises = [];
    files.forEach(function (file) {
      promises.push(copyFile(config.SCRIPT_DIR + file, config.TMP_DIR + file))
    });
    Promise.all(promises)
      .then(() => {
      rs();
    }).catch(err => {
        throw "Cannot copy source files." + err;
    })

  })
}

function getListOfScripts() {
  let files = fs.readdirSync(config.SCRIPT_DIR);
  return files.filter(function (file) {
    return file.substr(-3) === '.js';
  })
}

function replaceConfigAndStore(file) {
  return new Promise((res) => {
    let content = fs.readFileSync(config.TMP_DIR + file);
    let newContent = content.toString().replace(new RegExp(defaultConfig.WS_CYRUS, 'ig'), newConfig.WS_CYRUS + '/api')
      .replace(new RegExp(defaultConfig.HTTP_CYRUS, 'ig'), newConfig.HTTP_CYRUS + '/api')
      .replace(new RegExp(defaultConfig.XERXES, 'ig'), newConfig.HTTP_CYRUS + '/file')
      .replace(new RegExp(defaultConfig.GOOGLE_ANALYTICS_TOKEN, 'ig'), newConfig.GOOGLE_ANALYTICS_TOKEN)
      .replace(defaultConfig.UPLOAD_SIZE_LIMIT, newConfig.UPLOAD_SIZE_LIMIT)
      .replace(new RegExp(defaultConfig.DOMAIN, 'ig'), newConfig.DOMAIN)
      .replace(new RegExp(defaultConfig.DISABLE_FCM, 'ig'), newConfig.DISABLE_FCM)
      .replace(new RegExp(defaultConfig.RIVER, 'ig'), newConfig.RIVER)
      .replace(defaultConfig.DEFAULT_LOCALE, newConfig.DEFAULT_LOCALE)
      .replace(defaultConfig.SHOW_FOOTER, newConfig.SHOW_FOOTER)
      .replace(defaultConfig.IFRAME_ENABLE, newConfig.IFRAME_ENABLE);

    fs.writeFileSync(config.SCRIPT_DIR + file, newContent);
    res();
  })
}

process.argv.forEach(function (val) {
  if (val.indexOf('script') > -1) {
    config.SCRIPT_DIR = process.cwd() + '/' + val.split('=')[1] + '/';
  } else if (val.indexOf('tmp') > -1) {
    config.TMP_DIR = process.cwd() + '/' + val.split('=')[1] + '/';
  }
});

// main starter
if (!config.HTTP_PORT) {
  process.env['NST_ADDR_PORT'] = 80;
}

if (!isConfigApplyed()) {
  let files = getListOfScripts();
  return copyDefaultFiles(files).then(() => {
    let promises = [];
    files.forEach(file => {
      promises.push(replaceConfigAndStore(file));
    });
    return Promise.all(promises).then(() => {
      console.log('Configuration applied Successfully. ' + config.SCRIPT_DIR);
    })
  })
} else {
  let files = getListOfScripts();
  let promises = [];
  files.forEach(file => {
    promises.push(replaceConfigAndStore(file));
  });
  return Promise.all(promises).then(() => {
    console.log('Configuration applied Successfully. ' + config.SCRIPT_DIR);
  })
}

