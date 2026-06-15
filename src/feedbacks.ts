import { combineRgb, type CompanionFeedbackDefinitions } from '@companion-module/base'
import { NUM_TALKBACK } from './config.js'
import { getCameraChoices, getChannelChoices, getMaxBusChoices } from './choices.js'
import { compareNumber, NumberComparitor, NumberComparitorPicker } from './comparitor.js'
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

function formatLevel(level: number | undefined): string {
	if (level === undefined) return '--.-'
	if (level <= -100) return '-inf'
	return level.toFixed(level < -50 ? 0 : 1)
}

function levelTextStyle(level: number | undefined): { text: string } {
	return { text: formatLevel(level) }
}

const LEVEL_COMPARISON_OPTION = {
	type: 'number' as const,
	label: 'Fader Level',
	id: 'level',
	range: true,
	default: 0,
	step: 0.1,
	min: -100,
	max: 10,
	showMinAsNegativeInfinity: true,
}

const LEVEL_COMPARISON_STYLE = {
	color: combineRgb(0, 0, 0),
	bgcolor: combineRgb(0, 255, 0),
}

export function getFeedbacks(self: ModuleInstance): CompanionFeedbackDefinitions {
	const cameraChoices = getCameraChoices(self)

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

	const channelChoices = getChannelChoices(self)
	const busChoices = getMaxBusChoices(self)

	const monitorChoices = [
		{ id: '1', label: 'Monitor 1' },
		{ id: '2', label: 'Monitor 2' },
		{ id: '3', label: 'Monitor 3' },
		{ id: '4', label: 'Monitor 4' },
	]

	return {
		mixer_onair: {
			type: 'boolean',
			name: 'Mixer: On Air',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => self.state.system.onAir === 1,
		},

		afv_enabled: {
			type: 'boolean',
			name: 'AFV: Enabled',
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
			name: 'Channel: Muted',
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
			name: 'Bus: Muted',
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
			name: 'Channel: Send Muted',
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
			name: 'Bus: Send Muted',
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

		channel_level: {
			type: 'boolean',
			name: 'Channel: Level',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [
				{ type: 'dropdown', id: 'channel', label: 'Channel', choices: channelChoices, default: '1' },
				NumberComparitorPicker(),
				LEVEL_COMPARISON_OPTION,
			],
			callback: (feedback) => {
				const channel = String(feedback.options.channel)
				self.subscribePath(`/channel/${channel}/level`)
				const level = self.state.channels.levels[channel]
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: (feedback) => {
				const level = self.state.channels.levels[String(feedback.options.channel)]
				return level === undefined ? undefined : { level }
			},
		},

		bus_level: {
			type: 'boolean',
			name: 'Bus: Level',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [
				{ type: 'dropdown', id: 'bus_type', label: 'Bus Type', choices: BUS_TYPES, default: 'main' },
				{ type: 'dropdown', id: 'bus', label: 'Bus', choices: busChoices, default: '1' },
				NumberComparitorPicker(),
				LEVEL_COMPARISON_OPTION,
			],
			callback: (feedback) => {
				const busType = String(feedback.options.bus_type)
				const bus = String(feedback.options.bus)
				self.subscribePath(`/${busType}/${bus}/level`)
				const level = self.state.buses.levels[`${busType}/${bus}`]
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: (feedback) => {
				const level = self.state.buses.levels[`${feedback.options.bus_type}/${feedback.options.bus}`]
				return level === undefined ? undefined : { level }
			},
		},

		channel_send_level: {
			type: 'boolean',
			name: 'Channel: Send Level',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [
				{ type: 'dropdown', id: 'channel', label: 'Channel', choices: channelChoices, default: '1' },
				{ type: 'dropdown', id: 'dest_type', label: 'Send Destination', choices: SEND_DEST_TYPES, default: 'aux' },
				{ type: 'dropdown', id: 'dest_bus', label: 'Bus', choices: busChoices, default: '1' },
				NumberComparitorPicker(),
				LEVEL_COMPARISON_OPTION,
			],
			callback: (feedback) => {
				const key = `channel/${feedback.options.channel}/${feedback.options.dest_type}/${feedback.options.dest_bus}`
				self.subscribePath(`/${key}/level`)
				const level = self.state.sends.levels[key]
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: (feedback) => {
				const key = `channel/${feedback.options.channel}/${feedback.options.dest_type}/${feedback.options.dest_bus}`
				const level = self.state.sends.levels[key]
				return level === undefined ? undefined : { level }
			},
		},

		bus_send_level: {
			type: 'boolean',
			name: 'Bus: Send Level',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [
				{ type: 'dropdown', id: 'src_type', label: 'Source Bus Type', choices: SEND_SOURCE_TYPES, default: 'sub' },
				{ type: 'dropdown', id: 'src_bus', label: 'Source Bus', choices: busChoices, default: '1' },
				{ type: 'dropdown', id: 'dest_type', label: 'Send Destination', choices: SEND_DEST_TYPES, default: 'aux' },
				{ type: 'dropdown', id: 'dest_bus', label: 'Destination Bus', choices: busChoices, default: '1' },
				NumberComparitorPicker(),
				LEVEL_COMPARISON_OPTION,
			],
			callback: (feedback) => {
				const key = `${feedback.options.src_type}/${feedback.options.src_bus}/${feedback.options.dest_type}/${feedback.options.dest_bus}`
				self.subscribePath(`/${key}/level`)
				const level = self.state.sends.levels[key]
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: (feedback) => {
				const key = `${feedback.options.src_type}/${feedback.options.src_bus}/${feedback.options.dest_type}/${feedback.options.dest_bus}`
				const level = self.state.sends.levels[key]
				return level === undefined ? undefined : { level }
			},
		},

		channel_level_text: {
			type: 'advanced',
			name: 'Channel: Level Text',
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
				const channel = String(feedback.options.channel)
				self.subscribePath(`/channel/${channel}/level`)
				return levelTextStyle(self.state.channels.levels[channel])
			},
		},

		bus_level_text: {
			type: 'advanced',
			name: 'Bus: Level Text',
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
				const busType = String(feedback.options.bus_type)
				const bus = String(feedback.options.bus)
				self.subscribePath(`/${busType}/${bus}/level`)
				return levelTextStyle(self.state.buses.levels[`${busType}/${bus}`])
			},
		},

		channel_send_level_text: {
			type: 'advanced',
			name: 'Channel: Send Level Text',
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
				const channel = String(feedback.options.channel)
				const destType = String(feedback.options.dest_type)
				const destBus = String(feedback.options.dest_bus)
				self.subscribePath(`/channel/${channel}/${destType}/${destBus}/level`)
				return levelTextStyle(self.state.sends.levels[`channel/${channel}/${destType}/${destBus}`])
			},
		},

		bus_send_level_text: {
			type: 'advanced',
			name: 'Bus: Send Level Text',
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
				const srcType = String(feedback.options.src_type)
				const srcBus = String(feedback.options.src_bus)
				const destType = String(feedback.options.dest_type)
				const destBus = String(feedback.options.dest_bus)
				self.subscribePath(`/${srcType}/${srcBus}/${destType}/${destBus}/level`)
				return levelTextStyle(self.state.sends.levels[`${srcType}/${srcBus}/${destType}/${destBus}`])
			},
		},

		cueplayer_bank: {
			type: 'boolean',
			name: 'Cue Player: Bank B',
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
