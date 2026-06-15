import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	TCPHelper,
	type SomeCompanionConfigField,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig, NUM_MONITORS, NUM_TALKBACK } from './config.js'
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
import { getMonitorActions } from './actions-monitor.js'
import { getMixerActions } from './actions-mixer.js'
import { getFeedbacks } from './feedbacks.js'
import { getAdditionalFeedbacks } from './feedbacks-additional.js'
import { UpdateVariableDefinitions } from './variables.js'

export default class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig
	private tcp: TCPHelper | null = null
	private oscReceiver: OscReceiver
	private subscribedPaths = new Set<string>()
	private subscribedMeterPaths = new Set<string>()
	private definitionUpdateTimer: NodeJS.Timeout | null = null
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
		if (this.definitionUpdateTimer) clearTimeout(this.definitionUpdateTimer)
		this.tcp?.destroy()
		this.tcp = null
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		if (this.definitionUpdateTimer) {
			clearTimeout(this.definitionUpdateTimer)
			this.definitionUpdateTimer = null
		}
		this.config = config
		this.tcp?.destroy()
		this.tcp = null
		this.state = createDefaultState()
		this.subscribedPaths.clear()
		this.subscribedMeterPaths.clear()
		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()
		this.updateVariableValues()
		this.initTcp()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private updateActions(): void {
		this.setActionDefinitions({
			...getMixerActions(this),
			...getAfvActions(this),
			...getTalkbackActions(this),
			...getCuePlayerActions(this),
			...getChannelActions(this),
			...getBusActions(this),
			...getMonitorActions(this),
		})
	}

	private updateFeedbacks(): void {
		this.setFeedbackDefinitions({ ...getFeedbacks(this), ...getAdditionalFeedbacks(this) })
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
		this.sendOscNoArgs('/connect/mixer')
		this.sendOscNoArgs('/connect/afv')
		for (let i = 1; i <= NUM_TALKBACK; i++) {
			this.sendOscNoArgs(`/connect/talkback/${i}`)
		}
		for (let i = 1; i <= this.state.mixer.main; i++) {
			this.sendOscNoArgs(`/connect/main/${i}/name`)
		}

		for (const path of this.subscribedPaths) {
			this.sendOscNoArgs(`/connect${path}`)
		}
		for (const path of this.subscribedMeterPaths) {
			this.sendOscInt(`/connect${path}`, 50)
		}
	}

	public subscribePath(path: string): void {
		if (!path.startsWith('/')) {
			path = `/${path}`
		}

		if (this.subscribedPaths.has(path)) {
			return
		}

		this.subscribedPaths.add(path)
		this.sendOscNoArgs(`/connect${path}`)
	}

	public subscribeMeterPath(path: string): void {
		if (!path.startsWith('/')) path = `/${path}`
		if (this.subscribedMeterPaths.has(path)) return
		this.subscribedMeterPaths.add(path)
		this.sendOscInt(`/connect${path}`, 50)
	}

	private handleOscMessage(msg: ParsedOscMessage): void {
		const { address, args } = msg

		const countKey = this.getMixerCountKey(address)
		if (countKey && args[0]?.type === 'i') {
			const count = Math.max(0, args[0].value)
			if (this.state.mixer[countKey] !== count) {
				this.state.mixer[countKey] = count
				this.scheduleDefinitionUpdate()
			}
			return
		} else if (address === '/mixer/onair' && args[0]?.type === 'i') {
			this.state.system.onAir = args[0].value
		} else if (address === '/afv/on' && args[0]?.type === 'i') {
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

			const cameraName = address.match(/^\/afv\/camera\/(\d+)\/name$/)
			if (cameraName && args[0]?.type === 's') {
				this.state.cameraNames[cameraName[1]] = args[0].value
				matched = true
			}

			const mainName = address.match(/^\/main\/(\d+)\/name$/)
			if (mainName && args[0]?.type === 's') {
				this.state.mainNames[mainName[1]] = args[0].value
				matched = true
			}

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

			const tbInput = address.match(/^\/talkback\/(\d+)\/input\/(trim|mic-gain|48V|line|hpf|level)$/)
			if (tbInput && (args[0]?.type === 'i' || args[0]?.type === 'f')) {
				this.state.talkback.inputs[`${tbInput[1]}/${tbInput[2]}`] = args[0].value
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

			const chPan = address.match(/^\/channel\/(\d+)\/pan$/)
			if (chPan && args[0]?.type === 'f') {
				this.state.channels.pans[chPan[1]] = args[0].value
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

			const busPan = address.match(/^\/(sub|aux|mixm|mtx)\/(\d+)\/pan$/)
			if (busPan && args[0]?.type === 'f') {
				this.state.buses.pans[`${busPan[1]}/${busPan[2]}`] = args[0].value
				matched = true
			}

			const monitorValue = address.match(/^\/monitor\/(\d+)\/(level|mute|dim)$/)
			if (monitorValue && (args[0]?.type === 'i' || args[0]?.type === 'f')) {
				const [, monitor, property] = monitorValue
				if (property === 'level') this.state.monitors.levels[monitor] = args[0].value
				else if (property === 'mute') this.state.monitors.mutes[monitor] = args[0].value
				else this.state.monitors.dims[monitor] = args[0].value
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

			const chSendPan = address.match(/^\/channel\/(\d+)\/(aux|mixm|mtx)\/(\d+)\/pan$/)
			if (chSendPan && args[0]?.type === 'f') {
				this.state.sends.pans[`channel/${chSendPan[1]}/${chSendPan[2]}/${chSendPan[3]}`] = args[0].value
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

			const busSendPan = address.match(/^\/(sub|aux|mixm)\/(\d+)\/(aux|mixm|mtx)\/(\d+)\/pan$/)
			if (busSendPan && args[0]?.type === 'f') {
				this.state.sends.pans[`${busSendPan[1]}/${busSendPan[2]}/${busSendPan[3]}/${busSendPan[4]}`] = args[0].value
				matched = true
			}

			if (
				/^\/(channel|main|sub|aux|mixm|mtx|monitor)\/\d+\/meter$/.test(address) ||
				/^\/main\/\d+\/integrated$/.test(address) ||
				/^\/monitor\/1\/(integrated|true-peak)$/.test(address)
			) {
				if (args[0]?.type !== 'b') return
				const blob = args[0].value
				if (blob.length >= 2) {
					const count = blob.readUInt16BE(0)
					if (blob.length >= 2 + count * 2) {
						this.state.meters[address] = Array.from({ length: count }, (_, i) => blob.readInt16BE(2 + i * 2) / 10)
						matched = true
					}
				}
			}

			if (!matched) return
		}

		this.updateVariableValues()
		this.checkFeedbacks(
			'mixer_onair',
			'afv_enabled',
			'afv_program_camera',
			'afv_preview_camera',
			'talkback_group_active',
			'talkback_channel_active',
			'talkback_bus_active',
			'talkback_monitor_active',
			'channel_muted',
			'channel_level',
			'channel_level_text',
			'channel_send_muted',
			'channel_send_level',
			'channel_send_level_text',
			'channel_meter',
			'channel_pan_text',
			'channel_send_pan_text',
			'bus_muted',
			'bus_level',
			'bus_level_text',
			'bus_send_muted',
			'bus_send_level',
			'bus_send_level_text',
			'bus_meter',
			'bus_pan_text',
			'bus_send_pan_text',
			'monitor_muted',
			'monitor_dimmed',
			'monitor_level',
			'monitor_level_text',
			'monitor_meter',
			'monitor_integrated',
			'monitor_integrated_text',
			'integrated',
			'integrated_text',
			'true_peak',
			'true_peak_text',
			'talkback_input_48v',
			'talkback_input_line',
			'talkback_input_value_text',
			'afv_value_text',
			'afv_camera_name_text',
		)
	}

	private getMixerCountKey(address: string): keyof FairlightState['mixer'] | null {
		const paths: Record<string, keyof FairlightState['mixer']> = {
			'/mixer/channel/count': 'channel',
			'/mixer/main/count': 'main',
			'/mixer/sub/count': 'sub',
			'/mixer/aux/count': 'aux',
			'/mixer/mixm/count': 'mixm',
			'/mixer/mtx/count': 'mtx',
			'/afv/camera/count': 'camera',
		}
		return paths[address] ?? null
	}

	private scheduleDefinitionUpdate(): void {
		if (this.definitionUpdateTimer) clearTimeout(this.definitionUpdateTimer)
		this.definitionUpdateTimer = setTimeout(() => {
			this.definitionUpdateTimer = null
			this.updateActions()
			this.updateFeedbacks()
			this.updatePresets()
			this.updateVariableDefinitions()
			this.updateVariableValues()
		}, 50)
	}

	private updateVariableValues(): void {
		const formatLevelText = (level: number | undefined, suffix = ' dB'): string =>
			level === undefined
				? `--.-${suffix}`
				: level <= -100
					? `-inf${suffix}`
					: `${level.toFixed(level < -50 ? 0 : 1)}${suffix}`
		const getMeterLevel = (levels: number[] | undefined): number | undefined => {
			if (!levels || levels.length === 0) return undefined
			return Math.max(...levels)
		}
		const cameraName = (index: number | undefined): string => {
			if (!index || index < 1) return '--'
			return this.state.cameraNames[String(index)] ?? `Camera ${index}`
		}
		const mainName = (index: number | undefined): string => {
			if (!index || index < 1) return '--'
			return this.state.mainNames[String(index)] ?? `Main ${index}`
		}

		const values: Record<string, string | undefined> = {
			mixer_onair: this.state.system.onAir ? 'On Air' : 'Off Air',
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
		for (const [ch, pan] of Object.entries(this.state.channels.pans)) {
			values[`channel_${ch}_pan`] = pan.toFixed(1)
		}
		for (let ch = 1; ch <= this.state.mixer.channel; ch++) {
			values[`channel_${ch}_meter_text`] = formatLevelText(getMeterLevel(this.state.meters[`/channel/${ch}/meter`]))
		}

		for (const [key, level] of Object.entries(this.state.buses.levels)) {
			const [type, n] = key.split('/')
			values[`${type}_${n}_level`] = level.toFixed(1)
		}
		for (const [key, mute] of Object.entries(this.state.buses.mutes)) {
			const [type, n] = key.split('/')
			values[`${type}_${n}_mute`] = mute ? 'Muted' : 'On'
		}
		for (const [key, pan] of Object.entries(this.state.buses.pans)) {
			const [type, n] = key.split('/')
			values[`${type}_${n}_pan`] = pan.toFixed(1)
		}
		for (const bt of ['main', 'sub', 'aux', 'mixm', 'mtx'] as const) {
			for (let i = 1; i <= this.state.mixer[bt]; i++) {
				values[`${bt}_${i}_meter_text`] = formatLevelText(getMeterLevel(this.state.meters[`/${bt}/${i}/meter`]))
				if (bt === 'main') {
					values[`main_${i}_name`] = mainName(i)
					values[`main_${i}_integrated_loudness_text`] = formatLevelText(
						getMeterLevel(this.state.meters[`/main/${i}/integrated`]),
						'',
					)
					values[`main_${i}_integrated_loudness_display`] = `${mainName(i)}\n${
						formatLevelText(getMeterLevel(this.state.meters[`/main/${i}/integrated`]), '') ?? '--.-'
					}`
				}
			}
		}

		for (const [key, level] of Object.entries(this.state.sends.levels)) {
			const parts = key.split('/')
			if (parts[0] === 'channel') {
				const [, ch, type, n] = parts
				values[`channel_${ch}_${type}_${n}_level`] = level.toFixed(1)
			} else {
				const [srcType, srcBus, destType, destBus] = parts
				values[`${srcType}_${srcBus}_${destType}_${destBus}_level`] = level.toFixed(1)
			}
		}
		for (const [key, mute] of Object.entries(this.state.sends.mutes)) {
			const parts = key.split('/')
			if (parts[0] === 'channel') {
				const [, ch, type, n] = parts
				values[`channel_${ch}_${type}_${n}_mute`] = mute ? 'Muted' : 'On'
			} else {
				const [srcType, srcBus, destType, destBus] = parts
				values[`${srcType}_${srcBus}_${destType}_${destBus}_mute`] = mute ? 'Muted' : 'On'
			}
		}
		for (const [key, pan] of Object.entries(this.state.sends.pans)) {
			const parts = key.split('/')
			if (parts[0] === 'channel') {
				const [, ch, type, n] = parts
				values[`channel_${ch}_${type}_${n}_pan`] = pan.toFixed(1)
			} else {
				const [srcType, srcBus, destType, destBus] = parts
				values[`${srcType}_${srcBus}_${destType}_${destBus}_pan`] = pan.toFixed(1)
			}
		}

		for (let i = 1; i <= this.state.mixer.camera; i++) {
			values[`camera_${i}_name`] = cameraName(i)
		}
		values.afv_program_camera_name = cameraName(this.state.afv.program)
		values.afv_preview_camera_name = cameraName(this.state.afv.preview)
		for (let i = 1; i <= NUM_MONITORS; i++) {
			values[`monitor_${i}_level`] = this.state.monitors.levels[String(i)]?.toFixed(1)
			values[`monitor_${i}_mute`] = this.state.monitors.mutes[String(i)] ? 'Muted' : 'On'
			values[`monitor_${i}_dim`] = this.state.monitors.dims[String(i)] ? 'Dimmed' : 'Off'
			values[`monitor_${i}_meter_text`] = formatLevelText(getMeterLevel(this.state.meters[`/monitor/${i}/meter`]))
		}
		values.monitor_1_integrated_loudness_text = formatLevelText(
			getMeterLevel(this.state.meters['/monitor/1/integrated']),
			'',
		)
		values.monitor_1_true_peak_text = formatLevelText(getMeterLevel(this.state.meters['/monitor/1/true-peak']))

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

	oscSuffix(mode: unknown): string {
		if (mode === 'relative') {
			return '/relative'
		}
		return ''
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
