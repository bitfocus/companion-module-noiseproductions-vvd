import type { CompanionVariableDefinition } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const definitions: CompanionVariableDefinition[] = [
		{ variableId: 'power', name: 'Power State (On/Off)' },
		{ variableId: 'channel_count', name: 'Channel Count' },
	]

	// Register per-channel variables for all known channels.
	// If channels haven't been fetched yet, fall back to the last known count
	// from systemStatus so definitions are still registered on reconnect.
	const channelIds =
		self.channelStates.size > 0
			? [...self.channelStates.keys()]
			: Array.from({ length: self.systemStatus?.channelCount ?? 0 }, (_, i) => i + 1)

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

	self.setVariableDefinitions(definitions)
}
