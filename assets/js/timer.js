const sound = $('.beep');
let start;
let end;
let isStopped = true;
let msHidden = true;

let enteredTime = '';

// Helpers

function $(str) {
    const q = document.querySelectorAll(str);
    if (q.length === 1) {
        return q[0];
    }

    return q;
}

Element.prototype.hide = function () {
    this.style.display = 'none';
};

Element.prototype.show = function (forcedDisplayValue) {
    if (forcedDisplayValue) {
        this.style.display = forcedDisplayValue;
    } else {
        this.style.removeProperty('display');
    }
};

/**
 *
 * @param {*} str
 */
function getTime(str) {
    if (str.constructor === Number || str.indexOf(':') === -1) {
        return parseInt(str, 10) * 1e3;
    }

    let ms = 0;

    const multiples = [
        // 1 second
        1,

        // 1 minute; 60 seconds
        60,

        // 1 hour; 60 * 60 seconds
        3600,

        // 1 day; 60 * 60 * 24 seconds
        86400,

        // 1 week; 60 * 60 * 24 * 7 seconds
        604800
    ];

    const parts = str.split(':');
    while (parts.length > 0) {
        ms += parts.pop() * multiples.shift();
    }

    return ms * 1e3;
}

function display(date) {
    if (date.isEmpty === true) {
        $('.timer').hide();
        $('.tutorial').show();
        return;
    }

    $('.bg-fill').show();
    $('.timer').show('flex');
    $('.tutorial').hide();

    const parts = ['days', 'hours', 'minutes', 'seconds', 'milliseconds'];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        let show = false;

        let x = i;
        while (x >= 0) {
            show = (show || parseInt(date[parts[x]], 10) > 0);
            x--;
        }

        if (show === true || part === 'seconds') {
            $('.' + part).style.display = 'inline-block';
            $('.' + part + ' span').innerText = date[part];
        } else {
            $('.' + part).style.display = 'none';
        }

        if (part === 'milliseconds') {
            if (msHidden === true) {
                $('.milliseconds').style.display = 'none';
            } else {
                $('.milliseconds').style.display = '';
            }
        }
    }
}

function run(str) {
    if (!str) {
        stop();
        return;
    }

    start = new Date();
    end = new Date(start.getTime() + getTime(str));

    isStopped = false;
    step();
}

function hmss(milliseconds) {
    const date = {
        isEmpty: false
    };

    if (parseFloat(milliseconds) <= 0) {
        date.isEmpty = true;
        return date;
    }

    let x = milliseconds / 1e3;

    // Milliseconds
    const ms = String(parseInt(((x % 1) * 1e3), 10));
    date.milliseconds = '000'.substring(ms.length) + ms;

    // Seconds
    const s = String(parseInt(x % 60, 10));
    date.seconds = '00'.substring(s.length) + s;

    // Minute
    x /= 60;
    const m = String(parseInt(x % 60, 10));
    date.minutes = '00'.substring(m.length) + m;

    // Hours
    x /= 60;
    const h = String(parseInt(x % 24, 10));
    date.hours = '00'.substring(h.length) + h;

    // Days
    x /= 24;
    const d = String(parseInt(x, 10));
    date.days = '00'.substring(d.length) + d;

    return date;
}

/**
 *
 */
function step() {
    if (isStopped) {
        return;
    }

    const now = Number(new Date());
    const diff = end - now;

    // Only run when more than 100 milliseconds of difference
    if (diff > 100) {
        const percentage = ((now - start) / (end - start)) * 100;
        $('.bg-fill').style.width = percentage + '%';

        display(hmss(diff));

        window.requestAnimationFrame(step);
    } else {
        // Done

        isStopped = true;

        $('.done').show('flex');
        $('.tutorial').hide();
        $('.timer').hide();
        $('.bg-fill').hide();

        sound.play();
    }
}

function isDone() {
    return (end - Number(new Date())) < 0;
}

/**
 * Stop timer and sounds.
 */
function stop() {
    // Reset enteredTime
    enteredTime = '';

    // Stop sound
    sound.pause();
    sound.currentTime = 0;

    // Reset timer
    isStopped = true;
    end = undefined;

    // Update display
    $('.timer').hide();
    $('.done').hide();
    $('.bg-fill').hide();
    $('.time').hide();
    $('.time').innerText = '';
    $('.tutorial').show();
}

// Event Listeners

/**
 * Called when page hash changes.
 *
 * @param {MouseEvent} event
 */
function onHashChange(event) {
    const str = event.target.window.location.hash.slice(1);
    run(str);
}

function numberPressed(event) {
    // Depending on the number pressed (keypad or not), sub is the
    // number subtracted from the keyCode to get a base 10 number
    const sub = event.keyCode > 57 ? 96 : 48;
    let numberPressed = event.keyCode - sub;

    // If shift is pressed, subtracted the number.
    if (event.shiftKey) {
        numberPressed *= -1;
    }

    // If running
    if (isStopped === false) {
        addToTimer(numberPressed);
    } else {
        // Stop();
        if (isDone()) {
            stop();
        }
        enterTime(numberPressed);
    }
}

/**
 * Add `seconds` to current (or new) timer.
 *
 * @param {String} seconds
 */
function addToTimer(numberPressed) {
    if (numberPressed === 0) {
        return;
    }

    const timePad = 1;

    // Make into seconds
    const seconds = (parseInt(numberPressed, 10) * 60) + timePad;

    const ms = seconds * 1e3;

    if (!(end instanceof Date)) {
        end = new Date();
    }

    end = new Date(end.getTime() + ms);

    // Start
    step();
}

function enterTime(numberPressed, isDelete) {
    // Hide tutorial
    $('.tutorial').hide();

    // Show time mode
    $('.time').show('flex');

    /*
     * Make string to always be in #### format
     */

    // Get numbers only.
    enteredTime = enteredTime.replace(/\D/g, '');

    if (isDelete) {
        enteredTime = enteredTime.slice(0, -1);
    } else {
        // Add number pressed to end of string
        enteredTime = parseInt(enteredTime + numberPressed, 10);
    }

    // Pad number to be in at least #### format
    enteredTime = '0000'.substring(enteredTime.length) + enteredTime;

    // Only return the last 4 number
    enteredTime = enteredTime.slice(-4);

    // Format entered time as ##[:##]
    enteredTime = enteredTime.replace(/(.{2})/g, '$1:').replace(/(.*?):$/g, '$1');

    // Display on page
    $('.time').innerText = enteredTime;
}

/**
 * Called whenever a keyboard key is pressed.
 *
 * @param {MouseEvent} event
 */
function onKeyPressed(event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    const key = event.keyCode;

    // 32 = SPACEBAR
    // 48 = ESC
    if (key === 32 || key === 27) {
        // Call stop function
        stop();
        return;
    }

    // 77 = M
    if (key === 77) {
        msHidden = !msHidden;
        return;
    }

    // 48-57 = top row numbers (0-9)
    // 96-105 = keypad numbers (0-9)
    if ((key >= 48 && key <= 57) || (key >= 96 && key <= 105)) {
        numberPressed(event);
    }

    // 13 = ENTER
    if (key === 13) {
        // Start timer if a number has been entered.
        if (isStopped === true && enteredTime.length > 0) {
            // Hide #time
            $('.time').innerText = '';
            $('.time').hide();

            // Set to false so run() works
            isStopped = false;

            // Start
            run(enteredTime);
        }
    }

    // 8 = BACKSPACE
    if (key === 8) {
        enterTime(0, true);
    }

    // 46 = DELETE

    // 70 = F
    if (key === 70) {
        if (screenfull.enabled) {
            screenfull.toggle();
        }
    }
}

function mobileWorkAround(event) {
    event.preventDefault();
    event.stopPropagation();
    document.querySelector('.input').focus();
}

function loaded() {
    run(window.location.hash.slice(1));
}

window.addEventListener('load', loaded);
window.addEventListener('keydown', onKeyPressed);
window.addEventListener('hashchange', onHashChange);
document.body.addEventListener('touchend', mobileWorkAround);

// TODO: A way for mobile users to stop alarm
document.body.addEventListener('dblclick', stop);
