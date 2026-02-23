import type { ModuleInstance } from './main.js'
import { CHANNEL_MAX } from './constants.js'

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
					max: CHANNEL_MAX,
				},
			],
			callback: async (event) => {
				const channelId = Number(event.options.channel)
				try {
					await self.api.muteChannel(channelId)
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
					max: CHANNEL_MAX,
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
					max: CHANNEL_MAX,
				},
			],
			callback: async (event) => {
				const channelId = Number(event.options.channel)
				try {
					await self.api.toggleMuteChannel(channelId)
					const current = self.channelStates.get(channelId)?.isMuted ?? false
					self.updateMuteState(channelId, !current)
				} catch (err) {
					self.log('error', `Toggle Mute Channel ${channelId} failed: ${err}`)
				}
			},
		},

		/* set_channel_mode: {
			name: 'Set Channel Mode',
			options: [
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					default: 1,
					min: 1,
					max: CHANNEL_MAX,
				},
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Mode',
					default: 'ai_vad',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'ai_vad', label: 'AI VAD' },
						{ id: 'gate', label: 'Level' },
					],
				},
			],
			callback: async (event) => {
				const channelId = Number(event.options.channel)
				const choice = event.options.mode as string
				const currentUseAiVad = self.channelStates.get(channelId)?.useAiVad ?? false
				const useAiVad = choice === 'toggle' ? !currentUseAiVad : choice === 'ai_vad'
				try {
					self.log('info', `Set Channel Mode ${channelId} ${useAiVad}`)
					await self.api.setChannelMode(channelId, useAiVad)
				} catch (err) {
					self.log('error', `Set Channel Mode ${channelId} ${event.options.mode} failed: ${err}`)
				}
			},
		}, */

		trigger_channel: {
			name: 'Trigger Channel Manually',
			options: [
				{
					id: 'channel',
					type: 'number',
					label: 'Channel',
					default: 1,
					min: 1,
					max: CHANNEL_MAX,
				},
				{
					id: 'slot',
					type: 'number',
					label: 'Trigger Slot',
					default: 1,
					min: 1,
					max: 8,
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

		load_scene_by_slot: {
			name: 'Load Scene by Slot',
			options: [
				{
					id: 'slot',
					type: 'number',
					label: 'Scene Slot',
					default: 1,
					min: 1,
					max: 99,
				},
			],
			callback: async (event) => {
				const slot = Number(event.options.slot)
				try {
					await self.api.loadSceneBySlot(slot)
					self.activeSceneSlot = slot
					self.checkFeedbacks('active_scene')
				} catch (err) {
					self.log('error', `Load Scene Slot ${slot} failed: ${err}`)
				}
			},
		},

		load_scene_by_name: {
			name: 'Load Scene by Name',
			options: [
				{
					id: 'name',
					type: 'textinput',
					label: 'Scene Name',
					default: '',
				},
			],
			callback: async (event) => {
				const sceneName = String(event.options.name).trim()
				if (!sceneName) return
				try {
					await self.api.loadSceneByName(sceneName)
				} catch (err) {
					self.log('error', `Load Scene "${sceneName}" failed: ${err}`)
				}
			},
		},
		trigger_broadcast: {
			name: 'Broadcast Trigger',
			options: [
				{
					id: 'broadcastTrigger',
					type: 'dropdown',
					label: 'Broadcast Trigger',
					choices: [
						{ id: 'onair', label: 'On Air' },
						{ id: 'offair', label: 'Off Air' },
						{ id: 'musicbreak', label: 'Music Break' },
						{ id: 'adbreak', label: 'Ad Break' },
					],
					default: 'onair',
				},
			],
			callback: async (event) => {
				const trigger = String(event.options.broadcastTrigger).trim()
				if (!trigger) return
				try {
					await self.api.executeBroadcastTrigger(trigger)
				} catch (err) {
					self.log('error', `Execute Broadcast Trigger "${trigger}" failed: ${err}`)
				}
			},
		},
	})
}
