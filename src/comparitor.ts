import type { CompanionInputFieldDropdown } from '@companion-module/base'

export enum NumberComparitor {
	Equal = 'eq',
	NotEqual = 'ne',
	LessThan = 'lt',
	LessThanEqual = 'lte',
	GreaterThan = 'gt',
	GreaterThanEqual = 'gte',
}

export function compareNumber(target: number, comparitor: NumberComparitor, currentValue: number): boolean {
	const targetValue = Number(target)
	if (isNaN(targetValue)) return false

	switch (comparitor) {
		case NumberComparitor.GreaterThan:
			return currentValue > targetValue
		case NumberComparitor.GreaterThanEqual:
			return currentValue >= targetValue
		case NumberComparitor.LessThan:
			return currentValue < targetValue
		case NumberComparitor.LessThanEqual:
			return currentValue <= targetValue
		case NumberComparitor.NotEqual:
			return currentValue != targetValue
		default:
			return currentValue === targetValue
	}
}

export function NumberComparitorPicker(): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Comparitor',
		id: 'comparitor',
		default: NumberComparitor.Equal,
		choices: [
			{ id: NumberComparitor.Equal, label: 'Equal' },
			{ id: NumberComparitor.NotEqual, label: 'Not Equal' },
			{ id: NumberComparitor.GreaterThan, label: 'Greater than' },
			{ id: NumberComparitor.GreaterThanEqual, label: 'Greater than or equal' },
			{ id: NumberComparitor.LessThan, label: 'Less than' },
			{ id: NumberComparitor.LessThanEqual, label: 'Less than or equal' },
		],
	}
}
