import type { CompanionInputFieldDropdown } from '@companion-module/base'

export enum NumberComparator {
	Equal = 'eq',
	NotEqual = 'ne',
	LessThan = 'lt',
	LessThanEqual = 'lte',
	GreaterThan = 'gt',
	GreaterThanEqual = 'gte',
}

export function compareNumber(target: number, comparator: NumberComparator, currentValue: number): boolean {
	const targetValue = Number(target)
	if (isNaN(targetValue)) return false

	switch (comparator) {
		case NumberComparator.GreaterThan:
			return currentValue > targetValue
		case NumberComparator.GreaterThanEqual:
			return currentValue >= targetValue
		case NumberComparator.LessThan:
			return currentValue < targetValue
		case NumberComparator.LessThanEqual:
			return currentValue <= targetValue
		case NumberComparator.NotEqual:
			return currentValue != targetValue
		default:
			return currentValue === targetValue
	}
}

export function NumberComparatorPicker(): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Comparator',
		id: 'comparator',
		default: NumberComparator.Equal,
		choices: [
			{ id: NumberComparator.Equal, label: 'Equal' },
			{ id: NumberComparator.NotEqual, label: 'Not Equal' },
			{ id: NumberComparator.GreaterThan, label: 'Greater than' },
			{ id: NumberComparator.GreaterThanEqual, label: 'Greater than or equal' },
			{ id: NumberComparator.LessThan, label: 'Less than' },
			{ id: NumberComparator.LessThanEqual, label: 'Less than or equal' },
		],
	}
}
