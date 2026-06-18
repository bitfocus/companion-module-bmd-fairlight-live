import type { CompanionActionDefinitions } from '@companion-module/base'
import { NUM_MONITORS } from './config.js'
import type ModuleInstance from './main.js'

const MONITOR_CHOICES = Array.from({ length: NUM_MONITORS }, (_, index) => ({
	id: String(index + 1),
	label: `Monitor ${index + 1}`,
}))

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

export function getMonitorActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		monitor_level: {
			name: 'Monitor: Level',
			options: [
				{ type: 'dropdown', id: 'monitor', label: 'Monitor', choices: MONITOR_CHOICES, default: '1' },
				ENCODER_MODE_OPTION,
				{
					type: 'number',
					id: 'level_db',
					label: 'Level / Delta (dB)',
					min: -100,
					max: 0,
					default: 0,
					step: 0.1,
				},
			],
			callback: (action) => {
				const path = `/monitor/${action.options.monitor}/level`
				self.sendOscFloat(`${path}${self.oscSuffix(action.options.encoder_mode)}`, Number(action.options.level_db))
				self.subscribePath(path)
			},
		},
		monitor_mute: {
			name: 'Monitor: Mute',
			options: [
				{ type: 'dropdown', id: 'monitor', label: 'Monitor', choices: MONITOR_CHOICES, default: '1' },
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
				const path = `/monitor/${action.options.monitor}/mute`
				self.sendOscInt(path, Number(action.options.state))
				self.subscribePath(path)
			},
		},
		monitor_dim: {
			name: 'Monitor: Dim',
			options: [
				{ type: 'dropdown', id: 'monitor', label: 'Monitor', choices: MONITOR_CHOICES, default: '1' },
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					choices: [
						{ id: '1', label: 'Dim' },
						{ id: '0', label: 'Normal' },
					],
					default: '1',
				},
			],
			callback: (action) => {
				const path = `/monitor/${action.options.monitor}/dim`
				self.sendOscInt(path, Number(action.options.state))
				self.subscribePath(path)
			},
		},
	}
}
