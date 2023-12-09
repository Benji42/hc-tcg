import EffectCard from '../../base/effect-card'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {retrieveCard} from '../../../utils/movement'
import {applyAilment, removeAilment} from '../../../utils/board'

class FurnaceEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'furnace',
			numericId: 203,
			name: 'Furnace',
			rarity: 'rare',
			description:
				'Attach to any active or AFK Hermit.\n\nAfter 5 turns, converts all single item cards attached to that Hermit to double item cards.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		applyAilment(game, 'smelting', instance)
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		game.state.ailments.forEach((ail) => {
			if (ail.targetInstance === instance) {
				removeAilment(game, pos, ail.ailmentInstance)
			}
		})
	}

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default FurnaceEffectCard
