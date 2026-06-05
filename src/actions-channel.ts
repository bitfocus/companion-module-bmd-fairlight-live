import type { CompanionActionDefinitions } from '@companion-module/base'
import { NUM_CHANNELS, NUM_BUSES } from './config.js'
import type ModuleInstance from './main.js'

const SEND_DEST_TYPES = [
	{ id: 'aux', label: 'Aux' },
	{ id: 'mixm', label: 'Mix Minus' },
	{ id: 'mtx', label: 'Matrix' },
]

export function getChannelActions(self: ModuleInstance): CompanionActionDefinitions {
	const channelChoices = []
	for (let i = 1; i <= NUM_CHANNELS; i++) {
		channelChoices.push({ id: String(i), label: `Channel ${i}` })
	}

	const busChoices = []
	for (let i = 1; i <= NUM_BUSES; i++) {
		busChoices.push({ id: String(i), label: `Bus ${i}` })
	}

	const sendDestChoices = SEND_DEST_TYPES.map((t) => ({ id: t.id, label: t.label }))

	return {
		channel_level: {
			name: 'Channel: Level',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: channelChoices,
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
				self.sendOscFloat(`/channel/${action.options.channel}/level`, Number(action.options.level_db))
			},
		},

		channel_mute: {
			name: 'Channel: Mute',
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
					id: 'state',
					label: 'State',
					choices: [
						{ id: '1', label: 'Mute' },
						{ id: '0', label: 'Unmute' },
					],
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt(`/channel/${action.options.channel}/mute`, Number(action.options.state))
			},
		},

		channel_send_level: {
			name: 'Channel: Send Level',
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
					choices: sendDestChoices,
					default: 'aux',
				},
				{
					type: 'dropdown',
					id: 'dest_bus',
					label: 'Bus',
					choices: busChoices,
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
				self.sendOscFloat(
					`/channel/${action.options.channel}/${action.options.dest_type}/${action.options.dest_bus}/level`,
					Number(action.options.level_db),
				)
			},
		},

		channel_send_mute: {
			name: 'Channel: Send Mute',
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
					choices: sendDestChoices,
					default: 'aux',
				},
				{
					type: 'dropdown',
					id: 'dest_bus',
					label: 'Bus',
					choices: busChoices,
					default: '1',
				},
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					choices: [
						{ id: '1', label: 'Mute' },
						{ id: '0', label: 'Unmute' },
					],
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt(
					`/channel/${action.options.channel}/${action.options.dest_type}/${action.options.dest_bus}/mute`,
					Number(action.options.state),
				)
			},
		},
	}
}
