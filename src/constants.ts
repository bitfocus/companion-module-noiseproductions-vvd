import { combineRgb } from '@companion-module/base'

//First channel number in the special system channel range
export const CHANNEL_SPECIAL_MIN = 129

//Highest possible channel number
export const CHANNEL_MAX = 135

export const COLORS = {
	WHITE: combineRgb(255, 255, 255),
	BLACK: combineRgb(0, 0, 0),
	GREEN: combineRgb(0, 180, 0),
	RED: combineRgb(200, 0, 0),
	ORANGE: combineRgb(220, 120, 0),
	BLUE: combineRgb(51, 118, 205),
	CYAN: combineRgb(0, 180, 220),
	DARK_GREY: combineRgb(50, 50, 50),
}
