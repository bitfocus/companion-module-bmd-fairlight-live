import type ModuleInstance from './main.js'
import type { MixerBusType } from './choices.js'
import { NUM_MONITORS } from './config.js'

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
		vars.push({ variableId: `channel_${i}_pan`, name: `Channel ${i} Pan` })
		vars.push({ variableId: `channel_${i}_meter_text`, name: `Channel ${i} Meter Text` })
	}

	for (const bt of BUS_TYPES) {
		for (let i = 1; i <= self.state.mixer[bt]; i++) {
			vars.push({ variableId: `${bt}_${i}_level`, name: `${BUS_LABELS[bt]} ${i} Level (dB)` })
			vars.push({ variableId: `${bt}_${i}_mute`, name: `${BUS_LABELS[bt]} ${i} Mute` })
			vars.push({ variableId: `${bt}_${i}_pan`, name: `${BUS_LABELS[bt]} ${i} Pan` })
			vars.push({ variableId: `${bt}_${i}_meter_text`, name: `${BUS_LABELS[bt]} ${i} Meter Text` })
			if (bt === 'main') {
				vars.push({ variableId: `main_${i}_name`, name: `Main ${i} Name` })
				vars.push({
					variableId: `main_${i}_integrated_loudness_text`,
					name: `Main ${i} Integrated Loudness Text`,
				})
			}
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
				vars.push({
					variableId: `channel_${ch}_${destType}_${bus}_pan`,
					name: `Channel ${ch} ${BUS_LABELS[destType]} ${bus} Send Pan`,
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
					vars.push({
						variableId: `${srcType}_${srcBus}_${destType}_${destBus}_pan`,
						name: `${BUS_LABELS[srcType]} ${srcBus} ${BUS_LABELS[destType]} ${destBus} Send Pan`,
					})
				}
			}
		}
	}

	for (let i = 1; i <= self.state.mixer.camera; i++) {
		vars.push({ variableId: `camera_${i}_name`, name: `Camera ${i} Name` })
	}

	vars.push({ variableId: 'afv_program_camera_name', name: 'AFV Program Camera Name' })
	vars.push({ variableId: 'afv_preview_camera_name', name: 'AFV Preview Camera Name' })
	vars.push({
		variableId: 'monitor_1_integrated_loudness_display',
		name: 'Monitor 1 Integrated Loudness Display',
	})
	vars.push({
		variableId: 'main_1_integrated_loudness_display',
		name: 'Main 1 Integrated Loudness Display',
	})
	for (let i = 1; i <= NUM_MONITORS; i++) {
		vars.push({ variableId: `monitor_${i}_level`, name: `Monitor ${i} Level (dB)` })
		vars.push({ variableId: `monitor_${i}_mute`, name: `Monitor ${i} Mute` })
		vars.push({ variableId: `monitor_${i}_dim`, name: `Monitor ${i} Dim` })
		vars.push({ variableId: `monitor_${i}_meter_text`, name: `Monitor ${i} Meter Text` })
	}
	vars.push({ variableId: 'monitor_1_integrated_loudness_text', name: 'Monitor 1 Integrated Loudness Text' })
	vars.push({ variableId: 'monitor_1_true_peak_text', name: 'Monitor 1 True-Peak Text' })

	self.setVariableDefinitions(vars)
}
