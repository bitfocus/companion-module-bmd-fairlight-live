import { combineRgb, type CompanionFeedbackDefinitions } from '@companion-module/base'
import { NUM_CAMERAS, NUM_TALKBACK, NUM_CHANNELS, NUM_BUSES } from './config.js'
import type ModuleInstance from './main.js'

const BUS_TYPES = [
	{ id: 'main', label: 'Main' },
	{ id: 'sub', label: 'Sub' },
	{ id: 'aux', label: 'Aux' },
	{ id: 'mixm', label: 'Mix Minus' },
	{ id: 'mtx', label: 'Matrix' },
]

const SEND_DEST_TYPES = [
	{ id: 'aux', label: 'Aux' },
	{ id: 'mixm', label: 'Mix Minus' },
	{ id: 'mtx', label: 'Matrix' },
]

const SEND_SOURCE_TYPES = [
	{ id: 'sub', label: 'Sub' },
	{ id: 'aux', label: 'Aux' },
	{ id: 'mixm', label: 'Mix Minus' },
]

export function getFeedbacks(self: ModuleInstance): CompanionFeedbackDefinitions {
	const cameraChoices = []
	for (let i = 1; i <= NUM_CAMERAS; i++) {
		cameraChoices.push({ id: String(i), label: `Camera ${i}` })
	}

	const talkbackChoices = []
	for (let i = 1; i <= NUM_TALKBACK; i++) {
		const label = i === 1 ? `${i} (Console Operator)` : `${i}`
		talkbackChoices.push({ id: String(i), label })
	}

	const groupChoices = [
		{ id: '1', label: 'Group 1' },
		{ id: '2', label: 'Group 2' },
		{ id: '3', label: 'Group 3' },
		{ id: '4', label: 'Group 4' },
	]

	const channelChoices = []
	for (let i = 1; i <= NUM_CHANNELS; i++) {
		channelChoices.push({ id: String(i), label: `Channel ${i}` })
	}

	const busChoices = []
	for (let i = 1; i <= NUM_BUSES; i++) {
		busChoices.push({ id: String(i), label: `Bus ${i}` })
	}

	const monitorChoices = [
		{ id: '1', label: 'Monitor 1' },
		{ id: '2', label: 'Monitor 2' },
		{ id: '3', label: 'Monitor 3' },
		{ id: '4', label: 'Monitor 4' },
	]

	return {
		afv_enabled: {
			type: 'boolean',
			name: 'AFV: Is Enabled',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.state.afv.on === 1
			},
		},

		afv_program_camera: {
			type: 'boolean',
			name: 'AFV: Program Camera Active',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'camera',
					label: 'Camera',
					choices: cameraChoices,
					default: '1',
				},
			],
			callback: (feedback) => {
				return self.state.afv.program === Number(feedback.options.camera)
			},
		},

		afv_preview_camera: {
			type: 'boolean',
			name: 'AFV: Preview Camera Active',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					id: 'camera',
					label: 'Camera',
					choices: cameraChoices,
					default: '1',
				},
			],
			callback: (feedback) => {
				return self.state.afv.preview === Number(feedback.options.camera)
			},
		},

		talkback_group_active: {
			type: 'boolean',
			name: 'Talkback: Group Active',
			defaultStyle: {
				bgcolor: combineRgb(255, 128, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'talkback',
					label: 'Talkback Circuit',
					choices: talkbackChoices,
					default: '1',
				},
				{
					type: 'dropdown',
					id: 'group',
					label: 'Group',
					choices: groupChoices,
					default: '1',
				},
			],
			callback: (feedback) => {
				const key = `${feedback.options.talkback}/${feedback.options.group}`
				return self.state.talkback.groups[key] === 1
			},
		},

		talkback_channel_active: {
			type: 'boolean',
			name: 'Talkback: Channel Active',
			defaultStyle: {
				bgcolor: combineRgb(255, 128, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'talkback',
					label: 'Talkback Circuit',
					choices: talkbackChoices,
					default: '1',
				},
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: channelChoices,
					default: '1',
				},
			],
			callback: (feedback) => {
				const key = `${feedback.options.talkback}/${feedback.options.channel}`
				return self.state.talkback.channels[key] === 1
			},
		},

		talkback_bus_active: {
			type: 'boolean',
			name: 'Talkback: Bus Active',
			defaultStyle: {
				bgcolor: combineRgb(255, 128, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'talkback',
					label: 'Talkback Circuit',
					choices: talkbackChoices,
					default: '1',
				},
				{
					type: 'dropdown',
					id: 'bus_type',
					label: 'Bus Type',
					choices: SEND_SOURCE_TYPES,
					default: 'aux',
				},
				{
					type: 'dropdown',
					id: 'bus',
					label: 'Bus',
					choices: busChoices,
					default: '1',
				},
			],
			callback: (feedback) => {
				const key = `${feedback.options.talkback}/${feedback.options.bus_type}/${feedback.options.bus}`
				return self.state.talkback.buses[key] === 1
			},
		},

		talkback_monitor_active: {
			type: 'boolean',
			name: 'Talkback: Monitor Active',
			defaultStyle: {
				bgcolor: combineRgb(255, 128, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'talkback',
					label: 'Talkback Circuit',
					choices: talkbackChoices,
					default: '1',
				},
				{
					type: 'dropdown',
					id: 'monitor',
					label: 'Monitor',
					choices: monitorChoices,
					default: '1',
				},
			],
			callback: (feedback) => {
				const key = `${feedback.options.talkback}/${feedback.options.monitor}`
				return self.state.talkback.monitors[key] === 1
			},
		},

		channel_muted: {
			type: 'boolean',
			name: 'Channel: Is Muted',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: channelChoices,
					default: '1',
				},
			],
			callback: (feedback) => {
				return self.state.channels.mutes[String(feedback.options.channel)] === 1
			},
		},

		bus_muted: {
			type: 'boolean',
			name: 'Bus: Is Muted',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'bus_type',
					label: 'Bus Type',
					choices: BUS_TYPES,
					default: 'main',
				},
				{
					type: 'dropdown',
					id: 'bus',
					label: 'Bus',
					choices: busChoices,
					default: '1',
				},
			],
			callback: (feedback) => {
				const key = `${feedback.options.bus_type}/${feedback.options.bus}`
				return self.state.buses.mutes[key] === 1
			},
		},

		channel_send_muted: {
			type: 'boolean',
			name: 'Channel: Send Is Muted',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: channelChoices,
					default: '1',
				},
				{
					type: 'dropdown',
					id: 'dest_type',
					label: 'Send Destination',
					choices: SEND_DEST_TYPES,
					default: 'aux',
				},
				{
					type: 'dropdown',
					id: 'dest_bus',
					label: 'Bus',
					choices: busChoices,
					default: '1',
				},
			],
			callback: (feedback) => {
				const key = `channel/${feedback.options.channel}/${feedback.options.dest_type}/${feedback.options.dest_bus}`
				return self.state.sends.mutes[key] === 1
			},
		},

		bus_send_muted: {
			type: 'boolean',
			name: 'Bus: Send Is Muted',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'src_type',
					label: 'Source Bus Type',
					choices: SEND_SOURCE_TYPES,
					default: 'sub',
				},
				{
					type: 'dropdown',
					id: 'src_bus',
					label: 'Source Bus',
					choices: busChoices,
					default: '1',
				},
				{
					type: 'dropdown',
					id: 'dest_type',
					label: 'Send Destination',
					choices: SEND_DEST_TYPES,
					default: 'aux',
				},
				{
					type: 'dropdown',
					id: 'dest_bus',
					label: 'Destination Bus',
					choices: busChoices,
					default: '1',
				},
			],
			callback: (feedback) => {
				const key = `${feedback.options.src_type}/${feedback.options.src_bus}/${feedback.options.dest_type}/${feedback.options.dest_bus}`
				return self.state.sends.mutes[key] === 1
			},
		},

		cueplayer_bank: {
			type: 'boolean',
			name: 'Cue Player: Bank Is B',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 255),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.state.cuePlayer.bank === 'B'
			},
		},

		cueplayer_midi: {
			type: 'boolean',
			name: 'Cue Player: MIDI Active',
			defaultStyle: {
				bgcolor: combineRgb(0, 128, 255),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.state.cuePlayer.midi
			},
		},
	}
}
