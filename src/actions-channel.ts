import type { CompanionActionDefinitions } from '@companion-module/base'
import { getChannelChoices, getMaxBusChoices } from './choices.js'
import type ModuleInstance from './main.js'

const SEND_DEST_TYPES = [
	{ id: 'aux', label: 'Aux' },
	{ id: 'mixm', label: 'Mix Minus' },
	{ id: 'mtx', label: 'Matrix' },
]

const ENCODER_MODE_OPTION = {
	type: 'dropdown' as const,
	id: 'encoder_mode',
	label: 'Encoder Mode',
	choices: [
		{ id: 'absolute', label: 'Absolute' },
		{ id: 'relative', label: 'Relative' },
	],
	default: 'absolute',
}

export function getChannelActions(self: ModuleInstance): CompanionActionDefinitions {
	const channelChoices = getChannelChoices(self)
	const busChoices = getMaxBusChoices(self, ['aux', 'mixm', 'mtx'])

	const sendDestChoices = SEND_DEST_TYPES.map((t) => ({ id: t.id, label: t.label }))

	return {
		channel_pan: {
			name: 'Channel: Pan',
			options: [
				{ type: 'dropdown', id: 'channel', label: 'Channel', choices: channelChoices, default: '1' },
				ENCODER_MODE_OPTION,
				{
					type: 'number',
					id: 'pan',
					label: 'Pan / Delta',
					min: -100,
					max: 100,
					default: 0,
					step: 0.1,
				},
			],
			callback: (action) => {
				const path = `/channel/${action.options.channel}/pan`
				self.sendOscFloat(`${path}${self.oscSuffix(action.options.encoder_mode)}`, Number(action.options.pan))
				self.subscribePath(path)
			},
		},
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
				ENCODER_MODE_OPTION,
				{
					type: 'number',
					id: 'level_db',
					label: 'Level / Delta (dB)',
					min: -100,
					max: 10,
					default: 0,
					step: 0.1,
				},
			],
			callback: (action) => {
				const suffix = self.oscSuffix(action.options.encoder_mode)
				self.sendOscFloat(`/channel/${action.options.channel}/level${suffix}`, Number(action.options.level_db))
				self.subscribePath(`/channel/${action.options.channel}/level`)
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
				const path = `/channel/${action.options.channel}/mute`
				self.sendOscInt(path, Number(action.options.state))
				self.subscribePath(path)
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
				ENCODER_MODE_OPTION,
				{
					type: 'number',
					id: 'level_db',
					label: 'Level / Delta (dB)',
					min: -100,
					max: 10,
					default: 0,
					step: 0.1,
				},
			],
			callback: (action) => {
				const suffix = self.oscSuffix(action.options.encoder_mode)
				self.sendOscFloat(
					`/channel/${action.options.channel}/${action.options.dest_type}/${action.options.dest_bus}/level${suffix}`,
					Number(action.options.level_db),
				)
				self.subscribePath(
					`/channel/${action.options.channel}/${action.options.dest_type}/${action.options.dest_bus}/level`,
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
				const path = `/channel/${action.options.channel}/${action.options.dest_type}/${action.options.dest_bus}/mute`
				self.sendOscInt(path, Number(action.options.state))
				self.subscribePath(path)
			},
		},

		channel_send_pan: {
			name: 'Channel: Send Pan',
			options: [
				{ type: 'dropdown', id: 'channel', label: 'Channel', choices: channelChoices, default: '1' },
				{ type: 'dropdown', id: 'dest_type', label: 'Send Destination', choices: sendDestChoices, default: 'aux' },
				{ type: 'dropdown', id: 'dest_bus', label: 'Bus', choices: busChoices, default: '1' },
				ENCODER_MODE_OPTION,
				{ type: 'number', id: 'pan', label: 'Pan / Delta', min: -100, max: 100, default: 0, step: 0.1 },
			],
			callback: (action) => {
				const path = `/channel/${action.options.channel}/${action.options.dest_type}/${action.options.dest_bus}/pan`
				self.sendOscFloat(`${path}${self.oscSuffix(action.options.encoder_mode)}`, Number(action.options.pan))
				self.subscribePath(path)
			},
		},
	}
}
