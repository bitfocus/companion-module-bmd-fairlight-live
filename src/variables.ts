import type ModuleInstance from './main.js'
import type { MixerBusType } from './choices.js'

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
		{ variableId: 'mixer_onair', name: 'Mixer On Air State' },
		{ variableId: 'afv_on', name: 'AFV Enabled' },
		{ variableId: 'afv_program', name: 'AFV Program Camera' },
		{ variableId: 'afv_preview', name: 'AFV Preview Camera' },
		{ variableId: 'afv_fade_in_time', name: 'AFV Fade In Time (ms)' },
		{ variableId: 'afv_fade_in_level', name: 'AFV Fade In Level (dB)' },
		{ variableId: 'afv_fade_out_time', name: 'AFV Fade Out Time (ms)' },
		{ variableId: 'afv_fade_out_level', name: 'AFV Fade Out Level (dB)' },
		{ variableId: 'afv_hold_time', name: 'AFV Hold Time (ms)' },
	]

	for (let i = 1; i <= self.state.mixer.channel; i++) {
		vars.push({ variableId: `channel_${i}_level`, name: `Channel ${i} Level (dB)` })
		vars.push({ variableId: `channel_${i}_mute`, name: `Channel ${i} Mute` })
	}

	for (const bt of BUS_TYPES) {
		for (let i = 1; i <= self.state.mixer[bt]; i++) {
			vars.push({ variableId: `${bt}_${i}_level`, name: `${BUS_LABELS[bt]} ${i} Level (dB)` })
			vars.push({ variableId: `${bt}_${i}_mute`, name: `${BUS_LABELS[bt]} ${i} Mute` })
		}
	}

	for (let ch = 1; ch <= self.state.mixer.channel; ch++) {
		for (const destType of ['aux', 'mixm', 'mtx'] as const) {
			for (let bus = 1; bus <= self.state.mixer[destType]; bus++) {
				vars.push({
					variableId: `channel_${ch}_${destType}_${bus}_level`,
					name: `Channel ${ch} ${BUS_LABELS[destType]} ${bus} Send Level (dB)`,
				})
				vars.push({
					variableId: `channel_${ch}_${destType}_${bus}_mute`,
					name: `Channel ${ch} ${BUS_LABELS[destType]} ${bus} Send Mute`,
				})
			}
		}
	}

	for (const srcType of ['sub', 'aux', 'mixm'] as MixerBusType[]) {
		for (let srcBus = 1; srcBus <= self.state.mixer[srcType]; srcBus++) {
			for (const destType of ['aux', 'mixm', 'mtx'] as MixerBusType[]) {
				for (let destBus = 1; destBus <= self.state.mixer[destType]; destBus++) {
					vars.push({
						variableId: `${srcType}_${srcBus}_${destType}_${destBus}_level`,
						name: `${BUS_LABELS[srcType]} ${srcBus} ${BUS_LABELS[destType]} ${destBus} Send Level (dB)`,
					})
					vars.push({
						variableId: `${srcType}_${srcBus}_${destType}_${destBus}_mute`,
						name: `${BUS_LABELS[srcType]} ${srcBus} ${BUS_LABELS[destType]} ${destBus} Send Mute`,
					})
				}
			}
		}
	}

	self.setVariableDefinitions(vars)
}
