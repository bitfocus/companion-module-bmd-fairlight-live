import { combineRgb, type CompanionFeedbackDefinitions } from '@companion-module/base'
import { NUM_MONITORS, NUM_TALKBACK } from './config.js'
import { getBusChoices, getCameraChoices, getChannelChoices, getMaxBusChoices } from './choices.js'
import { compareNumber, NumberComparitor, NumberComparitorPicker } from './comparitor.js'
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
function text(value: number | undefined, suffix: string, decimals = 1): { text: string } {
	if (value === undefined) return { text: '--' }
	if (value <= -100) return { text: `-inf${suffix}` }
	return { text: `${value.toFixed(value < -50 ? 0 : decimals)}${suffix}` }
}

function meterValue(levels: number[] | undefined): number | undefined {
	if (!levels || levels.length === 0) return undefined
	return Math.max(...levels)
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

const METER_COMPARISON_OPTION = { ...LEVEL_COMPARISON_OPTION, label: 'Meter Level' }
const INTEGRATED_COMPARISON_OPTION = {
	...METER_COMPARISON_OPTION,
	label: 'Integrated Level',
	min: -100,
	max: 18,
}
const TRUE_PEAK_COMPARISON_OPTION = {
	...METER_COMPARISON_OPTION,
	label: 'True-Peak Level',
	min: -60,
	max: 0,
}
const MONITOR_LEVEL_COMPARISON_OPTION = {
	...LEVEL_COMPARISON_OPTION,
	label: 'Meter Level',
	max: 0,
}
const LEVEL_COMPARISON_STYLE = { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) }

export function getAdditionalFeedbacks(self: ModuleInstance): CompanionFeedbackDefinitions {
	const channelChoices = getChannelChoices(self)
	const busChoices = getMaxBusChoices(self)
	const cameraChoices = getCameraChoices(self)
	const integratedChoices = [
		...getBusChoices(self, 'main').map((choice) => ({
			id: `/main/${choice.id}/integrated`,
			label: `Main ${choice.id}`,
		})),
	]

	return {
		monitor_muted: {
			type: 'boolean',
			name: 'Monitor: Muted',
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
			name: 'Monitor: Dimmed',
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
				return text(self.state.monitors.levels[monitor], '')
			},
		},
		monitor_level: {
			type: 'boolean',
			name: 'Monitor: Level',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [
				{ type: 'dropdown', id: 'monitor', label: 'Monitor', choices: monitorChoices, default: '1' },
				NumberComparitorPicker(),
				MONITOR_LEVEL_COMPARISON_OPTION,
			],
			callback: (feedback) => {
				const monitor = String(feedback.options.monitor)
				self.subscribePath(`/monitor/${monitor}/level`)
				const level = self.state.monitors.levels[monitor]
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: (feedback) => {
				const level = self.state.monitors.levels[String(feedback.options.monitor)]
				return level === undefined ? undefined : { level }
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
			name: 'Talkback: Phantom Power On',
			defaultStyle: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) },
			options: [
				{ type: 'dropdown', id: 'talkback', label: 'Talkback Circuit', choices: talkbackChoices, default: '1' },
			],
			callback: (feedback) => self.state.talkback.inputs[`${feedback.options.talkback}/48V`] === 1,
		},
		talkback_input_line: {
			type: 'boolean',
			name: 'Talkback: Line',
			defaultStyle: { bgcolor: combineRgb(0, 128, 255), color: combineRgb(255, 255, 255) },
			options: [
				{ type: 'dropdown', id: 'talkback', label: 'Talkback Circuit', choices: talkbackChoices, default: '1' },
			],
			callback: (feedback) => self.state.talkback.inputs[`${feedback.options.talkback}/line`] === 1,
		},
		talkback_input_value_text: {
			type: 'advanced',
			name: 'Talkback: Input Text',
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
			name: 'AFV: Timing/Level Text',
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
			name: 'AFV: Camera Name',
			options: [{ type: 'dropdown', id: 'camera', label: 'Camera', choices: cameraChoices, default: '1' }],
			callback: (feedback) => ({
				text: self.state.cameraNames[String(feedback.options.camera)] ?? `Camera ${feedback.options.camera}`,
			}),
		},
		channel_meter: {
			type: 'boolean',
			name: 'Channel: Meter',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [
				{ type: 'dropdown', id: 'channel', label: 'Channel', choices: channelChoices, default: '1' },
				NumberComparitorPicker(),
				METER_COMPARISON_OPTION,
			],
			callback: (feedback) => {
				const path = `/channel/${feedback.options.channel}/meter`
				self.subscribeMeterPath(path)
				const level = meterValue(self.state.meters[path])
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: (feedback) => {
				const path = `/channel/${feedback.options.channel}/meter`
				const level = meterValue(self.state.meters[path])
				return level === undefined ? undefined : { level }
			},
		},
		bus_meter: {
			type: 'boolean',
			name: 'Bus: Meter',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [
				{ type: 'dropdown', id: 'bus_type', label: 'Bus Type', choices: busTypes, default: 'main' },
				{ type: 'dropdown', id: 'bus', label: 'Bus', choices: busChoices, default: '1' },
				NumberComparitorPicker(),
				METER_COMPARISON_OPTION,
			],
			callback: (feedback) => {
				const path = `/${feedback.options.bus_type}/${feedback.options.bus}/meter`
				self.subscribeMeterPath(path)
				const level = meterValue(self.state.meters[path])
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: (feedback) => {
				const path = `/${feedback.options.bus_type}/${feedback.options.bus}/meter`
				const level = meterValue(self.state.meters[path])
				return level === undefined ? undefined : { level }
			},
		},
		monitor_meter: {
			type: 'boolean',
			name: 'Monitor: Meter',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [
				{ type: 'dropdown', id: 'monitor', label: 'Monitor', choices: monitorChoices, default: '1' },
				NumberComparitorPicker(),
				METER_COMPARISON_OPTION,
			],
			callback: (feedback) => {
				const path = `/monitor/${feedback.options.monitor}/meter`
				self.subscribeMeterPath(path)
				const level = meterValue(self.state.meters[path])
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: (feedback) => {
				const path = `/monitor/${feedback.options.monitor}/meter`
				const level = meterValue(self.state.meters[path])
				return level === undefined ? undefined : { level }
			},
		},
		integrated: {
			type: 'boolean',
			name: 'Main: Integrated Loudness',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [
				{ type: 'dropdown', id: 'path', label: 'Source', choices: integratedChoices, default: '/main/1/integrated' },
				NumberComparitorPicker(),
				INTEGRATED_COMPARISON_OPTION,
			],
			callback: (feedback) => {
				const path = String(feedback.options.path)
				self.subscribeMeterPath(path)
				self.subscribePath(path.replace(/\/integrated$/, '/name'))
				const level = meterValue(self.state.meters[path])
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: (feedback) => {
				const level = meterValue(self.state.meters[String(feedback.options.path)])
				return level === undefined ? undefined : { level }
			},
		},
		monitor_integrated: {
			type: 'boolean',
			name: 'Monitor: Integrated Loudness',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [NumberComparitorPicker(), INTEGRATED_COMPARISON_OPTION],
			callback: (feedback) => {
				const path = '/monitor/1/integrated'
				self.subscribeMeterPath(path)
				const level = meterValue(self.state.meters[path])
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: () => {
				const level = meterValue(self.state.meters['/monitor/1/integrated'])
				return level === undefined ? undefined : { level }
			},
		},
		integrated_text: {
			type: 'advanced',
			name: 'Main: Integrated Loudness Text',
			options: [
				{ type: 'dropdown', id: 'path', label: 'Source', choices: integratedChoices, default: '/main/1/integrated' },
			],
			callback: (feedback) => {
				const path = String(feedback.options.path)
				self.subscribeMeterPath(path)
				self.subscribePath(path.replace(/\/integrated$/, '/name'))
				return text(meterValue(self.state.meters[path]), '')
			},
		},
		monitor_integrated_text: {
			type: 'advanced',
			name: 'Monitor: Integrated Loudness Text',
			options: [],
			callback: () => {
				const path = '/monitor/1/integrated'
				self.subscribeMeterPath(path)
				return text(meterValue(self.state.meters[path]), '')
			},
		},
		true_peak: {
			type: 'boolean',
			name: 'Monitor: True-Peak',
			defaultStyle: LEVEL_COMPARISON_STYLE,
			options: [NumberComparitorPicker(), TRUE_PEAK_COMPARISON_OPTION],
			callback: (feedback) => {
				const path = '/monitor/1/true-peak'
				self.subscribeMeterPath(path)
				const level = meterValue(self.state.meters[path])
				return (
					level !== undefined &&
					compareNumber(Number(feedback.options.level), feedback.options.comparitor as NumberComparitor, level)
				)
			},
			learn: () => {
				const level = meterValue(self.state.meters['/monitor/1/true-peak'])
				return level === undefined ? undefined : { level }
			},
		},
		true_peak_text: {
			type: 'advanced',
			name: 'Monitor: True-Peak Text',
			options: [],
			callback: () => {
				const path = '/monitor/1/true-peak'
				self.subscribeMeterPath(path)
				return text(meterValue(self.state.meters[path]), '')
			},
		},
	}
}
