import type { CompanionActionDefinitions } from '@companion-module/base'
import { NUM_CAMERAS } from './config.js'
import type ModuleInstance from './main.js'

export function getAfvActions(self: ModuleInstance): CompanionActionDefinitions {
	const cameraChoices = []
	for (let i = 1; i <= NUM_CAMERAS; i++) {
		cameraChoices.push({ id: String(i), label: `Camera ${i}` })
	}

	return {
		afv_on: {
			name: 'AFV: Enable/Disable',
			options: [
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
				self.sendOscInt('/afv/on', Number(action.options.state))
			},
		},

		afv_program: {
			name: 'AFV: Set Program Camera',
			options: [
				{
					type: 'dropdown',
					id: 'camera',
					label: 'Camera',
					choices: cameraChoices,
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt('/afv/program', Number(action.options.camera))
			},
		},

		afv_preview: {
			name: 'AFV: Set Preview Camera',
			options: [
				{
					type: 'dropdown',
					id: 'camera',
					label: 'Camera',
					choices: cameraChoices,
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt('/afv/preview', Number(action.options.camera))
			},
		},

		afv_fade_in_time: {
			name: 'AFV: Fade In Time',
			options: [
				{
					type: 'number',
					id: 'time_ms',
					label: 'Time (ms)',
					min: 0,
					max: 2000,
					default: 500,
				},
			],
			callback: (action) => {
				self.sendOscInt('/afv/fade-in/time-ms', Number(action.options.time_ms))
			},
		},

		afv_fade_in_level: {
			name: 'AFV: Fade In Level',
			options: [
				{
					type: 'number',
					id: 'level_db',
					label: 'Level (dB)',
					min: -100,
					max: 0,
					default: 0,
					step: 0.1,
				},
			],
			callback: (action) => {
				self.sendOscFloat('/afv/fade-in/level-db', Number(action.options.level_db))
			},
		},

		afv_fade_out_time: {
			name: 'AFV: Fade Out Time',
			options: [
				{
					type: 'number',
					id: 'time_ms',
					label: 'Time (ms)',
					min: 0,
					max: 2000,
					default: 500,
				},
			],
			callback: (action) => {
				self.sendOscInt('/afv/fade-out/time-ms', Number(action.options.time_ms))
			},
		},

		afv_fade_out_level: {
			name: 'AFV: Fade Out Level',
			options: [
				{
					type: 'number',
					id: 'level_db',
					label: 'Level (dB)',
					min: -100,
					max: 0,
					default: -100,
					step: 0.1,
				},
			],
			callback: (action) => {
				self.sendOscFloat('/afv/fade-out/level-db', Number(action.options.level_db))
			},
		},

		afv_hold_time: {
			name: 'AFV: Hold Time',
			options: [
				{
					type: 'number',
					id: 'time_ms',
					label: 'Time (ms)',
					min: 0,
					max: 1000,
					default: 0,
				},
			],
			callback: (action) => {
				self.sendOscInt('/afv/hold/time-ms', Number(action.options.time_ms))
			},
		},

		afv_toggle: {
			name: 'AFV: Toggle',
			options: [],
			callback: () => {
				const newState = self.state.afv.on === 1 ? 0 : 1
				self.sendOscInt('/afv/on', newState)
			},
		},
	}
}
