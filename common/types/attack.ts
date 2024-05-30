import {RowPos} from './cards'

export type HermitAttackType = 'primary' | 'secondary' | 'single-use'

export type AttackType = HermitAttackType | 'effect' | 'weakness' | 'status-effect'

export type WeaknessType = 'always' | 'ifWeak' | 'never'

export type AttackDefence = {
	damageReduction: number
}

export type ShouldIgnoreCard = (instance: string) => boolean

export type AttackLog = {
	defaultLog: string
	attacker: string
	attackName: string
	player: string
	opponent: string
	target: string
	damage: string
	coinFlip: string | null
}

export type AttackDefs = {
	id?: string
	attacker?: RowPos | null
	target?: RowPos | null
	type: AttackType
	shouldIgnoreCards?: Array<ShouldIgnoreCard>
	isBacklash?: boolean
	createWeakness?: WeaknessType
	log?: (values: AttackLog) => string
}

export type AttackHistoryType =
	| 'add_damage'
	| 'reduce_damage'
	| 'multiply_damage'
	| 'lock_damage'
	| 'set_attacker'
	| 'set_target'

export type AttackHistory = {
	sourceId: string
	type: AttackHistoryType
	value?: any
}
