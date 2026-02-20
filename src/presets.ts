import type { ModuleInstance } from './main.js'
import { CompanionPresetDefinitions, combineRgb } from '@companion-module/base'
import { BROADCAST_CHANNELS } from './actions.js'

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const GREEN = combineRgb(0, 180, 0)
const RED = combineRgb(200, 0, 0)
const ORANGE = combineRgb(220, 120, 0)
const BLUE = combineRgb(0, 100, 220)
const PURPLE = combineRgb(130, 0, 200)

const BROADCAST_COLORS: Record<string, number> = {
	'On Air': RED,
	'Off Air': combineRgb(80, 80, 80),
	'Ad Break': ORANGE,
	'Music Break': BLUE,
}

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}

	// Power controls
	presets['power_on'] = {
		type: 'button',
		category: 'Power',
		name: 'Power On',
		style: {
			text: 'POWER\nON',
			size: 'auto',
			color: WHITE,
			bgcolor: GREEN,
			show_topbar: false,
		},
		steps: [{ down: [{ actionId: 'power_on', options: {} }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'power_state',
				options: { state: 'on' },
				style: { bgcolor: GREEN, color: WHITE },
			},
		],
	}

	presets['power_off'] = {
		type: 'button',
		category: 'Power',
		name: 'Power Off',
		style: {
			text: 'POWER\nOFF',
			size: 'auto',
			color: WHITE,
			bgcolor: RED,
			show_topbar: false,
		},
		steps: [{ down: [{ actionId: 'power_off', options: {} }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'power_state',
				options: { state: 'off' },
				style: { bgcolor: RED, color: WHITE },
			},
		],
	}

	presets['power_toggle'] = {
		type: 'button',
		category: 'Power',
		name: 'Power Toggle',
		style: {
			text: 'POWER\n$(vvd:power)',
			size: 'auto',
			color: WHITE,
			bgcolor: BLACK,
			show_topbar: false,
		},
		steps: [{ down: [{ actionId: 'power_toggle', options: {} }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'power_state',
				options: { state: 'on' },
				style: { bgcolor: GREEN, color: WHITE },
			},
		],
	}

	// Broadcast channels
	for (const channel of BROADCAST_CHANNELS) {
		const key = channel.toLowerCase().replace(/\s+/g, '_')
		presets[`broadcast_${key}`] = {
			type: 'button',
			category: 'Broadcast Channels',
			name: channel,
			style: {
				text: channel.toUpperCase(),
				size: 'auto',
				color: WHITE,
				bgcolor: BROADCAST_COLORS[channel] ?? PURPLE,
				show_topbar: false,
			},
			steps: [
				{
					down: [{ actionId: 'broadcast_channel', options: { channel } }],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	// Channel mute presets for channels 1–8
	for (let ch = 1; ch <= 8; ch++) {
		presets[`mute_ch${ch}`] = {
			type: 'button',
			category: 'Channel Mute',
			name: `Mute Channel ${ch}`,
			style: {
				text: `CH ${ch}\nMUTE`,
				size: 'auto',
				color: WHITE,
				bgcolor: BLACK,
				show_topbar: false,
			},
			steps: [
				{
					down: [{ actionId: 'toggle_mute_channel', options: { channel: ch } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'channel_muted',
					options: { channel: ch },
					style: { bgcolor: RED, color: WHITE },
				},
			],
		}
	}

	// Trigger presets for channel 1, slots 1–4 as a starting example
	for (let slot = 1; slot <= 4; slot++) {
		presets[`trigger_ch1_slot${slot}`] = {
			type: 'button',
			category: 'Triggers',
			name: `CH 1 Trigger ${slot}`,
			style: {
				text: `CH 1\nTRIG ${slot}`,
				size: 'auto',
				color: WHITE,
				bgcolor: ORANGE,
				show_topbar: false,
			},
			steps: [
				{
					down: [
						{
							actionId: 'trigger_channel',
							options: { channel: 1, slot },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	self.setPresetDefinitions(presets)
}
