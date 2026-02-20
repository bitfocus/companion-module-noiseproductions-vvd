import type { ModuleInstance } from './main.js'

// Broadcast channel scene names as used in VVD shows
export const BROADCAST_CHANNELS = ['Ad Break', 'Music Break', 'On Air', 'Off Air'] as const
export type BroadcastChannel = (typeof BROADCAST_CHANNELS)[number]

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		power_on: {
			name: 'Power On',
			options: [],
			callback: async () => {
				try {
					await self.api.setPower(true)
					if (self.systemStatus) self.systemStatus.power = true
					self.syncVariables()
					self.checkFeedbacks('power_state')
				} catch (err) {
					self.log('error', `Power On failed: ${err}`)
				}
			},
		},

		power_off: {
			name: 'Power Off',
			options: [],
			callback: async () => {
				try {
					await self.api.setPower(false)
					if (self.systemStatus) self.systemStatus.power = false
					self.syncVariables()
					self.checkFeedbacks('power_state')
				} catch (err) {
					self.log('error', `Power Off failed: ${err}`)
				}
			},
		},

		power_toggle: {
			name: 'Power Toggle',
			options: [],
			callback: async () => {
				try {
					const newState = !(self.systemStatus?.power ?? false)
					await self.api.setPower(newState)
					if (self.systemStatus) self.systemStatus.power = newState
					self.syncVariables()
					self.checkFeedbacks('power_state')
				} catch (err) {
					self.log('error', `Power Toggle failed: ${err}`)
				}
			},
		},

		mute_channel: {
			name: 'Mute Channel',
			options: [
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					default: 1,
					min: 1,
					max: 64,
				},
			],
			callback: async (event) => {
				const channelId = Number(event.options.channel)
				console.log(`Mute Channel ${channelId}`)
				try {
					await self.api.muteChannel(channelId)
					console.log(`Mute Channel ${channelId} successful`)
					self.updateMuteState(channelId, true)
				} catch (err) {
					self.log('error', `Mute Channel ${channelId} failed: ${err}`)
				}
			},
		},

		unmute_channel: {
			name: 'Unmute Channel',
			options: [
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					default: 1,
					min: 1,
					max: 64,
				},
			],
			callback: async (event) => {
				const channelId = Number(event.options.channel)
				try {
					await self.api.unmuteChannel(channelId)
					self.updateMuteState(channelId, false)
				} catch (err) {
					self.log('error', `Unmute Channel ${channelId} failed: ${err}`)
				}
			},
		},

		toggle_mute_channel: {
			name: 'Toggle Mute Channel',
			options: [
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					default: 1,
					min: 1,
					max: 64,
				},
			],
			callback: async (event) => {
				const channelId = Number(event.options.channel)
				try {
					await self.api.toggleMuteChannel(channelId)
					const current = self.channelMuteStates.get(channelId) ?? false
					self.updateMuteState(channelId, !current)
				} catch (err) {
					self.log('error', `Toggle Mute Channel ${channelId} failed: ${err}`)
				}
			},
		},

		trigger_channel: {
			name: 'Trigger Channel Manually',
			options: [
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					default: 1,
					min: 1,
					max: 64,
				},
				{
					id: 'slot',
					type: 'number',
					label: 'Trigger Slot',
					default: 1,
					min: 1,
					max: 32,
				},
			],
			callback: async (event) => {
				const channelId = Number(event.options.channel)
				const slotId = Number(event.options.slot)
				try {
					await self.api.executeTrigger(channelId, slotId)
				} catch (err) {
					self.log('error', `Trigger Channel ${channelId} Slot ${slotId} failed: ${err}`)
				}
			},
		},

		broadcast_channel: {
			name: 'Activate Broadcast Channel',
			options: [
				{
					id: 'channel',
					type: 'dropdown',
					label: 'Broadcast Channel',
					default: 'On Air',
					choices: BROADCAST_CHANNELS.map((c) => ({ id: c, label: c })),
				},
			],
			callback: async (event) => {
				const sceneName = String(event.options.channel)
				try {
					await self.api.loadSceneByName(sceneName)
				} catch (err) {
					self.log('error', `Activate Broadcast Channel "${sceneName}" failed: ${err}`)
				}
			},
		},
	})
}
