(function(window) {
    start("http://dev-01.ronaksoftware.com:8086/write?db=nested", 10 * 1000, "_logs");

    var buffer = {};

    function start(url, period, entriesBucketKey) {
        console.log('Error handling service has been started.');
        setInterval(function() {
            if (!isArray(window[entriesBucketKey])) {
                console.log('Could not find the entries bucket!');
                return;
            }

            if (window[entriesBucketKey].length === 0) {
                console.log('The good news is, Your entries bucket is empty.');
                return;
            }

            console.log('There are {count} entries to be sent.'.replace('{count}', window[entriesBucketKey].length));
            collect(aggregate(window[entriesBucketKey]), url);
            window[entriesBucketKey].length = 0;
        }, period);
    }

    function aggregate(entries) {
        return entries.map(serialize).join("\n");
    }

    function collect(data, url) {
        var entryKey = generateKey();
        buffer[entryKey] = data;

        ignite(entryKey, url);
    }

    function ignite(key, url) {
        if (!buffer[key]) {
            return;
        }

        $.ajax({
            method: 'post',
            url: url,
            data: buffer[key],
            success: function (response) {
                var entriesCount = buffer[key].split("\n").length;
                console.log('All {count} entries have been sent successfully.'.replace("{count}", entriesCount));
                delete buffer[key];
                var storedKeys = Object.keys(buffer);
                if (storedKeys.length > 0) {
                    console.log('There are more stored entries waiting to be sent.');
                    ignite(storedKeys[0]);
                }
            },
            error: function (response) {
                console.log('We are currently not able to send these {count} entries, we store them to send later.'.replace('{count}', buffer[key].split("\n").length));
            }
        });
    }

    function serialize(entry) {
        if (entry.values.length === 0) {
            throw Error('A value must be specified!');
        }

        if (!entry.type) {
            entry.type = "unknown";
        }


        var valueList = [];
        for (var key in entry.values) {
            if (entry.values.hasOwnProperty(key)) {
                valueList.push('{key}="{value}"'.replace("{key}", key).replace("{value}", entry.values[key]));
            }
        }
        var separatedValues = valueList.sort().join(',');

        var tagList = [];
        for (var key in entry.tags) {
            if (entry.tags.hasOwnProperty(key)) {
                tagList.push('{key}={value}'.replace("{key}", key).replace("{value}", entry.tags[key]));
            }
        }
        var separatedTags = tagList.sort().join(',');

        var result = "{type},{tags} {values}"
            .replace("{type}", entry.type)
            .replace("{tags}", separatedTags)
            .replace("{values}", separatedValues);

        return result;
    }

    function isArray(value) {
        return value instanceof Array;
    }

    function generateKey() {
        return new Date().getTime().toString();
    }

})(window);
