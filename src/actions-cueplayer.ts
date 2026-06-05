import type { CompanionActionDefinitions } from '@companion-module/base'
import type ModuleInstance from './main.js'

const MOMENTARY_THRESHOLD_MS = 300

export function getCuePlayerActions(self: ModuleInstance): CompanionActionDefinitions {
	const bankChoices = [
		{ id: 'A', label: 'Bank A' },
		{ id: 'B', label: 'Bank B' },
	]

	const cueChoices = []
	for (let i = 1; i <= 8; i++) {
		cueChoices.push({ id: String(i), label: `Cue ${i}` })
	}

	return {
		cueplayer_play: {
			name: 'Cue Player: Play',
			options: [
				{
					type: 'dropdown',
					id: 'bank',
					label: 'Bank',
					choices: bankChoices,
					default: 'A',
				},
				{
					type: 'dropdown',
					id: 'cue',
					label: 'Cue',
					choices: cueChoices,
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt(`/cueplayer/play/${action.options.bank}`, Number(action.options.cue))
			},
		},

		cueplayer_play_selected_bank: {
			name: 'Cue Player: Play (Selected Bank)',
			options: [
				{
					type: 'dropdown',
					id: 'cue',
					label: 'Cue',
					choices: cueChoices,
					default: '1',
				},
			],
			callback: (action) => {
				const bank = self.state.cuePlayer.bank
				const command = self.state.cuePlayer.midi ? 'midi' : 'play'
				self.sendOscInt(`/cueplayer/${command}/${bank}`, Number(action.options.cue))
			},
		},

		cueplayer_bank_down: {
			name: 'Cue Player: Bank Toggle (Press)',
			options: [],
			callback: () => {
				self.state.cuePlayer.bankPressTime = Date.now()
				self.state.cuePlayer.bank = self.state.cuePlayer.bank === 'A' ? 'B' : 'A'
				self.checkFeedbacks('cueplayer_bank')
			},
		},

		cueplayer_bank_up: {
			name: 'Cue Player: Bank Toggle (Release)',
			options: [],
			callback: () => {
				const pressTime = self.state.cuePlayer.bankPressTime
				if (pressTime !== null && Date.now() - pressTime > MOMENTARY_THRESHOLD_MS) {
					self.state.cuePlayer.bank = self.state.cuePlayer.bank === 'A' ? 'B' : 'A'
					self.checkFeedbacks('cueplayer_bank')
				}
				self.state.cuePlayer.bankPressTime = null
			},
		},

		cueplayer_midi_down: {
			name: 'Cue Player: MIDI (Press)',
			options: [],
			callback: () => {
				self.state.cuePlayer.midiPressTime = Date.now()
				self.state.cuePlayer.midi = !self.state.cuePlayer.midi
				self.checkFeedbacks('cueplayer_midi')
			},
		},

		cueplayer_midi_up: {
			name: 'Cue Player: MIDI (Release)',
			options: [],
			callback: () => {
				const pressTime = self.state.cuePlayer.midiPressTime
				if (pressTime !== null && Date.now() - pressTime > MOMENTARY_THRESHOLD_MS) {
					self.state.cuePlayer.midi = !self.state.cuePlayer.midi
					self.checkFeedbacks('cueplayer_midi')
				}
				self.state.cuePlayer.midiPressTime = null
			},
		},

		cueplayer_midi: {
			name: 'Cue Player: MIDI Trigger',
			options: [
				{
					type: 'dropdown',
					id: 'bank',
					label: 'Bank',
					choices: bankChoices,
					default: 'A',
				},
				{
					type: 'dropdown',
					id: 'cue',
					label: 'Trigger',
					choices: cueChoices,
					default: '1',
				},
			],
			callback: (action) => {
				self.sendOscInt(`/cueplayer/midi/${action.options.bank}`, Number(action.options.cue))
			},
		},

		cueplayer_dump: {
			name: 'Cue Player: Dump All Cues',
			options: [],
			callback: () => {
				self.sendOscNoArgs('/cueplayer/dump')
			},
		},
	}
}
