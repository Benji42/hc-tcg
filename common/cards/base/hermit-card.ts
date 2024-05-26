import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import Card, {CanAttachResult} from './card'
import {CardRarityT, HermitAttackInfo, HermitTypeT} from '../../types/cards'
import {HermitAttackType} from '../../types/attack'
import {CardPosModel} from '../../models/card-pos-model'
import {TurnActions} from '../../types/game-state'
import {FormattedTextNode, formatText} from '../../utils/formatting'

type HermitDefs = {
	id: string
	numericId: number
	name: string
	rarity: CardRarityT
	hermitType: HermitTypeT
	health: number
	primary: HermitAttackInfo
	secondary: HermitAttackInfo
}

abstract class HermitCard extends Card {
	public hermitType: HermitTypeT
	public health: number
	public primary: HermitAttackInfo
	public secondary: HermitAttackInfo

	constructor(defs: HermitDefs) {
		super({
			type: 'hermit',
			id: defs.id,
			numericId: defs.numericId,
			name: defs.name,
			rarity: defs.rarity,
		})

		this.hermitType = defs.hermitType
		this.health = defs.health
		this.primary = defs.primary
		this.secondary = defs.secondary
		this.log = (values) => `$p{You|${values.player}}$ placed $p${this.name}$`
	}

	public override canAttach(game: GameModel, pos: CardPosModel): CanAttachResult {
		const {currentPlayer} = game

		const result: CanAttachResult = []

		if (pos.slot.type !== 'hermit') result.push('INVALID_SLOT')
		if (pos.player.id !== currentPlayer.id) result.push('INVALID_PLAYER')

		return result
	}

	// Default is to return
	public getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	): AttackModel | undefined {
		if (pos.rowIndex === null || !pos.row || !pos.row.hermitCard) return

		const {opponentPlayer: opponentPlayer} = game
		const targetIndex = opponentPlayer.board.activeRow
		if (targetIndex === null) return

		const targetRow = opponentPlayer.board.rows[targetIndex]
		if (!targetRow.hermitCard) return

		// Create an attack with default damage
		const attack = new AttackModel({
			game: game,
			creator: pos.card,
			attacker: pos.card,
			target: targetRow.hermitCard,
			type: hermitAttackType,
			createWeakness: 'ifWeak',
			log: (values) =>
				`${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked ${
					values.target
				} with ${values.attackName} for ${values.damage} damage`,
		})

		if (attack.type === 'primary') {
			attack.addDamage(this.id, this.primary.damage)
		} else if (attack.type === 'secondary') {
			attack.addDamage(this.id, this.secondary.damage)
		}

		return attack
	}

	public override getActions(game: GameModel): TurnActions {
		const {currentPlayer} = game

		// Is there a hermit slot free on the board
		const spaceForHermit = currentPlayer.board.rows.some((row) => !row.hermitCard)

		return spaceForHermit ? ['PLAY_HERMIT_CARD'] : []
	}

	/**
	 * Returns the background to use for this hermit card
	 */
	public getBackground(): string {
		return this.id.split('_')[0]
	}

	public override getFormattedDescription(): FormattedTextNode {
		return formatText(
			(this.primary.power ? `**${this.primary.name}**\n*${this.primary.power}*` : '') +
				(this.secondary.power ? `**${this.secondary.name}**\n*${this.secondary.power}*` : '')
		)
	}
}

export default HermitCard
