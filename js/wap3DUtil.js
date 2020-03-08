{ /** LOG console */
    console.DEBUG_MODE = false
    console.INFO_MODE = true

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

Object.defineProperties(Array.prototype, {
    max: {
        configurable: true,
        enumerable: false,
        value: function() {
            return this.length === 0 ? undefined : Math.max(...this)
        },
        writable: true
    },
    min: {
        configurable: true,
        enumerable: false,
        value: function() {
            return this.length === 0 ? undefined : Math.min(...this)
        },
        writtable: true
    }
});