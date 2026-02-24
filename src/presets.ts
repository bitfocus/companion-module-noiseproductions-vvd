import type { ModuleInstance } from './main.js'
import { CHANNEL_SPECIAL_MIN, COLORS } from './constants.js'
import { CompanionPresetDefinitions } from '@companion-module/base'

/** Channel IDs with channelNumber < 129 (standard mic channels) */
function getStandardChannelIds(self: ModuleInstance): number[] {
	return [...self.channelStates.keys()].filter((id) => id < CHANNEL_SPECIAL_MIN).sort((a, b) => a - b)
}

/** Channel IDs with channelNumber >= 129 (special system channels) */
function getSpecialChannelIds(self: ModuleInstance): number[] {
	return [...self.channelStates.keys()].filter((id) => id >= CHANNEL_SPECIAL_MIN).sort((a, b) => a - b)
}

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}
	const CHANNEL_IDS = getStandardChannelIds(self)
	const SPECIAL_CHANNEL_IDS = getSpecialChannelIds(self)

	// ── Power controls ────────────────────────────────────────────────────────

	presets['power_status'] = {
		type: 'button',
		category: 'Power',
		name: 'Power Status',
		style: {
			text: 'POWER STATUS\n$(vvd:power)',
			size: 12,
			color: COLORS.WHITE,
			bgcolor: COLORS.BLACK,
			show_topbar: false,
		},
		steps: [{ down: [{ actionId: 'power', options: { mode: 'toggle' } }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'power_state',
				options: {},
				isInverted: true,
				style: { bgcolor: COLORS.RED, color: COLORS.WHITE },
			},
			{
				feedbackId: 'power_state',
				options: {},
				style: { bgcolor: COLORS.GREEN, color: COLORS.WHITE },
			},
		],
	}

	presets['power_toggle'] = {
		type: 'button',
		category: 'Power',
		name: 'Power Toggle',
		style: {
			text: 'TOGGLE POWER',
			size: 12,
			color: COLORS.WHITE,
			bgcolor: COLORS.BLACK,
			show_topbar: false,
		},
		previewStyle: {
			text: 'TOGGLE POWER',
			size: 12,
			color: COLORS.WHITE,
			bgcolor: COLORS.BLACK,
			show_topbar: false,
		},
		steps: [{ down: [{ actionId: 'power', options: { mode: 'toggle' } }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'power_state',
				options: {},
				isInverted: true,
				style: { text: 'POWER\nOFF', bgcolor: COLORS.RED, color: COLORS.WHITE },
			},
			{
				feedbackId: 'power_state',
				options: {},
				style: { text: 'POWER\nON', bgcolor: COLORS.GREEN, color: COLORS.WHITE },
			},
		],
	}

	presets['power_on'] = {
		type: 'button',
		category: 'Power',
		name: 'Power On',
		style: {
			text: 'POWER\nON',
			size: 12,
			color: COLORS.WHITE,
			bgcolor: COLORS.BLACK,
			show_topbar: false,
		},
		steps: [{ down: [{ actionId: 'power', options: { mode: 'on' } }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'power_state',
				options: {},
				style: { bgcolor: COLORS.GREEN, color: COLORS.WHITE },
			},
		],
	}

	presets['power_off'] = {
		type: 'button',
		category: 'Power',
		name: 'Power Off',
		style: {
			text: 'POWER\nOFF',
			size: 12,
			color: COLORS.WHITE,
			bgcolor: COLORS.BLACK,
			show_topbar: false,
		},
		steps: [{ down: [{ actionId: 'power', options: { mode: 'off' } }], up: [] }],
		feedbacks: [
			{
				feedbackId: 'power_state',
				options: {},
				isInverted: true,
				style: { bgcolor: COLORS.RED, color: COLORS.WHITE },
			},
		],
	}

	// ── Per-channel presets (channels 1–8) ────────────────────────────────────
	// Sections are grouped by action type, with a text header followed by all 8 channels.

	const category = 'Channels'

	// ── Channel Info ──
	presets['header_info'] = { type: 'text', category, name: 'Channel Status', text: '' }

	for (const ch of CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		presets[`info_ch${ch}`] = {
			type: 'button',
			category,
			name: `Channel ${ch} Info`,
			style: {
				text: `${name}\n\n$(vvd:ch${ch}_gain)\n$(vvd:ch${ch}_muted)`,
				size: 14,
				color: COLORS.WHITE,
				bgcolor: COLORS.DARK_GREY,
				show_topbar: false,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{ feedbackId: 'channel_muted', options: { channel: ch }, style: { bgcolor: COLORS.RED, color: COLORS.WHITE } },
			],
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
			style: { text: `UNMUTED\n${name}`, size: 12, color: COLORS.WHITE, bgcolor: COLORS.DARK_GREY, show_topbar: false },
			steps: [{ down: [{ actionId: 'mute_channel', options: { channel: ch, mode: 'toggle' } }], up: [] }],
			feedbacks: [
				{
					feedbackId: 'channel_muted',
					options: { channel: ch },
					style: { text: `MUTED\n${name}`, bgcolor: COLORS.RED, color: COLORS.WHITE },
				},
			],
		}
	}

	presets['header_mute_special'] = { type: 'text', category, name: 'Mute Controls - Special Channels', text: '' }

	for (const ch of SPECIAL_CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		presets[`mute_ch${ch}`] = {
			type: 'button',
			category,
			name: `Mute Channel ${ch}`,
			style: { text: `UNMUTED\n${name}`, size: 12, color: COLORS.WHITE, bgcolor: COLORS.DARK_GREY, show_topbar: false },
			steps: [{ down: [{ actionId: 'mute_channel', options: { channel: ch, mode: 'toggle' } }], up: [] }],
			feedbacks: [
				{
					feedbackId: 'channel_muted',
					options: { channel: ch },
					style: { text: `MUTED\n${name}`, bgcolor: COLORS.RED, color: COLORS.WHITE },
				},
			],
		}
	}

	// ── Channel Mode ──
	presets['header_mode'] = { type: 'text', category, name: 'Channel Mode Status', text: '' }

	for (const ch of CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		presets[`mode_ch${ch}`] = {
			type: 'button',
			category,
			name: `Channel ${ch} Mode`,
			style: {
				text: `${name}\nMODE\n$(vvd:ch${ch}_mode)`,
				size: 14,
				color: COLORS.WHITE,
				bgcolor: COLORS.DARK_GREY,
				show_topbar: false,
			},
			steps: [{ down: [{ actionId: 'set_channel_mode', options: { channel: ch, mode: 'toggle' } }], up: [] }],
			feedbacks: [
				{
					feedbackId: 'channel_mode',
					options: { channel: ch, mode: 'ai_vad' },
					style: { bgcolor: COLORS.GREEN, color: COLORS.WHITE },
				},
				{
					feedbackId: 'channel_mode',
					options: { channel: ch, mode: 'gate' },
					style: { bgcolor: COLORS.BLUE, color: COLORS.WHITE },
				},
			],
		}
	}

	// ── High Pass Filter ──
	presets['header_hpf'] = { type: 'text', category, name: 'High Pass Filter Status', text: '' }

	for (const ch of CHANNEL_IDS) {
		const name = `$(vvd:ch${ch}_name)`
		presets[`hpf_ch${ch}`] = {
			type: 'button',
			category,
			name: `Channel ${ch} High Pass Filter`,
			style: {
				text: `${name}\nHPF\n$(vvd:ch${ch}_hpf)`,
				size: 14,
				color: COLORS.WHITE,
				bgcolor: COLORS.DARK_GREY,
				show_topbar: false,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{ feedbackId: 'channel_hpf', options: { channel: ch }, style: { bgcolor: COLORS.BLUE, color: COLORS.WHITE } },
			],
		}
	}

	// ── Triggers ──
	const hasStandardTriggers = CHANNEL_IDS.some((ch) =>
		(self.channelStates.get(ch)?.triggerSlots ?? []).some((s) => s.triggerInstanceId !== null),
	)
	if (hasStandardTriggers) {
		presets['header_triggers'] = { type: 'text', category, name: 'Triggers', text: '' }
		for (const ch of CHANNEL_IDS) {
			const name = `$(vvd:ch${ch}_name)`
			const occupiedSlots = (self.channelStates.get(ch)?.triggerSlots ?? []).filter((s) => s.triggerInstanceId !== null)
			for (const triggerSlot of occupiedSlots) {
				const slot = triggerSlot.slotNumber
				const label = triggerSlot.parameterDisplayName ?? `TRIG ${slot}`
				presets[`trigger_ch${ch}_slot${slot}`] = {
					type: 'button',
					category,
					name: `Channel ${ch} Trigger ${slot}`,
					style: {
						text: `${name}\n${label}`,
						size: 'auto',
						color: COLORS.WHITE,
						bgcolor: COLORS.ORANGE,
						show_topbar: false,
					},
					steps: [{ down: [{ actionId: 'trigger_channel', options: { channel: ch, slot } }], up: [] }],
					feedbacks: [],
				}
			}
		}
	}

	const hasSpecialTriggers = SPECIAL_CHANNEL_IDS.some((ch) =>
		(self.channelStates.get(ch)?.triggerSlots ?? []).some((s) => s.triggerInstanceId !== null),
	)
	if (hasSpecialTriggers) {
		presets['header_triggers_special'] = { type: 'text', category, name: 'Special Channels - Triggers', text: '' }
		for (const ch of SPECIAL_CHANNEL_IDS) {
			const name = `$(vvd:ch${ch}_name)`
			const occupiedSlots = (self.channelStates.get(ch)?.triggerSlots ?? []).filter((s) => s.triggerInstanceId !== null)
			for (const triggerSlot of occupiedSlots) {
				const slot = triggerSlot.slotNumber
				const label = triggerSlot.parameterDisplayName ?? `TRIG ${slot}`
				presets[`trigger_ch${ch}_slot${slot}`] = {
					type: 'button',
					category,
					name: `Channel ${ch} Trigger ${slot}`,
					style: {
						text: `${name}\n${label}`,
						size: 'auto',
						color: COLORS.WHITE,
						bgcolor: COLORS.ORANGE,
						show_topbar: false,
					},
					steps: [{ down: [{ actionId: 'trigger_channel', options: { channel: ch, slot } }], up: [] }],
					feedbacks: [],
				}
			}
		}
	}

	presets['header_broadcast'] = { type: 'text', category: 'Broadcast', name: 'Broadcast', text: '' }
	for (const trigger of [
		{ id: 'onair', label: 'On Air' },
		{ id: 'offair', label: 'Off Air' },
		{ id: 'musicbreak', label: 'Music Break' },
		{ id: 'adbreak', label: 'Ad Break' },
	]) {
		presets[`broadcast_trigger_${trigger.id}`] = {
			type: 'button',
			category: 'Broadcast',
			name: `Broadcast Trigger ${trigger.label}`,
			style: {
				text: `TRIGGER\n${trigger.label}`,
				size: 12,
				color: COLORS.WHITE,
				bgcolor: COLORS.ORANGE,
				show_topbar: false,
			},
			steps: [{ down: [{ actionId: 'trigger_broadcast', options: { broadcastTrigger: trigger.id } }], up: [] }],
			feedbacks: [],
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
					color: COLORS.WHITE,
					bgcolor: COLORS.DARK_GREY,
					show_topbar: false,
				},
				steps: [{ down: [{ actionId: 'load_scene_by_slot', options: { slot: scene.slotNumber } }], up: [] }],
				feedbacks: [
					{
						feedbackId: 'active_scene',
						options: { slot: scene.slotNumber },
						style: { bgcolor: COLORS.CYAN, color: COLORS.WHITE },
					},
				],
			}
		}
	}

	self.setPresetDefinitions(presets)
}
