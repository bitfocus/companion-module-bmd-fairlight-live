## Blackmagic Design: Fairlight Live

This module controls Fairlight Live audio mixer via OSC over TCP (SLIP-framed).

### Configuration

- **Target IP** — The IP address of the Fairlight Live console
- **OSC Port** — The OSC TCP port (default: 8000)

### Actions

- **AFV** — Enable/disable, set program/preview camera, configure fade in/out times and levels
- **Talkback** — Talk to groups, channels, buses, monitors; configure input trim, mic gain, phantom power, HPF, input level
- **Cue Player** — Play cues, MIDI triggers, dump all cues
- **Channels** — Set level, mute, send level, send mute
- **Buses** — Set level, mute, send level, send mute (Main, Sub, Aux, Mix Minus, Matrix)

### Feedbacks

- AFV enabled state, program/preview camera
- Talkback group/channel/bus/monitor active
- Channel mute, bus mute, channel send mute, bus send mute

### Variables

- AFV state (on, program, preview, fade times/levels, hold time)
- Channel levels and mute states
- Bus levels and mute states (all types)
