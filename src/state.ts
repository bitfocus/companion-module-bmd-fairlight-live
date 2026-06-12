import { DEFAULT_NUM_BUSES, DEFAULT_NUM_CAMERAS, DEFAULT_NUM_CHANNELS } from './config.js'

export interface MixerCounts {
	channel: number
	main: number
	sub: number
	aux: number
	mixm: number
	mtx: number
	camera: number
}

export interface CuePlayerState {
	bank: 'A' | 'B'
	midi: boolean
	bankPressTime: number | null
	midiPressTime: number | null
}

export interface TalkbackPressState {
	pressTime: number
	sentState: number
}

export interface FairlightState {
	mixer: MixerCounts
	system: {
		onAir: number
	}
	afv: {
		on: number
		program: number
		preview: number
		fadeInTimeMs: number
		fadeInLevelDb: number
		fadeOutTimeMs: number
		fadeOutLevelDb: number
		holdTimeMs: number
	}
	talkback: {
		groups: Record<string, number> // key: "T/G" -> on/off
		channels: Record<string, number> // key: "T/C" -> on/off
		buses: Record<string, number> // key: "T/type/B" -> on/off
		monitors: Record<string, number> // key: "T/M" -> on/off
		inputs: Record<string, number> // key: "T/property" -> current value
	}
	channels: {
		levels: Record<string, number> // key: "N" -> dB
		mutes: Record<string, number> // key: "N" -> 0/1
		pans: Record<string, number> // key: "N" -> -100..100
	}
	buses: {
		levels: Record<string, number> // key: "type/N" -> dB
		mutes: Record<string, number> // key: "type/N" -> 0/1
		pans: Record<string, number> // key: "type/N" -> -100..100
	}
	sends: {
		levels: Record<string, number> // key: "srcType/srcN/destType/destN" -> dB
		mutes: Record<string, number> // key: "srcType/srcN/destType/destN" -> 0/1
		pans: Record<string, number> // key: "srcType/srcN/destType/destN" -> -100..100
	}
	monitors: {
		levels: Record<string, number>
		mutes: Record<string, number>
		dims: Record<string, number>
	}
	meters: Record<string, number[]> // key: OSC meter path -> stem levels in dB
	cameraNames: Record<string, string>
	cuePlayer: CuePlayerState
	talkbackPress: Record<string, TalkbackPressState>
}

export function createDefaultState(): FairlightState {
	return {
		mixer: {
			channel: DEFAULT_NUM_CHANNELS,
			main: DEFAULT_NUM_BUSES,
			sub: DEFAULT_NUM_BUSES,
			aux: DEFAULT_NUM_BUSES,
			mixm: DEFAULT_NUM_BUSES,
			mtx: DEFAULT_NUM_BUSES,
			camera: DEFAULT_NUM_CAMERAS,
		},
		system: {
			onAir: 0,
		},
		afv: {
			on: 0,
			program: 0,
			preview: 0,
			fadeInTimeMs: 500,
			fadeInLevelDb: 0,
			fadeOutTimeMs: 500,
			fadeOutLevelDb: -100,
			holdTimeMs: 0,
		},
		talkback: {
			groups: {},
			channels: {},
			buses: {},
			monitors: {},
			inputs: {},
		},
		channels: {
			levels: {},
			mutes: {},
			pans: {},
		},
		buses: {
			levels: {},
			mutes: {},
			pans: {},
		},
		sends: {
			levels: {},
			mutes: {},
			pans: {},
		},
		monitors: {
			levels: {},
			mutes: {},
			dims: {},
		},
		meters: {},
		cameraNames: {},
		cuePlayer: {
			bank: 'A',
			midi: false,
			bankPressTime: null,
			midiPressTime: null,
		},
		talkbackPress: {},
	}
}
