import type { CompanionActionDefinitions } from '@companion-module/base'
import { getCameraChoices } from './choices.js'
import type ModuleInstance from './main.js'

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

export function getAfvActions(self: ModuleInstance): CompanionActionDefinitions {
	const cameraChoices = getCameraChoices(self)

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
				ENCODER_MODE_OPTION,
				{
					type: 'number',
					id: 'time_ms',
					label: 'Time / Delta (ms)',
					min: 0,
					max: 2000,
					default: 500,
				},
			],
			callback: (action) => {
				const suffix = self.oscSuffix(action.options.encoder_mode)
				self.sendOscInt(`/afv/fade-in/time-ms${suffix}`, Number(action.options.time_ms))
				self.subscribePath('/afv/fade-in/time-ms')
			},
		},

		afv_fade_in_level: {
			name: 'AFV: Fade In Level',
			options: [
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
				const suffix = self.oscSuffix(action.options.encoder_mode)
				self.sendOscFloat(`/afv/fade-in/level-db${suffix}`, Number(action.options.level_db))
				self.subscribePath('/afv/fade-in/level-db')
			},
		},

		afv_fade_out_time: {
			name: 'AFV: Fade Out Time',
			options: [
				ENCODER_MODE_OPTION,
				{
					type: 'number',
					id: 'time_ms',
					label: 'Time / Delta (ms)',
					min: 0,
					max: 2000,
					default: 500,
				},
			],
			callback: (action) => {
				const suffix = self.oscSuffix(action.options.encoder_mode)
				self.sendOscInt(`/afv/fade-out/time-ms${suffix}`, Number(action.options.time_ms))
				self.subscribePath('/afv/fade-out/time-ms')
			},
		},

		afv_fade_out_level: {
			name: 'AFV: Fade Out Level',
			options: [
				ENCODER_MODE_OPTION,
				{
					type: 'number',
					id: 'level_db',
					label: 'Level / Delta (dB)',
					min: -100,
					max: 0,
					default: -100,
					step: 0.1,
				},
			],
			callback: (action) => {
				const suffix = self.oscSuffix(action.options.encoder_mode)
				self.sendOscFloat(`/afv/fade-out/level-db${suffix}`, Number(action.options.level_db))
				self.subscribePath('/afv/fade-out/level-db')
			},
		},

		afv_hold_time: {
			name: 'AFV: Hold Time',
			options: [
				ENCODER_MODE_OPTION,
				{
					type: 'number',
					id: 'time_ms',
					label: 'Time / Delta (ms)',
					min: 0,
					max: 1000,
					default: 0,
				},
			],
			callback: (action) => {
				const suffix = self.oscSuffix(action.options.encoder_mode)
				self.sendOscInt(`/afv/hold/time-ms${suffix}`, Number(action.options.time_ms))
				self.subscribePath('/afv/hold/time-ms')
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
