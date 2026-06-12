import { type SomeCompanionConfigField } from '@companion-module/base'

export const NUM_TALKBACK = 4
export const NUM_MONITORS = 4
export const DEFAULT_NUM_CAMERAS = 32
export const DEFAULT_NUM_CHANNELS = 128
export const DEFAULT_NUM_BUSES = 32
export const NUM_CUE_BANKS = 2
export const NUM_CUES_PER_BANK = 8

export type ModuleConfig = {
	host: string
	port: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			default: '127.0.0.1',
		},
		{
			type: 'number',
			id: 'port',
			label: 'OSC Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 8000,
		},
	]
}
