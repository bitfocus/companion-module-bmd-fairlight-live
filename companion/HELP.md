## Blackmagic Design: Fairlight Live

Controls Fairlight Live using OSC over TCP.

### Configuration

- **Target IP**: IP address of the Fairlight Live system.
- **OSC Port**: OSC TCP port configured in Fairlight Live Show Settings. Default: `8000`.

When Companion is running on the Fairlight Live computer, configure Fairlight Live Show Settings to use a different OSC port, such as `8001`.

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

- Level comparisons for channels, buses, sends, and monitors.
- Level and pan text displays.
- Channel, bus, and monitor meter comparisons. Meters use the maximum level across all stems.
- Integrated loudness comparisons and text for Main buses and Monitor 1, plus Monitor 1 true-peak comparisons and text.
- On Air, AFV, talkback, mute/dim, cue mode, camera name, and talkback input feedbacks.

### Variables

Variables provide On Air and AFV state, plus channel, bus, and send levels and mute states. Available channel, bus, and camera choices follow the mixer configuration reported by Fairlight Live.

### Presets

Presets are provided for Mixer On Air, AFV, Cue Player, and talkback routing.
