import { combineRgb, type CompanionFeedbackDefinitions } from '@companion-module/base'
import { NUM_MONITORS, NUM_TALKBACK } from './config.js'
import { getCameraChoices, getChannelChoices, getMaxBusChoices } from './choices.js'
import type ModuleInstance from './main.js'

const busTypes = [
	{ id: 'main', label: 'Main' },
	{ id: 'sub', label: 'Sub' },
	{ id: 'aux', label: 'Aux' },
	{ id: 'mixm', label: 'Mix Minus' },
	{ id: 'mtx', label: 'Matrix' },
]
const panBusTypes = busTypes.filter((bus) => bus.id !== 'main')
const sendSourceTypes = panBusTypes.filter((bus) => bus.id !== 'mtx')
const sendDestTypes = panBusTypes.filter((bus) => bus.id !== 'sub')
const monitorChoices = Array.from({ length: NUM_MONITORS }, (_, i) => ({
	id: String(i + 1),
	label: `Monitor ${i + 1}`,
}))
const talkbackChoices = Array.from({ length: NUM_TALKBACK }, (_, i) => ({
	id: String(i + 1),
	label: `Talkback ${i + 1}`,
}))
const stemChoices = [
	{ id: 'max', label: 'Maximum' },
	...Array.from({ length: 16 }, (_, i) => ({ id: String(i + 1), label: `Stem ${i + 1}` })),
]

function text(value: number | undefined, suffix: string, decimals = 1): { text: string } {
	return { text: value === undefined ? '--' : `${value.toFixed(decimals)}${suffix}` }
}

function meterValue(levels: number[] | undefined, stem: unknown): number | undefined {
	if (!levels || levels.length === 0) return undefined
	if (stem === 'max') return Math.max(...levels)
	return levels[Number(stem) - 1]
}

function meterStyle(level: number | undefined): { text: string; bgcolor?: number; color?: number } {
	if (level === undefined) return { text: '--.- dB' }
	const bgcolor = level >= -6 ? combineRgb(255, 0, 0) : level >= -18 ? combineRgb(255, 192, 0) : combineRgb(0, 128, 0)
	return { text: `${level.toFixed(1)} dB`, bgcolor, color: combineRgb(255, 255, 255) }
}

export function getAdditionalFeedbacks(self: ModuleInstance): CompanionFeedbackDefinitions {
	const channelChoices = getChannelChoices(self)
	const busChoices = getMaxBusChoices(self)
	const cameraChoices = getCameraChoices(self)

	return {
		monitor_muted: {
			type: 'boolean',
			name: 'Monitor: Is Muted',
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) },
			options: [{ type: 'dropdown', id: 'monitor', label: 'Monitor', choices: monitorChoices, default: '1' }],
			callback: (feedback) => {
				const monitor = String(feedback.options.monitor)
				self.subscribePath(`/monitor/${monitor}/mute`)
				return self.state.monitors.mutes[monitor] === 1
			},
		},
		monitor_dimmed: {
			type: 'boolean',
			name: 'Monitor: Is Dimmed',
			defaultStyle: { bgcolor: combineRgb(255, 192, 0), color: combineRgb(0, 0, 0) },
			options: [{ type: 'dropdown', id: 'monitor', label: 'Monitor', choices: monitorChoices, default: '1' }],
			callback: (feedback) => {
				const monitor = String(feedback.options.monitor)
				self.subscribePath(`/monitor/${monitor}/dim`)
				return self.state.monitors.dims[monitor] === 1
			},
		},
		monitor_level_text: {
			type: 'advanced',
			name: 'Monitor: Level Text',
			options: [{ type: 'dropdown', id: 'monitor', label: 'Monitor', choices: monitorChoices, default: '1' }],
			callback: (feedback) => {
				const monitor = String(feedback.options.monitor)
				self.subscribePath(`/monitor/${monitor}/level`)
				return text(self.state.monitors.levels[monitor], ' dB')
			},
		},
		channel_pan_text: {
			type: 'advanced',
			name: 'Channel: Pan Text',
			options: [{ type: 'dropdown', id: 'channel', label: 'Channel', choices: channelChoices, default: '1' }],
			callback: (feedback) => {
				const channel = String(feedback.options.channel)
				self.subscribePath(`/channel/${channel}/pan`)
				return text(self.state.channels.pans[channel], '')
			},
		},
		bus_pan_text: {
			type: 'advanced',
			name: 'Bus: Pan Text',
			options: [
				{ type: 'dropdown', id: 'bus_type', label: 'Bus Type', choices: panBusTypes, default: 'sub' },
				{ type: 'dropdown', id: 'bus', label: 'Bus', choices: busChoices, default: '1' },
			],
			callback: (feedback) => {
				const key = `${feedback.options.bus_type}/${feedback.options.bus}`
				self.subscribePath(`/${key}/pan`)
				return text(self.state.buses.pans[key], '')
			},
		},
		channel_send_pan_text: {
			type: 'advanced',
			name: 'Channel: Send Pan Text',
			options: [
				{ type: 'dropdown', id: 'channel', label: 'Channel', choices: channelChoices, default: '1' },
				{ type: 'dropdown', id: 'dest_type', label: 'Destination', choices: sendDestTypes, default: 'aux' },
				{ type: 'dropdown', id: 'dest_bus', label: 'Bus', choices: busChoices, default: '1' },
			],
			callback: (feedback) => {
				const key = `channel/${feedback.options.channel}/${feedback.options.dest_type}/${feedback.options.dest_bus}`
				self.subscribePath(`/${key}/pan`)
				return text(self.state.sends.pans[key], '')
			},
		},
		bus_send_pan_text: {
			type: 'advanced',
			name: 'Bus: Send Pan Text',
			options: [
				{ type: 'dropdown', id: 'src_type', label: 'Source Type', choices: sendSourceTypes, default: 'sub' },
				{ type: 'dropdown', id: 'src_bus', label: 'Source Bus', choices: busChoices, default: '1' },
				{ type: 'dropdown', id: 'dest_type', label: 'Destination', choices: sendDestTypes, default: 'aux' },
				{ type: 'dropdown', id: 'dest_bus', label: 'Destination Bus', choices: busChoices, default: '1' },
			],
			callback: (feedback) => {
				const key = `${feedback.options.src_type}/${feedback.options.src_bus}/${feedback.options.dest_type}/${feedback.options.dest_bus}`
				self.subscribePath(`/${key}/pan`)
				return text(self.state.sends.pans[key], '')
			},
		},
		talkback_input_48v: {
			type: 'boolean',
			name: 'Talkback: Phantom Power Is On',
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) },
			options: [
				{ type: 'dropdown', id: 'talkback', label: 'Talkback Circuit', choices: talkbackChoices, default: '1' },
			],
			callback: (feedback) => self.state.talkback.inputs[`${feedback.options.talkback}/48V`] === 1,
		},
		talkback_input_line: {
			type: 'boolean',
			name: 'Talkback: Line Input Is Selected',
			defaultStyle: { bgcolor: combineRgb(0, 128, 255), color: combineRgb(255, 255, 255) },
			options: [
				{ type: 'dropdown', id: 'talkback', label: 'Talkback Circuit', choices: talkbackChoices, default: '1' },
			],
			callback: (feedback) => self.state.talkback.inputs[`${feedback.options.talkback}/line`] === 1,
		},
		talkback_input_value_text: {
			type: 'advanced',
			name: 'Talkback: Show Input Value',
			options: [
				{ type: 'dropdown', id: 'talkback', label: 'Talkback Circuit', choices: talkbackChoices, default: '1' },
				{
					type: 'dropdown',
					id: 'property',
					label: 'Property',
					default: 'trim',
					choices: [
						{ id: 'trim', label: 'Trim (dB)' },
						{ id: 'mic-gain', label: 'Mic Gain' },
						{ id: 'hpf', label: 'HPF (Hz)' },
						{ id: 'level', label: 'Input Level (dB)' },
					],
				},
			],
			callback: (feedback) => {
				const property = String(feedback.options.property)
				const value = self.state.talkback.inputs[`${feedback.options.talkback}/${property}`]
				return text(value, property === 'hpf' ? ' Hz' : property === 'mic-gain' ? '' : ' dB')
			},
		},
		afv_value_text: {
			type: 'advanced',
			name: 'AFV: Show Timing/Level Value',
			options: [
				{
					type: 'dropdown',
					id: 'property',
					label: 'Property',
					default: 'fade-in-time',
					choices: [
						{ id: 'fade-in-time', label: 'Fade In Time' },
						{ id: 'fade-in-level', label: 'Fade In Level' },
						{ id: 'fade-out-time', label: 'Fade Out Time' },
						{ id: 'fade-out-level', label: 'Fade Out Level' },
						{ id: 'hold-time', label: 'Hold Time' },
					],
				},
			],
			callback: (feedback) => {
				const property = String(feedback.options.property)
				const values: Record<string, number> = {
					'fade-in-time': self.state.afv.fadeInTimeMs,
					'fade-in-level': self.state.afv.fadeInLevelDb,
					'fade-out-time': self.state.afv.fadeOutTimeMs,
					'fade-out-level': self.state.afv.fadeOutLevelDb,
					'hold-time': self.state.afv.holdTimeMs,
				}
				return text(values[property], property.endsWith('time') ? ' ms' : ' dB')
			},
		},
		afv_camera_name_text: {
			type: 'advanced',
			name: 'AFV: Show Camera Name',
			options: [{ type: 'dropdown', id: 'camera', label: 'Camera', choices: cameraChoices, default: '1' }],
			callback: (feedback) => ({
				text: self.state.cameraNames[String(feedback.options.camera)] ?? `Camera ${feedback.options.camera}`,
			}),
		},
		channel_meter_text: {
			type: 'advanced',
			name: 'Meter: Channel Level',
			options: [
				{ type: 'dropdown', id: 'channel', label: 'Channel', choices: channelChoices, default: '1' },
				{ type: 'dropdown', id: 'stem', label: 'Stem', choices: stemChoices, default: 'max' },
			],
			callback: (feedback) => {
				const path = `/channel/${feedback.options.channel}/meter`
				self.subscribeMeterPath(path)
				return meterStyle(meterValue(self.state.meters[path], feedback.options.stem))
			},
		},
		bus_meter_text: {
			type: 'advanced',
			name: 'Meter: Bus Level',
			options: [
				{ type: 'dropdown', id: 'bus_type', label: 'Bus Type', choices: busTypes, default: 'main' },
				{ type: 'dropdown', id: 'bus', label: 'Bus', choices: busChoices, default: '1' },
				{ type: 'dropdown', id: 'stem', label: 'Stem', choices: stemChoices, default: 'max' },
			],
			callback: (feedback) => {
				const path = `/${feedback.options.bus_type}/${feedback.options.bus}/meter`
				self.subscribeMeterPath(path)
				return meterStyle(meterValue(self.state.meters[path], feedback.options.stem))
			},
		},
		monitor_meter_text: {
			type: 'advanced',
			name: 'Meter: Monitor Level',
			options: [
				{ type: 'dropdown', id: 'monitor', label: 'Monitor', choices: monitorChoices, default: '1' },
				{ type: 'dropdown', id: 'stem', label: 'Stem', choices: stemChoices, default: 'max' },
			],
			callback: (feedback) => {
				const path = `/monitor/${feedback.options.monitor}/meter`
				self.subscribeMeterPath(path)
				return meterStyle(meterValue(self.state.meters[path], feedback.options.stem))
			},
		},
	}
}
