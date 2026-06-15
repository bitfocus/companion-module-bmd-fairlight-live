import type ModuleInstance from './main.js'
import { combineRgb, type CompanionPresetDefinitions } from '@companion-module/base'
import { NUM_TALKBACK } from './config.js'

const PRESET_NUM_CHANNELS = 16
const PRESET_NUM_BUSES = 8

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {
		mixer_onair: {
			type: 'button',
			category: 'Mixer',
			name: 'On Air',
			style: {
				text: 'Off Air',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: 'mixer_onair',
					options: {},
					style: {
						text: 'On Air',
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
			steps: [
				{
					down: [{ actionId: 'mixer_onair', options: { state: '0' } }],
					up: [{ actionId: 'mixer_onair', options: { state: '1' } }],
				},
				{
					down: [{ actionId: 'mixer_onair', options: { state: '1' } }],
					up: [{ actionId: 'mixer_onair', options: { state: '0' } }],
				},
			],
		},
		mixer_reset_loudness: {
			type: 'button',
			category: 'Mixer',
			name: 'Monitor Loudness',
			style: {
				text: '$(fairlight-live:monitor_1_integrated_loudness_text)',
				textExpression: true,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: 'monitor_integrated',
					options: {
						comparitor: 'gt',
						level: 0,
					},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
			steps: [
				{
					down: [{ actionId: 'mixer_reset_loudness', options: {} }],
					up: [],
				},
			],
		},
		mixer_reset_main_loudness: {
			type: 'button',
			category: 'Mixer',
			name: 'Main 1 Loudness',
			style: {
				text: '$(fairlight-live:main_1_integrated_loudness_display)',
				textExpression: true,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: 'integrated',
					options: {
						path: '/main/1/integrated',
						comparitor: 'gt',
						level: 0,
					},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
					},
				},
			],
			steps: [
				{
					down: [{ actionId: 'mixer_reset_loudness', options: {} }],
					up: [],
				},
			],
		},

		afv_toggle: {
			type: 'button',
			category: 'AFV',
			name: 'AFV',
			style: {
				text: 'AFV',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: 'afv_enabled',
					options: {},
					style: {
						bgcolor: combineRgb(0, 255, 0),
						color: combineRgb(0, 0, 0),
					},
				},
			],
			steps: [
				{
					down: [{ actionId: 'afv_toggle', options: {} }],
					up: [],
				},
			],
		},

		...getAfvProgramPresets(self),

		cueplayer_bank_toggle: {
			type: 'button',
			category: 'Cue Player',
			name: 'A/B Bank Toggle',
			style: {
				text: 'Bank A',
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: 'cueplayer_bank',
					options: {},
					style: {
						text: 'Bank B',
					},
				},
			],
			steps: [
				{
					down: [{ actionId: 'cueplayer_bank_down', options: {} }],
					up: [{ actionId: 'cueplayer_bank_up', options: {} }],
				},
			],
		},

		cueplayer_midi_toggle: {
			type: 'button',
			category: 'Cue Player',
			name: 'MIDI Toggle',
			style: {
				text: 'MIDI',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: 'cueplayer_midi',
					options: {},
					style: {
						bgcolor: combineRgb(0, 128, 255),
					},
				},
			],
			steps: [
				{
					down: [{ actionId: 'cueplayer_midi_down', options: {} }],
					up: [{ actionId: 'cueplayer_midi_up', options: {} }],
				},
			],
		},

		cueplayer_dump: {
			type: 'button',
			category: 'Cue Player',
			name: 'Dump All Cues',
			style: {
				text: 'Dump',
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(128, 0, 0),
			},
			feedbacks: [],
			steps: [
				{
					down: [{ actionId: 'cueplayer_dump', options: {} }],
					up: [],
				},
			],
		},

		...getCuePresets(),
		...getTalkbackGroupPresets(),
		...getTalkbackMonitorPresets(),
		...getTalkbackChannelPresets(),
		...getTalkbackBusPresets(),
	}

	self.setPresetDefinitions(presets)
}

function getCuePresets(): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {}

	for (let i = 1; i <= 8; i++) {
		presets[`cueplayer_cue_${i}`] = {
			type: 'button',
			category: 'Cue Player',
			name: `Cue ${i}`,
			style: {
				text: String(i),
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 64, 0),
			},
			feedbacks: [],
			steps: [
				{
					down: [{ actionId: 'cueplayer_play_selected_bank', options: { cue: String(i) } }],
					up: [],
				},
			],
		}
	}

	return presets
}

function getAfvProgramPresets(self: ModuleInstance): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {}

	for (let c = 1; c <= self.state.mixer.camera; c++) {
		presets[`afv_program_${c}`] = {
			type: 'button',
			category: 'AFV',
			name: `Cam ${c}`,
			style: {
				text: `Cam ${c}`,
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: 'afv_program_camera',
					options: { camera: String(c) },
					style: {
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
			steps: [
				{
					down: [{ actionId: 'afv_program', options: { camera: String(c) } }],
					up: [],
				},
			],
		}
	}

	return presets
}

function getTalkbackGroupPresets(): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {}

	for (let t = 1; t <= NUM_TALKBACK; t++) {
		for (let g = 1; g <= 4; g++) {
			presets[`talkback_${t}_group_${g}`] = {
				type: 'button',
				category: `Circuit ${t}`,
				name: `Talk${g}`,
				style: {
					text: `Talk${g}`,
					size: '18',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: 'talkback_group_active',
						options: { talkback: String(t), group: String(g) },
						style: {
							bgcolor: combineRgb(255, 128, 0),
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: 'talkback_talk_down',
								options: { talkback: String(t), target_type: 'group', target: String(g) },
							},
						],
						up: [
							{
								actionId: 'talkback_talk_up',
								options: { talkback: String(t), target_type: 'group', target: String(g) },
							},
						],
					},
				],
			}
		}
	}

	return presets
}

function getTalkbackMonitorPresets(): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {}

	for (let t = 1; t <= NUM_TALKBACK; t++) {
		for (let m = 1; m <= NUM_TALKBACK; m++) {
			if (m === t) continue

			presets[`talkback_${t}_monitor_${m}`] = {
				type: 'button',
				category: `Circuit ${t}`,
				name: `Mon ${m}`,
				style: {
					text: `Mon ${m}`,
					size: '18',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: 'talkback_monitor_active',
						options: { talkback: String(t), monitor: String(m) },
						style: {
							bgcolor: combineRgb(255, 0, 0),
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: 'talkback_talk_down',
								options: { talkback: String(t), target_type: 'monitor', target: String(m) },
							},
						],
						up: [
							{
								actionId: 'talkback_talk_up',
								options: { talkback: String(t), target_type: 'monitor', target: String(m) },
							},
						],
					},
				],
			}
		}
	}

	return presets
}

function getTalkbackChannelPresets(): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {}

	for (let t = 1; t <= NUM_TALKBACK; t++) {
		for (let c = 1; c <= PRESET_NUM_CHANNELS; c++) {
			presets[`talkback_${t}_channel_${c}`] = {
				type: 'button',
				category: `Circuit ${t}`,
				name: `Ch ${c}`,
				style: {
					text: `Ch ${c}`,
					size: '18',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				feedbacks: [
					{
						feedbackId: 'talkback_channel_active',
						options: { talkback: String(t), channel: String(c) },
						style: {
							bgcolor: combineRgb(255, 128, 0),
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: 'talkback_talk_down',
								options: { talkback: String(t), target_type: 'channel', target: String(c) },
							},
						],
						up: [
							{
								actionId: 'talkback_talk_up',
								options: { talkback: String(t), target_type: 'channel', target: String(c) },
							},
						],
					},
				],
			}
		}
	}

	return presets
}

function getTalkbackBusPresets(): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {}

	const busTypes = [
		{ id: 'sub', label: 'Sub' },
		{ id: 'aux', label: 'Aux' },
		{ id: 'mixm', label: 'MxM' },
	]

	for (let t = 1; t <= NUM_TALKBACK; t++) {
		for (const busType of busTypes) {
			for (let b = 1; b <= PRESET_NUM_BUSES; b++) {
				presets[`talkback_${t}_${busType.id}_${b}`] = {
					type: 'button',
					category: `Circuit ${t}`,
					name: `${busType.label} ${b}`,
					style: {
						text: `${busType.label} ${b}`,
						size: '18',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					feedbacks: [
						{
							feedbackId: 'talkback_bus_active',
							options: { talkback: String(t), bus_type: busType.id, bus: String(b) },
							style: {
								bgcolor: combineRgb(255, 128, 0),
							},
						},
					],
					steps: [
						{
							down: [
								{
									actionId: 'talkback_talk_down',
									options: { talkback: String(t), target_type: busType.id, target: String(b) },
								},
							],
							up: [
								{
									actionId: 'talkback_talk_up',
									options: { talkback: String(t), target_type: busType.id, target: String(b) },
								},
							],
						},
					],
				}
			}
		}
	}

	return presets
}
