import type ModuleInstance from './main.js'

export type MixerBusType = 'main' | 'sub' | 'aux' | 'mixm' | 'mtx'

export function makeNumberChoices(count: number, label: string): { id: string; label: string }[] {
	return Array.from({ length: Math.max(1, count) }, (_, index) => ({
		id: String(index + 1),
		label: `${label} ${index + 1}`,
	}))
}

export function getChannelChoices(self: ModuleInstance): { id: string; label: string }[] {
	return makeNumberChoices(self.state.mixer.channel, 'Channel')
}

export function getCameraChoices(self: ModuleInstance): { id: string; label: string }[] {
	return makeNumberChoices(self.state.mixer.camera, 'Camera')
}

export function getBusChoices(self: ModuleInstance, type: MixerBusType): { id: string; label: string }[] {
	return makeNumberChoices(self.state.mixer[type], 'Bus')
}

export function getMaxBusChoices(
	self: ModuleInstance,
	types: MixerBusType[] = ['main', 'sub', 'aux', 'mixm', 'mtx'],
): {
	id: string
	label: string
}[] {
	return makeNumberChoices(Math.max(0, ...types.map((type) => self.state.mixer[type])), 'Bus')
}
