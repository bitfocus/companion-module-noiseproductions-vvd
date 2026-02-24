import type { ModuleInstance } from './main.js'
import { CHANNEL_MAX, COLORS } from './constants.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		power_state: {
			name: 'Power Status',
			type: 'boolean',
			defaultStyle: {
				bgcolor: COLORS.GREEN,
				color: COLORS.BLACK,
			},
			options: [],
			callback: () => {
				const isPowered = self.systemStatus?.power ?? false
				return isPowered
			},
		},

		channel_muted: {
			name: 'Channel Muted',
			type: 'boolean',
			defaultStyle: {
				bgcolor: COLORS.RED,
				color: COLORS.WHITE,
			},
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
			callback: (feedback) => {
				const channelId = Number(feedback.options.channel)
				return self.channelStates.get(channelId)?.isMuted ?? false
			},
		},

		channel_mode: {
			name: 'Channel Mode',
			type: 'boolean',
			defaultStyle: {
				bgcolor: COLORS.BLUE,
				color: COLORS.WHITE,
			},
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
						{ id: 'ai_vad', label: 'AI VAD' },
						{ id: 'gate', label: 'Gate' },
					],
				},
			],
			callback: (feedback) => {
				const channelId = Number(feedback.options.channel)
				const useAiVad = self.channelStates.get(channelId)?.useAiVad ?? false
				return feedback.options.mode === 'ai_vad' ? useAiVad : !useAiVad
			},
		},

		channel_hpf: {
			name: 'Channel High Pass Filter',
			type: 'boolean',
			defaultStyle: {
				bgcolor: COLORS.ORANGE,
				color: COLORS.WHITE,
			},
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
			callback: (feedback) => {
				const channelId = Number(feedback.options.channel)
				return self.channelStates.get(channelId)?.highPassFilterEnabled ?? false
			},
		},

		active_scene: {
			name: 'Active Scene Slot',
			type: 'boolean',
			defaultStyle: {
				bgcolor: COLORS.CYAN,
				color: COLORS.WHITE,
			},
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
			callback: (feedback) => {
				return self.activeSceneSlot === Number(feedback.options.slot)
			},
		},
	})
}
