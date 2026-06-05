import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	TCPHelper,
	type SomeCompanionConfigField,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, NUM_TALKBACK } from './config.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdatePresets } from './presets.js'
import { type OscArg, sendOsc } from './osc.js'
import { OscReceiver, type ParsedOscMessage } from './osc-receiver.js'
import { type FairlightState, createDefaultState } from './state.js'
import { getAfvActions } from './actions-afv.js'
import { getTalkbackActions } from './actions-talkback.js'
import { getCuePlayerActions } from './actions-cueplayer.js'
import { getChannelActions } from './actions-channel.js'
import { getBusActions } from './actions-bus.js'
import { getFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions } from './variables.js'

export default class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig
	private tcp: TCPHelper | null = null
	private oscReceiver: OscReceiver
	state: FairlightState = createDefaultState()

	constructor(internal: unknown) {
		super(internal)
		this.oscReceiver = new OscReceiver((msg) => this.handleOscMessage(msg))
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		this.updateVariableValues()
		this.initTcp()
	}

	async destroy(): Promise<void> {
		this.tcp?.destroy()
		this.tcp = null
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.tcp?.destroy()
		this.tcp = null
		this.state = createDefaultState()
		this.updateActions()
		this.initTcp()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private updateActions(): void {
		this.setActionDefinitions({
			...getAfvActions(this),
			...getTalkbackActions(this),
			...getCuePlayerActions(this),
			...getChannelActions(this),
			...getBusActions(this),
		})
	}

	private updateFeedbacks(): void {
		this.setFeedbackDefinitions(getFeedbacks(this))
	}

	private updatePresets(): void {
		UpdatePresets(this)
	}

	private updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	private initTcp(): void {
		this.tcp = new TCPHelper(this.config.host, this.config.port)

		this.tcp.on('status_change', (status) => {
			this.updateStatus(status)
		})

		this.tcp.on('connect', () => {
			this.updateStatus(InstanceStatus.Ok)
			this.log('info', `Connected to ${this.config.host}:${this.config.port}`)
			this.oscReceiver.reset()
			this.subscribe()
		})

		this.tcp.on('data', (data) => {
			this.oscReceiver.feed(data)
		})

		this.tcp.on('error', (err) => {
			this.updateStatus(InstanceStatus.ConnectionFailure)
			this.log('error', `TCP error: ${err.message}`)
		})
	}

	private subscribe(): void {
		this.sendOscNoArgs('/connect/afv')
		for (let i = 1; i <= NUM_TALKBACK; i++) {
			this.sendOscNoArgs(`/connect/talkback/${i}`)
		}
	}

	private handleOscMessage(msg: ParsedOscMessage): void {
		const { address, args } = msg

		if (address === '/afv/on' && args[0]?.type === 'i') {
			this.state.afv.on = args[0].value
		} else if (address === '/afv/program' && args[0]?.type === 'i') {
			this.state.afv.program = args[0].value
		} else if (address === '/afv/preview' && args[0]?.type === 'i') {
			this.state.afv.preview = args[0].value
		} else if (address === '/afv/fade-in/time-ms' && args[0]?.type === 'i') {
			this.state.afv.fadeInTimeMs = args[0].value
		} else if (address === '/afv/fade-in/level-db' && args[0]?.type === 'f') {
			this.state.afv.fadeInLevelDb = args[0].value
		} else if (address === '/afv/fade-out/time-ms' && args[0]?.type === 'i') {
			this.state.afv.fadeOutTimeMs = args[0].value
		} else if (address === '/afv/fade-out/level-db' && args[0]?.type === 'f') {
			this.state.afv.fadeOutLevelDb = args[0].value
		} else if (address === '/afv/hold/time-ms' && args[0]?.type === 'i') {
			this.state.afv.holdTimeMs = args[0].value
		} else {
			let matched = false

			const tbGroup = address.match(/^\/talkback\/(\d+)\/group\/(\d+)$/)
			if (tbGroup && args[0]?.type === 'i') {
				this.state.talkback.groups[`${tbGroup[1]}/${tbGroup[2]}`] = args[0].value
				matched = true
			}

			const tbCh = address.match(/^\/talkback\/(\d+)\/channel\/(\d+)$/)
			if (tbCh && args[0]?.type === 'i') {
				this.state.talkback.channels[`${tbCh[1]}/${tbCh[2]}`] = args[0].value
				matched = true
			}

			const tbBus = address.match(/^\/talkback\/(\d+)\/(sub|aux|mixm)\/(\d+)$/)
			if (tbBus && args[0]?.type === 'i') {
				this.state.talkback.buses[`${tbBus[1]}/${tbBus[2]}/${tbBus[3]}`] = args[0].value
				matched = true
			}

			const tbMon = address.match(/^\/talkback\/(\d+)\/monitor\/(\d+)$/)
			if (tbMon && args[0]?.type === 'i') {
				this.state.talkback.monitors[`${tbMon[1]}/${tbMon[2]}`] = args[0].value
				matched = true
			}

			const chLevel = address.match(/^\/channel\/(\d+)\/level$/)
			if (chLevel && args[0]?.type === 'f') {
				this.state.channels.levels[chLevel[1]] = args[0].value
				matched = true
			}

			const chMute = address.match(/^\/channel\/(\d+)\/mute$/)
			if (chMute && args[0]?.type === 'i') {
				this.state.channels.mutes[chMute[1]] = args[0].value
				matched = true
			}

			const busLevel = address.match(/^\/(main|sub|aux|mixm|mtx)\/(\d+)\/level$/)
			if (busLevel && args[0]?.type === 'f') {
				this.state.buses.levels[`${busLevel[1]}/${busLevel[2]}`] = args[0].value
				matched = true
			}

			const busMute = address.match(/^\/(main|sub|aux|mixm|mtx)\/(\d+)\/mute$/)
			if (busMute && args[0]?.type === 'i') {
				this.state.buses.mutes[`${busMute[1]}/${busMute[2]}`] = args[0].value
				matched = true
			}

			const chSendLevel = address.match(/^\/channel\/(\d+)\/(aux|mixm|mtx)\/(\d+)\/level$/)
			if (chSendLevel && args[0]?.type === 'f') {
				this.state.sends.levels[`channel/${chSendLevel[1]}/${chSendLevel[2]}/${chSendLevel[3]}`] = args[0].value
				matched = true
			}

			const chSendMute = address.match(/^\/channel\/(\d+)\/(aux|mixm|mtx)\/(\d+)\/mute$/)
			if (chSendMute && args[0]?.type === 'i') {
				this.state.sends.mutes[`channel/${chSendMute[1]}/${chSendMute[2]}/${chSendMute[3]}`] = args[0].value
				matched = true
			}

			const busSendLevel = address.match(/^\/(sub|aux|mixm)\/(\d+)\/(aux|mixm|mtx)\/(\d+)\/level$/)
			if (busSendLevel && args[0]?.type === 'f') {
				this.state.sends.levels[`${busSendLevel[1]}/${busSendLevel[2]}/${busSendLevel[3]}/${busSendLevel[4]}`] =
					args[0].value
				matched = true
			}

			const busSendMute = address.match(/^\/(sub|aux|mixm)\/(\d+)\/(aux|mixm|mtx)\/(\d+)\/mute$/)
			if (busSendMute && args[0]?.type === 'i') {
				this.state.sends.mutes[`${busSendMute[1]}/${busSendMute[2]}/${busSendMute[3]}/${busSendMute[4]}`] =
					args[0].value
				matched = true
			}

			if (!matched) return
		}

		this.updateVariableValues()
		this.checkFeedbacks(
			'afv_enabled',
			'afv_program_camera',
			'afv_preview_camera',
			'talkback_group_active',
			'talkback_channel_active',
			'talkback_bus_active',
			'talkback_monitor_active',
			'channel_muted',
			'bus_muted',
			'channel_send_muted',
			'bus_send_muted',
		)
	}

	private updateVariableValues(): void {
		const values: Record<string, string | undefined> = {
			afv_on: this.state.afv.on ? 'On' : 'Off',
			afv_program: String(this.state.afv.program),
			afv_preview: String(this.state.afv.preview),
			afv_fade_in_time: String(this.state.afv.fadeInTimeMs),
			afv_fade_in_level: this.state.afv.fadeInLevelDb.toFixed(1),
			afv_fade_out_time: String(this.state.afv.fadeOutTimeMs),
			afv_fade_out_level: this.state.afv.fadeOutLevelDb.toFixed(1),
			afv_hold_time: String(this.state.afv.holdTimeMs),
		}

		for (const [ch, level] of Object.entries(this.state.channels.levels)) {
			values[`channel_${ch}_level`] = level.toFixed(1)
		}
		for (const [ch, mute] of Object.entries(this.state.channels.mutes)) {
			values[`channel_${ch}_mute`] = mute ? 'Muted' : 'On'
		}

		for (const [key, level] of Object.entries(this.state.buses.levels)) {
			const [type, n] = key.split('/')
			values[`${type}_${n}_level`] = level.toFixed(1)
		}
		for (const [key, mute] of Object.entries(this.state.buses.mutes)) {
			const [type, n] = key.split('/')
			values[`${type}_${n}_mute`] = mute ? 'Muted' : 'On'
		}

		this.setVariableValues(values)
	}

	sendOscNoArgs(address: string): void {
		if (!this.tcp) return
		void sendOsc(this.tcp, address, [])
	}

	sendOscInt(address: string, value: number): void {
		if (!this.tcp) return
		const args: OscArg[] = [{ type: 'i', value }]
		void sendOsc(this.tcp, address, args)
	}

	sendOscFloat(address: string, value: number): void {
		if (!this.tcp) return
		const args: OscArg[] = [{ type: 'f', value }]
		void sendOsc(this.tcp, address, args)
	}

	sendOscString(address: string, value: string): void {
		if (!this.tcp) return
		const args: OscArg[] = [{ type: 's', value }]
		void sendOsc(this.tcp, address, args)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
