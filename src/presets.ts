import type { ModuleInstance } from './main.js'
import { CompanionPresetDefinitions, combineRgb } from '@companion-module/base'

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const GREEN = combineRgb(0, 180, 0)
const RED = combineRgb(200, 0, 0)
const ORANGE = combineRgb(220, 120, 0)
const BLUE = combineRgb(0, 100, 220)
const PURPLE = combineRgb(130, 0, 200)
const CYAN = combineRgb(0, 180, 220)
const DARK_GREY = combineRgb(50, 50, 50)

/** Channel IDs with channelNumber < 129 (standard mic channels) */
function getStandardChannelIds(self: ModuleInstance): number[] {
	return [...self.channelStates.keys()].filter((id) => id < 129).sort((a, b) => a - b)
}

/** Channel IDs with channelNumber >= 129 (special system channels) */
function getSpecialChannelIds(self: ModuleInstance): number[] {
	return [...self.channelStates.keys()].filter((id) => id >= 129).sort((a, b) => a - b)
}

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}
	const CHANNEL_IDS = getStandardChannelIds(self)
	const SPECIAL_CHANNEL_IDS = getSpecialChannelIds(self)

	// ── Power controls ────────────────────────────────────────────────────────

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

	// ── Per-channel presets (channels 1–8) ────────────────────────────────────
	// Sections are grouped by action type, with a text header followed by all 8 channels.

	const category = 'Channels'

	// ── Channel Info ──
	presets['header_info'] = { type: 'text', category, name: 'Channel Info', text: '' }

	for (const ch of CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		presets[`info_ch${ch}`] = {
			type: 'button',
			category,
			name: `Channel ${ch} Info`,
			style: {
				text: `${name}\n$(vvd:ch${ch}_gain)\n$(vvd:ch${ch}_muted)`,
				size: 'auto',
				color: WHITE,
				bgcolor: DARK_GREY,
				show_topbar: false,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [{ feedbackId: 'channel_muted', options: { channel: ch }, style: { bgcolor: RED, color: WHITE } }],
		}
	}

	// ── Mute Controls ──
	presets['header_mute'] = { type: 'text', category, name: 'Mute Controls', text: '' }

	for (const ch of CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		presets[`mute_ch${ch}`] = {
			type: 'button',
			category,
			name: `Mute Channel ${ch}`,
			style: { text: `${name}\nMUTE`, size: 'auto', color: WHITE, bgcolor: DARK_GREY, show_topbar: false },
			steps: [{ down: [{ actionId: 'toggle_mute_channel', options: { channel: ch } }], up: [] }],
			feedbacks: [{ feedbackId: 'channel_muted', options: { channel: ch }, style: { bgcolor: RED, color: WHITE } }],
		}
	}

	presets['header_mute_special'] = { type: 'text', category, name: 'Mute Controls - Special Channels', text: '' }

	for (const ch of SPECIAL_CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		presets[`mute_ch${ch}`] = {
			type: 'button',
			category,
			name: `Mute Channel ${ch}`,
			style: { text: `${name}\nMUTE`, size: 'auto', color: WHITE, bgcolor: DARK_GREY, show_topbar: false },
			steps: [{ down: [{ actionId: 'toggle_mute_channel', options: { channel: ch } }], up: [] }],
			feedbacks: [{ feedbackId: 'channel_muted', options: { channel: ch }, style: { bgcolor: RED, color: WHITE } }],
		}
	}

	// ── Channel Mode ──
	presets['header_mode'] = { type: 'text', category, name: 'Channel Mode', text: '' }

	for (const ch of CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		presets[`mode_ch${ch}`] = {
			type: 'button',
			category,
			name: `Channel ${ch} Mode`,
			style: {
				text: `${name}\n$(vvd:ch${ch}_mode)`,
				size: 'auto',
				color: WHITE,
				bgcolor: DARK_GREY,
				show_topbar: false,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{
					feedbackId: 'channel_mode',
					options: { channel: ch, mode: 'ai_vad' },
					style: { bgcolor: BLUE, color: WHITE },
				},
			],
		}
	}

	// ── High Pass Filter ──
	presets['header_hpf'] = { type: 'text', category, name: 'High Pass Filter', text: '' }

	for (const ch of CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		presets[`hpf_ch${ch}`] = {
			type: 'button',
			category,
			name: `Channel ${ch} High Pass Filter`,
			style: {
				text: `${name}\nHPF: $(vvd:ch${ch}_hpf)`,
				size: 'auto',
				color: WHITE,
				bgcolor: DARK_GREY,
				show_topbar: false,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [{ feedbackId: 'channel_hpf', options: { channel: ch }, style: { bgcolor: PURPLE, color: WHITE } }],
		}
	}

	// ── Triggers ──
	presets['header_triggers'] = { type: 'text', category, name: 'Triggers', text: '' }

	for (const ch of CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		for (let slot = 1; slot <= 4; slot++) {
			presets[`trigger_ch${ch}_slot${slot}`] = {
				type: 'button',
				category,
				name: `Channel ${ch} Trigger ${slot}`,
				style: { text: `${name}\nTRIG ${slot}`, size: 'auto', color: WHITE, bgcolor: ORANGE, show_topbar: false },
				steps: [{ down: [{ actionId: 'trigger_channel', options: { channel: ch, slot } }], up: [] }],
				feedbacks: [],
			}
		}
	}

	presets['header_triggers_special'] = { type: 'text', category, name: 'Special Channels - Triggers', text: '' }

	for (const ch of SPECIAL_CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		for (let slot = 1; slot <= 4; slot++) {
			presets[`trigger_ch${ch}_slot${slot}`] = {
				type: 'button',
				category,
				name: `Channel ${ch} Trigger ${slot}`,
				style: { text: `${name}\nTRIG ${slot}`, size: 'auto', color: WHITE, bgcolor: ORANGE, show_topbar: false },
				steps: [{ down: [{ actionId: 'trigger_channel', options: { channel: ch, slot } }], up: [] }],
				feedbacks: [],
			}
		}
	}

	const occupiedScenes = self.sceneSlots.filter((s) => s.hasScene)

	if (occupiedScenes.length > 0) {
		for (const scene of occupiedScenes) {
			const label = scene.sceneName ?? scene.name
			presets[`scene_slot${scene.slotNumber}`] = {
				type: 'button',
				category: 'Scenes',
				name: `Scene: ${label}`,
				style: {
					text: `$(vvd:scene${scene.slotNumber}_name)`,
					size: 'auto',
					color: WHITE,
					bgcolor: DARK_GREY,
					show_topbar: false,
				},
				steps: [{ down: [{ actionId: 'load_scene_by_slot', options: { slot: scene.slotNumber } }], up: [] }],
				feedbacks: [
					{ feedbackId: 'active_scene', options: { slot: scene.slotNumber }, style: { bgcolor: CYAN, color: WHITE } },
				],
			}
		}
	}

	self.setPresetDefinitions(presets)
}
