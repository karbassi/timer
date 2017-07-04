const sound = $('#beep');
let start;
let end;
let isStopped = false;
let msHidden = true;

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

function getTime(str) {
	if (str.indexOf(':') === -1) {
		return parseInt(str, 10) * 1e3;
	}

	let ms = 0;

	const multiples = [
        // 1 second
		1,

        // 1 minute
        // 60 seconds
		60,

        // 1 hour
        // 60 * 60 seconds
		3600,

        // 1 day
        // 60 * 60 * 24 seconds
		86400,

        // 1 week
        // 60 * 60 * 24 * 7 seconds
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
		$('#timer').hide();
		$('#tutorial').show();
		return;
	}

	$('#bgfill').show();
	$('#timer').show();
	$('#tutorial').hide();

	const parts = ['days', 'hours', 'minutes', 'seconds', 'milliseconds'];

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		let show = false;

		let x = i;
		while (x >= 0) {
			show = (show || parseInt(date[parts[x]], 10) > 0);
			x--;
		}

		if (show === true) {
			$('#' + part).style.display = 'inline-block';
			$('#' + part + ' span').innerText = date[part];
		} else {
			$('#' + part).style.display = 'none';
		}

		if (part === 'milliseconds') {
			if (msHidden === true) {
				$('#milliseconds').style.display = 'none';
			} else {
				$('#milliseconds').style.display = '';
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
	let ms = String(parseInt(((x % 1) * 1e3), 10));

	while (ms.length < 3) {
		ms += '0';
	}

	date.milliseconds = ms;

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

	if (diff > 0) {
		const percentage = ((now - start) / (end - start)) * 100;
		$('#bgfill').style.width = percentage + '%';

		display(hmss(diff));

		window.requestAnimationFrame(step);
	} else {
        // Done
		// display(hmss(0));

		$('#tutorial').hide();
		$('#timer').hide();
		$('#done').show('flex');
		$('#bgfill').hide();

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
	const ms = parseInt(seconds, 10) * 1e3;

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
	// Display(hmss(0));
	$('#tutorial').show();
	$('#timer').hide();
	$('#done').hide();
	$('#bgfill').hide();
}

/**
 * Stop timer and sounds.
 */
function stop() {
	stopSound();
	stopTimer();
}

/**
 * Toggle milliseconds
 */
function toggleMs() {
	msHidden = !msHidden;
}

// Event Listeners

/**
 * Called when the body is double clicked
 */
function onBodyDblclick() {
	stop();
}

/**
 * Called when page hash changes.
 *
 * @param {MouseEvent} event
 */
function onHashChange(event) {
	const str = event.target.window.location.hash.slice(1);
	run(str);
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

    // 32 = spacebar
    // 48 = "0" key
	if (event.keyCode === 32 || event.keyCode === 48) {
		stop();
		return;
	}

    // 77 = "m" key
	if (event.keyCode === 77) {
		toggleMs();
		return;
	}

    // 49-57 is 1-9 on the top row
    // 97-105 is 1-9 on the number keypad
	if (/(49|5[0-7])/.test(event.keyCode) || /(9[7-9]|10[0-5])/.test(event.keyCode)) {
        // Depending on the number pressed (keypad or not), sub is the
        // number subtracted from the keyCode to get a base 10 number
		const sub = event.keyCode > 57 ? 96 : 48;
		const numberPressed = event.keyCode - sub;
		let time = numberPressed * 60;

		const timePad = 1;
		time += timePad;

        // If shift is pressed, subtracted the number.
		if (event.shiftKey) {
			time *= -1;
		}

		isStopped = false;
		addToTimer(time);
	}
}

window.addEventListener('keydown', onKeyPressed);
window.addEventListener('hashchange', onHashChange);
document.body.addEventListener('dblclick', onBodyDblclick);
run(window.location.hash.slice(1));
