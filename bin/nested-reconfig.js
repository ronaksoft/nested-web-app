const fs = require('fs');

const config = {
  workingDir: process.cwd(),
  scriptDir: process.cwd() + '/scripts/',
  tmpDir: process.cwd() + '/nestedConfig/',
};

const defaultConfig = {
  WS_CYRUS: "wss://cyrus.nested.me:443",
  HTTP_CYRUS: "https://cyrus.nested.me:444",
  XERXES: "https://xerxes.nested.me",
  GOOGLE_ANALYTICS_TOKEN: "UA-80877772-5",
  UPLOAD_SIZE_LIMIT: 104857600
};


const newConfig = {
  WS_CYRUS: process.env['WS_CYRUS'] || defaultConfig.WS_CYRUS,
  HTTP_CYRUS: process.env['HTTP_CYRUS'] || defaultConfig.HTTP_CYRUS,
  XERXES: process.env['XERXES'] || defaultConfig.XERXES,
  GOOGLE_ANALYTICS_TOKEN: process.env['GOOGLE_ANALYTICS_TOKEN'] || defaultConfig.GOOGLE_ANALYTICS_TOKEN,
  UPLOAD_SIZE_LIMIT: process.env['UPLOAD_SIZE_LIMIT'] || defaultConfig.UPLOAD_SIZE_LIMIT
};

console.log(newConfig)

function isConfigApplyed() {
  if (!fs.existsSync(config.tmpDir)) {
    fs.mkdirSync(config.tmpDir);
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
      promises.push(copyFile(config.scriptDir + file, config.tmpDir + file))
    });
    Promise.all(promises)
      .then(() => {
        rs();
      })
      .catch(err => {
        throw "Cannot copy source files." + err;
      })

  })
}


function getListOfScripts() {
  let files = fs.readdirSync(config.scriptDir);
  return files.filter(function (file) {
    return file.substr(-3) === '.js';
  })
}


function replaceConfigAndStore(file) {
  return new Promise((res) => {
    let content = fs.readFileSync(config.tmpDir + file);
    let newContent = content.toString().replace(defaultConfig.WS_CYRUS, newConfig.WS_CYRUS)
      .replace(defaultConfig.HTTP_CYRUS, newConfig.HTTP_CYRUS)
      .replace(new RegExp(defaultConfig.XERXES, 'ig'), newConfig.XERXES)
      .replace(new RegExp(defaultConfig.GOOGLE_ANALYTICS_TOKEN, 'ig'), newConfig.GOOGLE_ANALYTICS_TOKEN)
      .replace(defaultConfig.UPLOAD_SIZE_LIMIT, newConfig.UPLOAD_SIZE_LIMIT)

    fs.writeFileSync(config.scriptDir + file, newContent);
    res();
  })
}


if (!isConfigApplyed()) {
  let files = getListOfScripts();
  copyDefaultFiles(files)
    .then(() => {
      let promises = [];
      files.forEach(file => {
        promises.push(replaceConfigAndStore(file));
      });
      return Promise.all(promises)
        .then(() => {
          console.log('Configuration allayed Successfully.')
        })
    });
} else {
  let files = getListOfScripts();
  let promises = [];
  files.forEach(file => {
    promises.push(replaceConfigAndStore(file));
  });
  return Promise.all(promises)
    .then(() => {
      console.log('Configuration applied Successfully.');
    })
}

