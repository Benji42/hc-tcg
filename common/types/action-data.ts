import {HermitAttackType} from './attack'
import {SlotTypeT} from './cards'
import {AttackAction, CardT, PlayCardAction} from './game-state'
import {PickResultT, PickedSlotT} from './pick-process'

export const slotToPlayCardAction: Record<SlotTypeT, PlayCardAction> = {
	hermit: 'PLAY_HERMIT_CARD',
	item: 'PLAY_ITEM_CARD',
	effect: 'PLAY_EFFECT_CARD',
	single_use: 'PLAY_SINGLE_USE_CARD',
}
export const attackToAttackAction: Record<HermitAttackType, AttackAction> = {
	zero: 'ZERO_ATTACK',
	primary: 'PRIMARY_ATTACK',
	secondary: 'SECONDARY_ATTACK',
}
export const attackActionToAttack: Record<AttackAction, HermitAttackType> = {
	ZERO_ATTACK: 'zero',
	PRIMARY_ATTACK: 'primary',
	SECONDARY_ATTACK: 'secondary',
}

// @TODO long term all data types that can be sent to server should be here

export type PlayCardActionData = {
	type: PlayCardAction
	payload: {
		pickedSlot: PickedSlotT
		card: CardT
		playerId: string
	}
}

export type AttackActionData = {
	type: AttackAction
	payload: {
		pickResults: Record<string, Array<PickResultT>>
		playerId: string
	}
}

export type AnyActionData = PlayCardActionData | AttackActionData
