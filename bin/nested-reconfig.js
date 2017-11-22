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
  ADMIN_DOMAIN: process.env['NST_ADMIN_DOMAIN'],
  ADMIN_PORT: process.env['NST_ADMIN_PORT'],
  ADMIN_URL: process.env['NST_ADMIN_URL'],
  DISABLE_FCM: process.env['DISABLE_FCM']
};

const defaultConfig = {
  WS_CYRUS: "_WS_CYRUS_CYRUS_URL_CONF_",
  HTTP_CYRUS: "_HTTP_CYRUS_URL_CONF_",
  XERXES: "_XERXES_URL_CONF_",
  GOOGLE_ANALYTICS_TOKEN: "UA-80877772-5",
  DOMAIN: "_DOMAIN_",
  ADMIN_DOMAIN: "_ADMIN_DOMAIN_",
  ADMIN_PORT: "_ADMIN_PORT_",
  ADMIN_URL: "_ADMIN_URL_",
  UPLOAD_SIZE_LIMIT: 104857600,
  DISABLE_FCM: "_DISABLE_FCM_"
};

const newConfig = {
  WS_CYRUS: process.env['NST_WS_CYRUS_URL'] || defaultConfig.WS_CYRUS,
  HTTP_CYRUS: process.env['NST_HTTP_CYRUS_URL'] || defaultConfig.HTTP_CYRUS,
  XERXES: process.env['NST_XERXES_URL'] || defaultConfig.XERXES,
  GOOGLE_ANALYTICS_TOKEN: process.env['NST_GOOGLE_ANALYTICS_TOKEN'] || '-',
  UPLOAD_SIZE_LIMIT: process.env['NST_UPLOAD_SIZE_LIMIT'] || defaultConfig.UPLOAD_SIZE_LIMIT,
  DOMAIN: process.env['NST_DOMAIN'] || "nested.me",
  ADMIN_DOMAIN: process.env['NST_ADMIN_DOMAIN'] || "admin.nested.me",
  ADMIN_PORT: process.env['NST_ADMIN_PORT'] || "80",
  ADMIN_URL: process.env['NST_ADMIN_URL'] || "",
  DISABLE_FCM: process.env['DISABLE_FCM'] || defaultConfig.DISABLE_FCM
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
    let newContent = content.toString().replace(defaultConfig.WS_CYRUS, newConfig.WS_CYRUS)
      .replace(defaultConfig.HTTP_CYRUS, newConfig.HTTP_CYRUS)
      .replace(new RegExp(defaultConfig.XERXES, 'ig'), newConfig.XERXES)
      .replace(new RegExp(defaultConfig.GOOGLE_ANALYTICS_TOKEN, 'ig'), newConfig.GOOGLE_ANALYTICS_TOKEN)
      .replace(defaultConfig.UPLOAD_SIZE_LIMIT, newConfig.UPLOAD_SIZE_LIMIT)
      .replace(defaultConfig.DOMAIN, newConfig.DOMAIN)
      .replace(defaultConfig.ADMIN_DOMAIN, newConfig.ADMIN_DOMAIN)
      .replace(defaultConfig.ADMIN_PORT, newConfig.ADMIN_PORT)
      .replace(defaultConfig.ADMIN_URL, newConfig.ADMIN_URL)
      .replace(defaultConfig.DISABLE_FCM, newConfig.DISABLE_FCM);

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
      console.log('Configuration applied Successfully.');
    })
  })
} else {
  let files = getListOfScripts();
  let promises = [];
  files.forEach(file => {
    promises.push(replaceConfigAndStore(file));
  });
  return Promise.all(promises).then(() => {
    console.log('Configuration applied Successfully.');
  })
}

