## Blackmagic Design: Fairlight Live

Controls Fairlight Live using OSC over TCP.

### Configuration

- **Target IP**: IP address of the Fairlight Live system.
- **OSC Port**: OSC TCP port configured in Fairlight Live Show Settings. Default: `8000`.

When Companion is running on the Fairlight Live computer, configure Fairlight Live Show Settings to use a different OSC port, such as `8001`.
Note also that the channel and bus resources are dynamic, based on the loaded show.

### Actions

- **Mixer**: Set On Air or Off Air.
- **Channels**: Level, mute, pan, and aux/mix-minus/matrix send controls.
- **Buses**: Level, mute, pan, and send controls for Main, Sub, Aux, Mix Minus, and Matrix buses.
- **Monitors**: Level, mute, and dim.
- **AFV**: Enable, program/preview camera, fade settings, and hold time.
- **Talkback**: Route to groups, channels, buses, and monitors; control talkback input settings.
- **Cue Player**: Play audio or MIDI cues and dump all cues.

Level and pan actions support absolute and relative control where available.

### Feedbacks

Feedbacks are available for On Air, AFV, talkback routing, mute/dim states, cue mode, level and pan text, camera names, talkback input values, and channel/bus/monitor meters.

### Variables

Variables provide On Air and AFV state, plus channel, bus, and send levels and mute states. Available channel, bus, and camera choices follow the mixer configuration reported by Fairlight Live.

### Presets

Presets are provided for Mixer On Air, AFV, Cue Player, and talkback routing.
