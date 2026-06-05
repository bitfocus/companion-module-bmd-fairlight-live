import type ModuleInstance from './main.js'
import { NUM_CHANNELS, NUM_BUSES } from './config.js'

const BUS_TYPES = ['main', 'sub', 'aux', 'mixm', 'mtx'] as const
const BUS_LABELS: Record<string, string> = {
	main: 'Main',
	sub: 'Sub',
	aux: 'Aux',
	mixm: 'Mix Minus',
	mtx: 'Matrix',
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const vars: { variableId: string; name: string }[] = [
		{ variableId: 'afv_on', name: 'AFV Enabled' },
		{ variableId: 'afv_program', name: 'AFV Program Camera' },
		{ variableId: 'afv_preview', name: 'AFV Preview Camera' },
		{ variableId: 'afv_fade_in_time', name: 'AFV Fade In Time (ms)' },
		{ variableId: 'afv_fade_in_level', name: 'AFV Fade In Level (dB)' },
		{ variableId: 'afv_fade_out_time', name: 'AFV Fade Out Time (ms)' },
		{ variableId: 'afv_fade_out_level', name: 'AFV Fade Out Level (dB)' },
		{ variableId: 'afv_hold_time', name: 'AFV Hold Time (ms)' },
	]

	for (let i = 1; i <= NUM_CHANNELS; i++) {
		vars.push({ variableId: `channel_${i}_level`, name: `Channel ${i} Level (dB)` })
		vars.push({ variableId: `channel_${i}_mute`, name: `Channel ${i} Mute` })
	}

	for (const bt of BUS_TYPES) {
		for (let i = 1; i <= NUM_BUSES; i++) {
			vars.push({ variableId: `${bt}_${i}_level`, name: `${BUS_LABELS[bt]} ${i} Level (dB)` })
			vars.push({ variableId: `${bt}_${i}_mute`, name: `${BUS_LABELS[bt]} ${i} Mute` })
		}
	}

	self.setVariableDefinitions(vars)
}
