# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [v2.0.0] - 2017-07-06
### New
- Enter time mode chg: css cleanup fix: timer flickering at last second.
- Removed redudant output of hours. new: background progress bar. new: times up message.

### Changes
- Removed redundant function.
- Moved all stop actions to stop() function.
- Remove redundant code.

### Fix
- Removed premature stop() call.
- Stop timer when alarm is running.
- Only show tutorial div on load with CSS rather than JS.

## v1.0.0 - 2017-04-03
### Other
- Added `addToTimer()` function to handle addition/subtraction to the timer.
- Created `stop()` function that calls stopSound and stopTimer.
- Set `end` to undefined when timer is stopped.
- Calculate new end time.
- If no string is passed to `run`, stop the timer.
- Removed consoles.
- Made it so that the page doesn't move.
- Added blank favicon.
- Starting point.

[v2.0.0]: https://github.com/CoderDojoChi/timer/compare/v1.0.0...v2.0.0
