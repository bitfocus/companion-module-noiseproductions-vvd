import type { CompanionVariableDefinition } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { CHANNEL_SPECIAL_MIN, CHANNEL_MAX } from './constants.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const definitions: CompanionVariableDefinition[] = [
		{ variableId: 'power', name: 'Power State (On/Off)' },
		{ variableId: 'channel_count', name: 'Channel Count' },
	]

	// Always derive channel IDs from channelStates when available.
	// The fallback generates standard channels 1–N plus the known special
	// channel range (129–135) so definitions are never lost on reconnect.
	const channelIds =
		self.channelStates.size > 0
			? [...self.channelStates.keys()]
			: [
					...Array.from({ length: self.systemStatus?.channelCount ?? 0 }, (_, i) => i + 1),
					...Array.from({ length: CHANNEL_MAX - CHANNEL_SPECIAL_MIN + 1 }, (_, i) => i + CHANNEL_SPECIAL_MIN),
				]

	for (const id of channelIds) {
		definitions.push(
			{ variableId: `ch${id}_name`, name: `Channel ${id} Name` },
			{ variableId: `ch${id}_muted`, name: `Channel ${id} Mute State (Muted/Active)` },
			{ variableId: `ch${id}_enabled`, name: `Channel ${id} Enabled State` },
			{ variableId: `ch${id}_gain`, name: `Channel ${id} Gain (dB)` },
			{ variableId: `ch${id}_gate_threshold`, name: `Channel ${id} Gate Threshold (dB)` },
			{ variableId: `ch${id}_mode`, name: `Channel ${id} Mode (AI VAD/Gate)` },
			{ variableId: `ch${id}_hpf`, name: `Channel ${id} High Pass Filter (On/Off)` },
		)
	}

	for (const scene of self.sceneSlots) {
		definitions.push({ variableId: `scene${scene.slotNumber}_name`, name: `Scene Slot ${scene.slotNumber} Name` })
	}

	self.setVariableDefinitions(definitions)
}
