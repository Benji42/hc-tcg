import HermitCard from '../../base/hermit-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {getNonEmptyRows} from '../../../utils/board'

class KeralisRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'keralis_rare',
			numericId: 72,
			name: 'Keralis',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 250,
			primary: {
				name: 'Booshes',
				cost: ['any'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Sweet Face',
				cost: ['terraform', 'terraform', 'any'],
				damage: 0,
				power: 'Heal one of your AFK Hermits 100hp.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const playerKey = this.getInstanceKey(instance, 'player')
		const rowKey = this.getInstanceKey(instance, 'row')

		// Pick the hermit to heal
		player.hooks.getAttackRequests.add(instance, (activeInstance, hermitAttackType) => {
			// Make sure we are attacking
			if (activeInstance !== instance) return

			// Only secondary attack
			if (hermitAttackType !== 'secondary') return

			// Make sure there is something to select
			const playerHasAfk = getNonEmptyRows(player, true).some(
				(rowPos) => HERMIT_CARDS[rowPos.row.hermitCard.id] !== undefined
			)
			const opponentHasAfk = getNonEmptyRows(opponentPlayer, true).some(
				(rowPos) => HERMIT_CARDS[rowPos.row.hermitCard.id] !== undefined
			)
			if (!playerHasAfk && !opponentHasAfk) return

			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: 'Pick an AFK Hermit from either side of the board',
				onResult(pickResult) {
					const pickedPlayer = game.state.players[pickResult.playerId]
					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
					if (rowIndex === pickedPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					// Make sure it's an actual hermit card
					const hermitCard = HERMIT_CARDS[pickResult.card.id]
					if (!hermitCard) return 'FAILURE_INVALID_SLOT'

					// Store the info to use later
					player.custom[playerKey] = pickResult.playerId
					player.custom[rowKey] = rowIndex

					return 'SUCCESS'
				},
				onTimeout() {
					// We didn't pick anyone to heal, so heal no one
				},
			})
		})

		// Heals the afk hermit *before* we actually do damage
		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.getCreator() !== instance || attack.type !== 'secondary') return

			const pickedPlayer = game.state.players[player.custom[playerKey]]
			if (!pickedPlayer) return
			const pickedRowIndex = player.custom[rowKey]
			const pickedRow = pickedPlayer.board.rows[pickedRowIndex]
			if (!pickedRow || !pickedRow.hermitCard) return

			if (pickedRow.hermitCard instanceof HermitCard) {
				// Heal
				const maxHealth = Math.max(pickedRow.health, pickedRow.hermitCard.health)
				pickedRow.health = Math.min(pickedRow.health + 100, maxHealth)
				game.battleLog.addCustomEntry(
					`$p${pickedRow.hermitCard.name} (${pickedRowIndex + 1})$ healed $g100hp$`,
					player.id
				)
			}

			delete player.custom[playerKey]
			delete player.custom[rowKey]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.onAttack.remove(instance)

		delete player.custom[this.getInstanceKey(instance, 'player')]
		delete player.custom[this.getInstanceKey(instance, 'row')]
	}
}

export default KeralisRareHermitCard
