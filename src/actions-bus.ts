import type { CompanionActionDefinitions } from '@companion-module/base'
import { NUM_BUSES } from './config.js'
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
	{ id: 'sub', prefix: 'sub', label: 'Sub' },
	{ id: 'aux', prefix: 'aux', label: 'Aux' },
	{ id: 'mixm', prefix: 'mixm', label: 'Mix Minus' },
]

const SEND_DEST_TYPES = [
	{ id: 'aux', label: 'Aux' },
	{ id: 'mixm', label: 'Mix Minus' },
	{ id: 'mtx', label: 'Matrix' },
]

export function getBusActions(self: ModuleInstance): CompanionActionDefinitions {
	const busChoices = []
	for (let i = 1; i <= NUM_BUSES; i++) {
		busChoices.push({ id: String(i), label: `Bus ${i}` })
	}

	const busTypeChoices = BUS_TYPES.map((bt) => ({ id: bt.id, label: bt.label }))
	const sendSourceChoices = SEND_SOURCE_TYPES.map((bt) => ({ id: bt.id, label: bt.label }))
	const sendDestChoices = SEND_DEST_TYPES.map((t) => ({ id: t.id, label: t.label }))

	return {
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
				const bt = BUS_TYPES.find((b) => b.id === action.options.bus_type)
				if (bt) {
					self.sendOscFloat(`/${bt.prefix}/${action.options.bus}/level`, Number(action.options.level_db))
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
					self.sendOscInt(`/${bt.prefix}/${action.options.bus}/mute`, Number(action.options.state))
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
				const src = SEND_SOURCE_TYPES.find((b) => b.id === action.options.src_type)
				if (src) {
					self.sendOscFloat(
						`/${src.prefix}/${action.options.src_bus}/${action.options.dest_type}/${action.options.dest_bus}/level`,
						Number(action.options.level_db),
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
					self.sendOscInt(
						`/${src.prefix}/${action.options.src_bus}/${action.options.dest_type}/${action.options.dest_bus}/mute`,
						Number(action.options.state),
					)
				}
			},
		},
	}
}
