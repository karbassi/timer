var start;
var end;
var isStopped = false;

function $(str) {
    var q = document.querySelectorAll(str);
    if (q.length === 1) {
        return q[0];
    }
    else {
        return q;
    }
}

var sound = $("#beep");


function getTime(str) {
    if (str.indexOf(":") == -1) {
        return parseInt(str, 10) * 1e3;
    }

    var ms = 0;

    var multiples = [
        60 * 60,
        60,
        1
    ];

    var parts = str.split(":");
    while (parts.length > 0) {
        ms += parts.pop() * multiples.pop()
    }

    return ms * 1e3;
}

function display(date) {
    $("#hours").innerText = date.hours;
    $("#minutes").innerText = date.minutes;
    $("#seconds").innerText = date.seconds;
    $("#microseconds").innerText = date.microseconds;

}

function run(str) {

    if (!str) {
        stop();
        return;
    }

    start = new Date();
    end = new Date(start.getTime() + getTime(str));

    step();
};

run(window.location.hash.slice(1));

function hmss(microseconds) {
    var date = {};

    var x = microseconds / 1e3;

    // Microseconds
    var ms = parseInt(((x % 1) * 1e3), 10) + "";

    while (ms.length < 3) {
        ms += "0";
    }

    date.microseconds = ms;

    // Seconds
    var s = parseInt(x % 60, 10) + "";
    date.seconds = "00".substring(s.length) + s

    // Minute
    x /= 60;
    var m = parseInt(x % 60, 10) + "";
    date.minutes = "00".substring(m.length) + m

    // Hours
    x /= 60;
    var h = parseInt(x % 24, 10) + "";
    date.hours = "00".substring(h.length) + h

    // Days
    x /= 24;
    var d = parseInt(x, 10) + "";
    date.days = "00".substring(d.length) + d


    return date;
}

/**
 *
 */
function step() {

    if (isStopped) {
        return;
    }

    var diff = end - +new Date();

    if (diff > 0) {
        var date = hmss(diff);

        display(date);

        window.requestAnimationFrame(step);
    } else {

        // Done
        display(hmss(0));

        sound.play();
        isStopped = true;
    }
}

/**
 * Add `seconds` to current (or new) timer.
 *
 * @param {String} seconds
 */
function addToTimer(seconds) {
    var ms = parseInt(seconds, 10) * 1e3;

    if (!(end instanceof Date)) {
        end = new Date();
    }

    end = new Date(end.getTime() + ms);
    step();
}


/**
 * Stop Audio
 */
function stopSound() {
    sound.pause();
    sound.currentTime = 0;
}

/**
 * Stop Timer
 */
function stopTimer() {
    // Reset timer
    isStopped = true;
    end = undefined;
    display(hmss(0));
}

/**
 * Stop timer and sounds.
 */
function stop() {
    stopSound();
    stopTimer();
}

/**
 * Toggle Microseconds
 */
function toggleMs() {
    $("#microseconds").style.display = $("#microseconds").style.display === "none" ? "" : "none";
}

// Event Listeners



/**
 * Called when the body is double clicked
 *
 * @param {MouseEvent} event
 */
function onBodyDblclick(event) {
    stop();
}

$("body").addEventListener("dblclick", onBodyDblclick);


/**
 * Called when page hash changes.
 *
 * @param {MouseEvent} event
 */
function onHashChange(event) {
    var str = event.target.window.location.hash.slice(1);
    run(str);
}

window.addEventListener("hashchange", onHashChange);


/**
 * Called whenever a keyboard key is pressed.
 *
 * @param {MouseEvent} event
 */
function onKeyPressed(event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (true) {
        case event.key === " ":
        case event.key === "0":
            stop();
            break;

        case event.key === "m":
            toggleMs();
            break;

        // 49-57 is 1-9 on the top row
        // 97-105 is 1-9 on the number keypad
        case /(49|5[0-7])/.test(event.keyCode) || /(9[7-9]|10[0-5])/.test(event.keyCode):

            // Depending on the number pressed (keypad or not), sub is the
            // number subtracted from the keyCode to get a base 10 number
            var sub = event.keyCode > 57 ? 96 : 48;
            var numberPressed = event.keyCode - sub;
            var time = numberPressed * 60;

            // If shift is pressed, subtracted the number.
            if (event.shiftKey) {
                time *= -1;
            }


            isStopped = false;
            addToTimer(time);
            break;

        default:
            break;
    }
}

window.addEventListener("keydown", onKeyPressed);
