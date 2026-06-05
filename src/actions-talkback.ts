import type { CompanionActionDefinitions } from '@companion-module/base'
import { NUM_TALKBACK, NUM_CHANNELS, NUM_BUSES } from './config.js'
import type ModuleInstance from './main.js'

const MOMENTARY_THRESHOLD_MS = 300

export function getTalkbackActions(self: ModuleInstance): CompanionActionDefinitions {
	const talkbackChoices = []
	for (let i = 1; i <= NUM_TALKBACK; i++) {
		const label = i === 1 ? `${i} (Console Operator)` : `${i}`
		talkbackChoices.push({ id: String(i), label })
	}

	const channelChoices = []
	for (let i = 1; i <= NUM_CHANNELS; i++) {
		channelChoices.push({ id: String(i), label: `Channel ${i}` })
	}

	const busChoices = []
	for (let i = 1; i <= NUM_BUSES; i++) {
		busChoices.push({ id: String(i), label: `Bus ${i}` })
	}

	const busTypeChoices = [
		{ id: 'sub', label: 'Sub' },
		{ id: 'aux', label: 'Aux' },
		{ id: 'mixm', label: 'Mix Minus' },
	]

	const groupChoices = [
		{ id: '1', label: 'Group 1' },
		{ id: '2', label: 'Group 2' },
		{ id: '3', label: 'Group 3' },
		{ id: '4', label: 'Group 4' },
	]

	const monitorChoices = [
		{ id: '1', label: 'Monitor 1' },
		{ id: '2', label: 'Monitor 2' },
		{ id: '3', label: 'Monitor 3' },
		{ id: '4', label: 'Monitor 4' },
	]

	return {
		talkback_group: {
			name: 'Talkback: Talk to Group',
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
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					choices: [
						{ id: '1', label: 'On' },
						{ id: '0', label: 'Off' },
					],
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt(
					`/talkback/${action.options.talkback}/group/${action.options.group}`,
					Number(action.options.state),
				)
			},
		},

		talkback_channel: {
			name: 'Talkback: Talk to Channel',
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
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					choices: [
						{ id: '1', label: 'On' },
						{ id: '0', label: 'Off' },
					],
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt(
					`/talkback/${action.options.talkback}/channel/${action.options.channel}`,
					Number(action.options.state),
				)
			},
		},

		talkback_bus: {
			name: 'Talkback: Talk to Bus',
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
					choices: busTypeChoices,
					default: 'aux',
				},
				{
					type: 'dropdown',
					id: 'bus',
					label: 'Bus',
					choices: busChoices,
					default: '1',
				},
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					choices: [
						{ id: '1', label: 'On' },
						{ id: '0', label: 'Off' },
					],
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt(
					`/talkback/${action.options.talkback}/${action.options.bus_type}/${action.options.bus}`,
					Number(action.options.state),
				)
			},
		},

		talkback_monitor: {
			name: 'Talkback: Talk to Monitor',
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
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					choices: [
						{ id: '1', label: 'On' },
						{ id: '0', label: 'Off' },
					],
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt(
					`/talkback/${action.options.talkback}/monitor/${action.options.monitor}`,
					Number(action.options.state),
				)
			},
		},

		talkback_input_trim: {
			name: 'Talkback: Input Trim',
			options: [
				{
					type: 'dropdown',
					id: 'talkback',
					label: 'Talkback Circuit',
					choices: talkbackChoices,
					default: '1',
				},
				{
					type: 'number',
					id: 'trim_db',
					label: 'Trim (dB)',
					min: -10,
					max: 30,
					default: 0,
					step: 0.1,
				},
			],
			callback: (action) => {
				self.sendOscFloat(`/talkback/${action.options.talkback}/input/trim`, Number(action.options.trim_db))
			},
		},

		talkback_input_mic_gain: {
			name: 'Talkback: Mic Gain',
			options: [
				{
					type: 'dropdown',
					id: 'talkback',
					label: 'Talkback Circuit',
					choices: talkbackChoices,
					default: '1',
				},
				{
					type: 'number',
					id: 'gain',
					label: 'Gain',
					min: 0,
					max: 100,
					default: 50,
					step: 0.1,
				},
			],
			callback: (action) => {
				self.sendOscFloat(`/talkback/${action.options.talkback}/input/mic-gain`, Number(action.options.gain))
			},
		},

		talkback_input_48v: {
			name: 'Talkback: Phantom Power (48V)',
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
					id: 'state',
					label: 'State',
					choices: [
						{ id: '1', label: 'On' },
						{ id: '0', label: 'Off' },
					],
					default: '0',
				},
			],
			callback: (action) => {
				self.sendOscInt(`/talkback/${action.options.talkback}/input/48V`, Number(action.options.state))
			},
		},

		talkback_input_line: {
			name: 'Talkback: Input Select (Mic/Line)',
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
					id: 'input',
					label: 'Input',
					choices: [
						{ id: '0', label: 'Mic' },
						{ id: '1', label: 'Line' },
					],
					default: '0',
				},
			],
			callback: (action) => {
				self.sendOscInt(`/talkback/${action.options.talkback}/input/line`, Number(action.options.input))
			},
		},

		talkback_input_hpf: {
			name: 'Talkback: High Pass Filter',
			options: [
				{
					type: 'dropdown',
					id: 'talkback',
					label: 'Talkback Circuit',
					choices: talkbackChoices,
					default: '1',
				},
				{
					type: 'number',
					id: 'freq',
					label: 'Frequency (Hz)',
					min: 100,
					max: 1000,
					default: 100,
					step: 1,
				},
			],
			callback: (action) => {
				self.sendOscFloat(`/talkback/${action.options.talkback}/input/hpf`, Number(action.options.freq))
			},
		},

		talkback_input_level: {
			name: 'Talkback: Input Level',
			options: [
				{
					type: 'dropdown',
					id: 'talkback',
					label: 'Talkback Circuit',
					choices: talkbackChoices,
					default: '1',
				},
				{
					type: 'number',
					id: 'level_db',
					label: 'Level (dB)',
					min: -100,
					max: 10,
					default: 0,
					step: 0.1,
				},
			],
			callback: (action) => {
				self.sendOscFloat(`/talkback/${action.options.talkback}/input/level`, Number(action.options.level_db))
			},
		},

		talkback_talk_down: {
			name: 'Talkback: Talk (Press)',
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
					id: 'target_type',
					label: 'Target Type',
					choices: [
						{ id: 'group', label: 'Group' },
						{ id: 'channel', label: 'Channel' },
						{ id: 'monitor', label: 'Monitor' },
						{ id: 'sub', label: 'Sub' },
						{ id: 'aux', label: 'Aux' },
						{ id: 'mixm', label: 'Mix Minus' },
					],
					default: 'group',
				},
				{
					type: 'textinput',
					id: 'target',
					label: 'Target Number',
					default: '1',
				},
			],
			callback: (action) => {
				const tb = action.options.talkback
				const targetType = action.options.target_type
				const target = action.options.target
				const key = `${tb}/${targetType}/${target}`

				const address = getTalkbackAddress(String(tb), String(targetType), String(target))
				const currentState = getTalkbackCurrentState(self, String(tb), String(targetType), String(target))
				const newState = currentState === 1 ? 0 : 1

				self.sendOscInt(address, newState)
				self.state.talkbackPress[key] = { pressTime: Date.now(), sentState: newState }
			},
		},

		talkback_talk_up: {
			name: 'Talkback: Talk (Release)',
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
					id: 'target_type',
					label: 'Target Type',
					choices: [
						{ id: 'group', label: 'Group' },
						{ id: 'channel', label: 'Channel' },
						{ id: 'monitor', label: 'Monitor' },
						{ id: 'sub', label: 'Sub' },
						{ id: 'aux', label: 'Aux' },
						{ id: 'mixm', label: 'Mix Minus' },
					],
					default: 'group',
				},
				{
					type: 'textinput',
					id: 'target',
					label: 'Target Number',
					default: '1',
				},
			],
			callback: (action) => {
				const tb = action.options.talkback
				const targetType = action.options.target_type
				const target = action.options.target
				const key = `${tb}/${targetType}/${target}`

				const press = self.state.talkbackPress[key]
				if (press && Date.now() - press.pressTime > MOMENTARY_THRESHOLD_MS) {
					const address = getTalkbackAddress(String(tb), String(targetType), String(target))
					const revertState = press.sentState === 1 ? 0 : 1
					self.sendOscInt(address, revertState)
				}
				delete self.state.talkbackPress[key]
			},
		},
	}
}

function getTalkbackAddress(talkback: string, targetType: string, target: string): string {
	switch (targetType) {
		case 'group':
			return `/talkback/${talkback}/group/${target}`
		case 'channel':
			return `/talkback/${talkback}/channel/${target}`
		case 'monitor':
			return `/talkback/${talkback}/monitor/${target}`
		default:
			return `/talkback/${talkback}/${targetType}/${target}`
	}
}

function getTalkbackCurrentState(self: ModuleInstance, talkback: string, targetType: string, target: string): number {
	switch (targetType) {
		case 'group':
			return self.state.talkback.groups[`${talkback}/${target}`] ?? 0
		case 'channel':
			return self.state.talkback.channels[`${talkback}/${target}`] ?? 0
		case 'monitor':
			return self.state.talkback.monitors[`${talkback}/${target}`] ?? 0
		default:
			return self.state.talkback.buses[`${talkback}/${targetType}/${target}`] ?? 0
	}
}
