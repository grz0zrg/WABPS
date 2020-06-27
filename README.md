# WABPS

Web Audio high quality spectogram from biquad bandpass filters

This is a complete demo of a high quality spectogram built out of the Web Audio biquad bandpass filters.

The demo contain code for up to 96db bp rolloff by simple biquad filters cascade, this may improve quality considerably however it is not perfect due to filter design thus it may cause ringing issues as order increase (spectrum may look delayed / smoothed), one can only reduce this by slightly increasing the bandwidth

The bank filters default rolloff is 12db by default, a function argument name must be changed to select rolloff (24db, 48db, 96db)

The example code is straightforward and support both linear and logarithmic rendering.

The output values are normalized.

See also the [real-time version](https://github.com/grz0zrg/WABSP2) which compare Web Audio analyzer node to this method.