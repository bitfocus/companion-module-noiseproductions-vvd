import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { VVDApi, type VVDChannel, type VVDSystemStatus, type VVDSceneSlot } from './api.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig
	api!: VVDApi

	// Cached state, updated by polling
	systemStatus: VVDSystemStatus | null = null
	channelStates: Map<number, VVDChannel> = new Map()
	activeSceneSlot: number | null = null
	sceneSlots: VVDSceneSlot[] = []

	get channelMuteStates(): Map<number, boolean> {
		const mutes = new Map<number, boolean>()
		for (const [id, ch] of this.channelStates) {
			mutes.set(id, ch.isMuted)
		}
		return mutes
	}

	private pollTimer: ReturnType<typeof setInterval> | null = null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.api = new VVDApi(config.host, config.port)

		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()

		await this.connect()
	}

	async destroy(): Promise<void> {
		this.stopPolling()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.api.updateHost(config.host, config.port)
		this.stopPolling()
		await this.connect()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private async connect(): Promise<void> {
		try {
			const [status, channels, activeScene, scenes] = await Promise.all([
				this.api.getSystemStatus(),
				this.api.getAllChannels(),
				this.api.getActiveScene().catch(() => null),
				this.api.getScenes().catch(() => []),
			])
			this.systemStatus = status
			this.applyChannelStates(channels)
			this.activeSceneSlot = activeScene?.hasActiveScene ? (activeScene.activeSlot ?? null) : null
			this.sceneSlots = scenes
			this.updateStatus(InstanceStatus.Ok)
			this.updateVariableDefinitions()
			this.updatePresets()
			this.syncVariables()
			this.checkFeedbacks()
			this.startPolling()
		} catch (err) {
			this.log('error', `Failed to connect to VVD: ${err}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Cannot reach VVD')
		}
	}

	private startPolling(): void {
		this.stopPolling()
		const interval = this.config.pollInterval ?? 2000
		this.pollTimer = setInterval(() => {
			void this.poll()
		}, interval)
	}

	private stopPolling(): void {
		if (this.pollTimer !== null) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
		}
	}

	private async poll(): Promise<void> {
		try {
			const [status, channels, activeScene, scenes] = await Promise.all([
				this.api.getSystemStatus().catch(() => null),
				this.api.getAllChannels().catch(() => null),
				this.api.getActiveScene().catch(() => null),
				this.api.getScenes().catch(() => null),
			])
			if (status === null || channels === null) {
				this.updateStatus(InstanceStatus.ConnectionFailure, 'Cannot reach VVD')
				return
			}
			const prevEnabledChannelCount = [...this.channelStates.values()].filter((ch) => ch.isEnabled).length
			const prevOccupiedSceneCount = this.sceneSlots.filter((s) => s.hasScene).length
			this.systemStatus = status
			this.applyChannelStates(channels)
			this.activeSceneSlot = activeScene?.hasActiveScene ? (activeScene.activeSlot ?? null) : null
			if (scenes !== null) this.sceneSlots = scenes
			const newEnabledChannelCount = [...this.channelStates.values()].filter((ch) => ch.isEnabled).length
			const newOccupiedSceneCount = this.sceneSlots.filter((s) => s.hasScene).length
			// Regenerate presets if enabled channel count or occupied scene count changed
			if (newEnabledChannelCount !== prevEnabledChannelCount || newOccupiedSceneCount !== prevOccupiedSceneCount) {
				this.updateVariableDefinitions()
				this.updatePresets()
			}
			this.updateStatus(InstanceStatus.Ok)
			this.syncVariables()
			this.checkFeedbacks()
		} catch (err) {
			this.log('warn', `Poll failed: ${err}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Cannot reach VVD')
		}
	}

	/** Convert a linear amplitude value to a dB string (e.g. 11.8 → "21.4 dB", 0 → "-∞ dB") */
	private linearToDb(value: number): string {
		if (value <= 0) return '-∞ dB'
		return `${(20 * Math.log10(value)).toFixed(1)} dB`
	}

	/** Convert a gate threshold API value (0–1 linear remap over -48–0 dB) to a dB string */
	private gateThresholdToDb(value: number): string {
		if (value <= 0) return 'Off'
		return `${(value * 48 - 48).toFixed(1)} dB`
	}

	applyChannelStates(channels: VVDChannel[]): void {
		this.channelStates.clear()
		for (const ch of channels) {
			this.channelStates.set(ch.channelNumber, ch)
		}
	}

	syncVariables(): void {
		const power = this.systemStatus?.power ?? false
		const channelCount = this.systemStatus?.channelCount ?? 0

		const values: Record<string, string> = {
			power: power ? 'On' : 'Off',
			channel_count: String(channelCount),
		}

		for (const [id, ch] of this.channelStates) {
			values[`ch${id}_name`] = ch.name.trim() || `CH ${id}`
			values[`ch${id}_muted`] = ch.isMuted ? 'Muted' : 'Active'
			values[`ch${id}_enabled`] = ch.isEnabled ? 'Enabled' : 'Disabled'
			values[`ch${id}_gain`] = this.linearToDb(ch.gain)
			values[`ch${id}_gate_threshold`] = this.gateThresholdToDb(ch.gateThreshold)
			values[`ch${id}_mode`] = ch.useAiVad ? 'AI VAD' : 'Level'
			values[`ch${id}_hpf`] = ch.highPassFilterEnabled ? 'On' : 'Off'
		}

		for (const scene of this.sceneSlots) {
			values[`scene${scene.slotNumber}_name`] = scene.sceneName ?? scene.name
		}

		this.setVariableValues(values)
	}

	updateMuteState(channelId: number, isMuted: boolean): void {
		const ch = this.channelStates.get(channelId)
		if (ch) {
			this.channelStates.set(channelId, { ...ch, isMuted })
		}
		this.syncVariables()
		this.checkFeedbacks('channel_muted')
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
