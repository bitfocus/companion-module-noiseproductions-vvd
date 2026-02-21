export interface VVDSystemStatus {
	power: boolean
	channelCount: number
	overviewThreshold: number
	silenceThreshold: number
}

export interface VVDActiveScene {
	activeSlot: number | null
	hasActiveScene: boolean
}

export interface VVDSceneSlot {
	slotNumber: number
	name: string
	hasScene: boolean
	sceneName: string | null
	sceneId: string | null
}

export interface VVDTriggerSlot {
	slotNumber: number
	triggerInstanceId: string | null
	parameterValue: string | null
	parameterDisplayName: string | null
	parameters: Record<string, unknown>
	isEnabled: boolean
	delayAfterMs: number
	multiviewTargetType: string | null
	multiviewInputNumber: number | null
	multiviewOverlayPosition: string | null
}

export interface VVDChannel {
	channelNumber: number
	name: string
	isMuted: boolean
	isEnabled: boolean
	gain: number
	gateThreshold: number
	useAiVad: boolean
	highPassFilterEnabled: boolean
	color: string
	triggerSlots: VVDTriggerSlot[]
}

export interface VVDApiResponse<T = unknown> {
	success: boolean
	data?: T
	error?: string
}

export class VVDApi {
	private baseUrl: string

	constructor(host: string, port: number) {
		this.baseUrl = `http://${host}:${port}`
	}

	updateHost(host: string, port: number): void {
		this.baseUrl = `http://${host}:${port}`
	}

	private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const url = `${this.baseUrl}${path}`
		const options: RequestInit = {
			method,
			headers: { 'Content-Type': 'application/json' },
		}
		if (body !== undefined) {
			options.body = JSON.stringify(body)
		}

		const response = await fetch(url, options)

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`)
		}

		return response.json() as Promise<T>
	}

	// System

	async getSystemStatus(): Promise<VVDSystemStatus> {
		return this.request<VVDSystemStatus>('GET', '/api/v2/system/status')
	}

	async setPower(enabled: boolean): Promise<void> {
		await this.request('GET', `/api/state/setpower/${enabled ? 'on' : 'off'}`)
	}

	// Channels

	async getAllChannels(): Promise<VVDChannel[]> {
		return this.request<VVDChannel[]>('GET', '/api/v2/channels')
	}

	async getChannel(channelId: number): Promise<VVDChannel> {
		return this.request<VVDChannel>('GET', `/api/v2/channels/${channelId}`)
	}

	async muteChannel(channelId: number): Promise<void> {
		await this.request('POST', `/api/v2/channels/${channelId}/mute`)
	}

	async unmuteChannel(channelId: number): Promise<void> {
		await this.request('POST', `/api/v2/channels/${channelId}/unmute`)
	}

	async toggleMuteChannel(channelId: number): Promise<void> {
		await this.request('GET', `/api/state/togglemutechannel/${channelId}`)
	}

	// Triggers

	async executeTrigger(channelId: number, slotId: number): Promise<void> {
		await this.request('POST', `/api/v2/channels/${channelId}/triggers/${slotId}/execute`)
	}

	// Scenes (used for broadcast channel switching)

	async loadSceneBySlot(slotNumber: number): Promise<void> {
		await this.request('POST', `/api/v2/show/scenes/${slotNumber}/load`)
	}

	async loadSceneByName(sceneName: string): Promise<void> {
		const encoded = encodeURIComponent(sceneName)
		await this.request('POST', `/api/v2/show/scenes/load?name=${encoded}`)
	}

	async getActiveScene(): Promise<VVDActiveScene> {
		return this.request<VVDActiveScene>('GET', '/api/v2/show/active')
	}

	async getScenes(): Promise<VVDSceneSlot[]> {
		const response = await this.request<{ activeSlot: number; scenes: VVDSceneSlot[] }>('GET', '/api/v2/show/scenes')
		return response.scenes ?? []
	}
}
