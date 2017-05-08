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
};

const defaultConfig = {
    WS_CYRUS: "wss://cyrus.nested.me:443",
    HTTP_CYRUS: "https://cyrus.nested.me:444",
    XERXES: "https://xerxes.nested.me",
    GOOGLE_ANALYTICS_TOKEN: "UA-80877772-5",
    DOMAIN: "_DOMAIN_",
    UPLOAD_SIZE_LIMIT: 104857600
};

const newConfig = {
    WS_CYRUS: process.env['NST_WS_CYRUS_URL'] || defaultConfig.WS_CYRUS,
    HTTP_CYRUS: process.env['NST_HTTP_CYRUS_URL'] || defaultConfig.HTTP_CYRUS,
    XERXES: process.env['NST_XERXES_URL'] || defaultConfig.XERXES,
    GOOGLE_ANALYTICS_TOKEN: process.env['NST_GOOGLE_ANALYTICS_TOKEN'] || '-',
    UPLOAD_SIZE_LIMIT: process.env['NST_UPLOAD_SIZE_LIMIT'] || defaultConfig.UPLOAD_SIZE_LIMIT,
    DOMAIN: process.env['NST_DOMAIN'] || "nested.me",
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
            })
            .catch(err => {
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

        fs.writeFileSync(config.SCRIPT_DIR + file, newContent);
        res();
    })
}


// main starter
if (!config.HTTP_PORT) {
    process.env['NST_ADDR_PORT'] = 80;
}

if (!isConfigApplyed()) {
    let files = getListOfScripts();
    return copyDefaultFiles(files)
        .then(() => {
            let promises = [];
            files.forEach(file => {
                promises.push(replaceConfigAndStore(file));
            });
            return Promise.all(promises)
                .then(() => {
                    console.log('Configuration applied Successfully.');
                })
        })
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

