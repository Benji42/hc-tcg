import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {TurnActions} from '../../../types/game-state'
import {applyStatusEffect, getActiveRow} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'

class JoeHillsRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'joehills_rare',
			numericId: 70,
			name: 'Joe',
			rarity: 'rare',
			hermitType: 'farm',
			health: 270,
			primary: {
				name: 'Grow Hills',
				cost: ['farm'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Time Skip',
				cost: ['farm', 'farm', 'any'],
				damage: 90,
				power:
					'Flip a coin.\nIf heads, your opponent skips their next turn. "Time Skip" can not be used consecutively if successful.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		// null | card instance
		const skippedKey = this.getInstanceKey(instance, 'skipped')
		player.custom[skippedKey] = null

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			const attacker = attack.getAttacker()
			if (!attacker || attack.type !== 'secondary') return

			if (game.state.statusEffects.some((effect) => effect.statusEffectId === 'used-clock')) {
				return
			}

			const coinFlip = flipCoin(player, attacker.row.hermitCard, 1)
			if (coinFlip[0] !== 'heads') return

			attack.updateLog(
				(values) => ` ${values.previousLog}, then skipped {$o${values.opponent}'s$|your} turn`
			)

			// This will tell us to block actions at the start of our next turn
			// Storing the cardInstance of the card that attacked
			player.custom[skippedKey] = attacker.row.hermitCard.cardInstance

			applyStatusEffect(game, 'used-clock', getActiveRow(player)?.hermitCard.cardInstance)

			// Block all actions of opponent for one turn
			opponentPlayer.hooks.onTurnStart.add(instance, () => {
				game.addBlockedActions(
					this.id,
					'APPLY_EFFECT',
					'REMOVE_EFFECT',
					'SINGLE_USE_ATTACK',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'PLAY_HERMIT_CARD',
					'PLAY_ITEM_CARD',
					'PLAY_SINGLE_USE_CARD',
					'PLAY_EFFECT_CARD'
				)
				opponentPlayer.hooks.onTurnStart.remove(instance)
			})
		})

		// Block secondary attack if we skipped
		player.hooks.onTurnStart.add(instance, () => {
			const sameActive = game.activeRow?.hermitCard?.cardInstance === player.custom[skippedKey]
			if (player.custom[skippedKey] && sameActive) {
				// We skipped last turn and we are still the active hermit, block secondary attacks
				game.addBlockedActions(this.id, 'SECONDARY_ATTACK')
			}

			player.custom[skippedKey] = null
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const skippedKey = this.getInstanceKey(instance, 'skipped')
		// Remove hooks
		player.hooks.onAttack.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		delete player.custom[skippedKey]
	}

	override sidebarDescriptions() {
		return [
			{
				type: 'glossary',
				name: 'turnSkip',
			},
		]
	}
}

export default JoeHillsRareHermitCard
