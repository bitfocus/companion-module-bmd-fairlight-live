## Blackmagic Design Fairlight Live Companion Module

This module controls the Fairlight Live audio mixer via OSC over TCP.

### Configuration

- **Target IP**: The IP address of the Fairlight Live server
- **OSC Port**: The OSC TCP port (default: 8000)

When Companion is running on the Fairlight Live computer, configure Fairlight Live Show Settings
to use a different OSC port, such as `8001`.

## Version History

**v1.1.0:** Support for 1.0.2 OSC specification.
Monitor controls (level, mute, dim); mixer on-air action; loudness reset; additional feedbacks for level/pan text, meter comparisons, and integrated loudness;
bus pan and send pan; dynamic channel/bus counts from mixer; presets for mixer, AFV, cue player, and talkback routing

**v1.0.3:** Initial release

See HELP.md and LICENSE for additional documentation.
