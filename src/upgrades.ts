import type { CompanionStaticUpgradeScript } from '@companion-module/base'
import type { ModuleConfig } from './config.js'

const ACTIONS_NEEDING_ENCODER_MODE = [
	'afv_fade_in_time',
	'afv_fade_in_level',
	'afv_fade_out_time',
	'afv_fade_out_level',
	'afv_hold_time',
	'bus_level',
	'bus_send_level',
	'channel_level',
	'channel_send_level',
	'talkback_input_trim',
	'talkback_input_mic_gain',
	'talkback_input_hpf',
	'talkback_input_level',
]

const AddEncoderMode: CompanionStaticUpgradeScript<ModuleConfig> = function (_context, props) {
	const updatedActions = []

	for (const action of props.actions) {
		if (ACTIONS_NEEDING_ENCODER_MODE.includes(action.actionId) && action.options.encoder_mode === undefined) {
			action.options.encoder_mode = 'absolute'
			updatedActions.push(action)
		}
	}

	return {
		updatedConfig: null,
		updatedActions,
		updatedFeedbacks: [],
	}
}

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	// v1.0.* -> v1.1.0
	AddEncoderMode,
]
