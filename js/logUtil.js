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