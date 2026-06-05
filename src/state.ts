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
	}
	channels: {
		levels: Record<string, number> // key: "N" -> dB
		mutes: Record<string, number> // key: "N" -> 0/1
	}
	buses: {
		levels: Record<string, number> // key: "type/N" -> dB
		mutes: Record<string, number> // key: "type/N" -> 0/1
	}
	sends: {
		levels: Record<string, number> // key: "srcType/srcN/destType/destN" -> dB
		mutes: Record<string, number> // key: "srcType/srcN/destType/destN" -> 0/1
	}
	cuePlayer: CuePlayerState
	talkbackPress: Record<string, TalkbackPressState>
}

export function createDefaultState(): FairlightState {
	return {
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
		},
		channels: {
			levels: {},
			mutes: {},
		},
		buses: {
			levels: {},
			mutes: {},
		},
		sends: {
			levels: {},
			mutes: {},
		},
		cuePlayer: {
			bank: 'A',
			midi: false,
			bankPressTime: null,
			midiPressTime: null,
		},
		talkbackPress: {},
	}
}
