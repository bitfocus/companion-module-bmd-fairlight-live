import type { CompanionActionDefinitions } from '@companion-module/base'
import { getMaxBusChoices } from './choices.js'
import type ModuleInstance from './main.js'

type BusType = {
	id: string
	prefix: string
	label: string
}

const BUS_TYPES: BusType[] = [
	{ id: 'main', prefix: 'main', label: 'Main' },
	{ id: 'sub', prefix: 'sub', label: 'Sub' },
	{ id: 'aux', prefix: 'aux', label: 'Aux' },
	{ id: 'mixm', prefix: 'mixm', label: 'Mix Minus' },
	{ id: 'mtx', prefix: 'mtx', label: 'Matrix' },
]

const SEND_SOURCE_TYPES: BusType[] = [
	{ id: 'main', prefix: 'main', label: 'Main' },
	{ id: 'sub', prefix: 'sub', label: 'Sub' },
	{ id: 'aux', prefix: 'aux', label: 'Aux' },
	{ id: 'mixm', prefix: 'mixm', label: 'Mix Minus' },
]

const PAN_BUS_TYPES = BUS_TYPES.filter((bus) => bus.id !== 'main')

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

export function getBusActions(self: ModuleInstance): CompanionActionDefinitions {
	const busChoices = getMaxBusChoices(self)

	const busTypeChoices = BUS_TYPES.map((bt) => ({ id: bt.id, label: bt.label }))
	const sendSourceChoices = SEND_SOURCE_TYPES.map((bt) => ({ id: bt.id, label: bt.label }))
	const sendDestChoices = SEND_DEST_TYPES.map((t) => ({ id: t.id, label: t.label }))

	return {
		bus_pan: {
			name: 'Bus: Pan',
			options: [
				{ type: 'dropdown', id: 'bus_type', label: 'Bus Type', choices: PAN_BUS_TYPES, default: 'sub' },
				{ type: 'dropdown', id: 'bus', label: 'Bus', choices: busChoices, default: '1' },
				ENCODER_MODE_OPTION,
				{ type: 'number', id: 'pan', label: 'Pan / Delta', min: -100, max: 100, default: 0, step: 0.1 },
			],
			callback: (action) => {
				const path = `/${action.options.bus_type}/${action.options.bus}/pan`
				self.sendOscFloat(`${path}${self.oscSuffix(action.options.encoder_mode)}`, Number(action.options.pan))
				self.subscribePath(path)
			},
		},
		bus_level: {
			name: 'Bus: Level',
			options: [
				{
					type: 'dropdown',
					id: 'bus_type',
					label: 'Bus Type',
					choices: busTypeChoices,
					default: 'main',
				},
				{
					type: 'dropdown',
					id: 'bus',
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
				const bt = BUS_TYPES.find((b) => b.id === action.options.bus_type)
				if (bt) {
					const suffix = self.oscSuffix(action.options.encoder_mode)
					self.sendOscFloat(`/${bt.prefix}/${action.options.bus}/level${suffix}`, Number(action.options.level_db))
					self.subscribePath(`/${bt.prefix}/${action.options.bus}/level`)
				}
			},
		},

		bus_mute: {
			name: 'Bus: Mute',
			options: [
				{
					type: 'dropdown',
					id: 'bus_type',
					label: 'Bus Type',
					choices: busTypeChoices,
					default: 'main',
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
						{ id: '1', label: 'Mute' },
						{ id: '0', label: 'Unmute' },
					],
					default: '1',
				},
			],
			callback: (action) => {
				const bt = BUS_TYPES.find((b) => b.id === action.options.bus_type)
				if (bt) {
					const path = `/${bt.prefix}/${action.options.bus}/mute`
					self.sendOscInt(path, Number(action.options.state))
					self.subscribePath(path)
				}
			},
		},

		bus_send_level: {
			name: 'Bus: Send Level',
			options: [
				{
					type: 'dropdown',
					id: 'src_type',
					label: 'Source Bus Type',
					choices: sendSourceChoices,
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
					choices: sendDestChoices,
					default: 'aux',
				},
				{
					type: 'dropdown',
					id: 'dest_bus',
					label: 'Destination Bus',
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
				const src = SEND_SOURCE_TYPES.find((b) => b.id === action.options.src_type)
				if (src) {
					const suffix = self.oscSuffix(action.options.encoder_mode)
					self.sendOscFloat(
						`/${src.prefix}/${action.options.src_bus}/${action.options.dest_type}/${action.options.dest_bus}/level${suffix}`,
						Number(action.options.level_db),
					)
					self.subscribePath(
						`/${src.prefix}/${action.options.src_bus}/${action.options.dest_type}/${action.options.dest_bus}/level`,
					)
				}
			},
		},

		bus_send_mute: {
			name: 'Bus: Send Mute',
			options: [
				{
					type: 'dropdown',
					id: 'src_type',
					label: 'Source Bus Type',
					choices: sendSourceChoices,
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
					choices: sendDestChoices,
					default: 'aux',
				},
				{
					type: 'dropdown',
					id: 'dest_bus',
					label: 'Destination Bus',
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
				const src = SEND_SOURCE_TYPES.find((b) => b.id === action.options.src_type)
				if (src) {
					const path = `/${src.prefix}/${action.options.src_bus}/${action.options.dest_type}/${action.options.dest_bus}/mute`
					self.sendOscInt(path, Number(action.options.state))
					self.subscribePath(path)
				}
			},
		},

		bus_send_pan: {
			name: 'Bus: Send Pan',
			options: [
				{ type: 'dropdown', id: 'src_type', label: 'Source Bus Type', choices: sendSourceChoices, default: 'sub' },
				{ type: 'dropdown', id: 'src_bus', label: 'Source Bus', choices: busChoices, default: '1' },
				{ type: 'dropdown', id: 'dest_type', label: 'Send Destination', choices: sendDestChoices, default: 'aux' },
				{ type: 'dropdown', id: 'dest_bus', label: 'Destination Bus', choices: busChoices, default: '1' },
				ENCODER_MODE_OPTION,
				{ type: 'number', id: 'pan', label: 'Pan / Delta', min: -100, max: 100, default: 0, step: 0.1 },
			],
			callback: (action) => {
				const path = `/${action.options.src_type}/${action.options.src_bus}/${action.options.dest_type}/${action.options.dest_bus}/pan`
				self.sendOscFloat(`${path}${self.oscSuffix(action.options.encoder_mode)}`, Number(action.options.pan))
				self.subscribePath(path)
			},
		},
	}
}
