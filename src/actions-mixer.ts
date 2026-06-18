import type { CompanionActionDefinitions } from '@companion-module/base'
import type ModuleInstance from './main.js'

export function getMixerActions(self: ModuleInstance): CompanionActionDefinitions {
	return {
		mixer_onair: {
			name: 'Mixer: Set On Air',
			options: [
				{
					type: 'dropdown',
					id: 'state',
					label: 'State',
					choices: [
						{ id: '1', label: 'On Air' },
						{ id: '0', label: 'Off Air' },
					],
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt('/mixer/onair', Number(action.options.state))
			},
		},
		mixer_reset_loudness: {
			name: 'Loudness: Reset',
			options: [],
			callback: () => {
				self.sendOscNoArgs('/mixer/loudness/reset')
			},
		},
	}
}
