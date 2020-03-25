{ /** LOG console */
    console.DEBUG_MODE = false
    console.INFO_MODE = false

    console.debug = function() {
        if (console.DEBUG_MODE === true) {
            console.log.apply(this, arguments)
        }
    }

    console.info = function() {
        if (console.INFO_MODE === true) {
            console.log.apply(this, arguments)
        }
    }
}

String.prototype.replaceAll = function(search, replacement) {
    let target = this
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.lastOf = function(separator) {
    return this.split(separator)[this.split(separator).length - 1]
}