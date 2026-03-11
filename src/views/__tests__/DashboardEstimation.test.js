import { describe, it, expect } from 'vitest'

/**
 * Unit tests for the banding-based estimation accuracy logic used in DashboardView.
 * Tests the getActualBand helper and the overall estimation accuracy calculation.
 */

const defaultBands = { short: 15, mid: 30, long: 60, veryLong: 120 }

function getActualBand(actualMinutes, bands) {
	const sorted = Object.values(bands).sort((a, b) => a - b)
	for (let i = sorted.length - 1; i >= 0; i--) {
		if (i === 0) return sorted[0]
		const threshold = (sorted[i - 1] + sorted[i]) / 2
		if (actualMinutes >= threshold) return sorted[i]
	}
	return sorted[0]
}

function calcEstimationAccuracy(completedTasks, bands = defaultBands) {
	const tracked = completedTasks.filter(
		t => t.actualDuration != null && t.sizing != null && t.sizing > 0
	)
	if (tracked.length === 0) return null

	let correctCount = 0
	for (const task of tracked) {
		const taskBands = task.estimateBandsAtCompletion ?? bands
		const actualBand = getActualBand(task.actualDuration, taskBands)
		if (actualBand === task.sizing) correctCount++
	}

	const percentage = Math.round((correctCount / tracked.length) * 100)

	let summary, bgClass
	if (percentage >= 70) {
		summary = `${correctCount} of ${tracked.length} tasks landed in the right size band — nice work`
		bgClass = 'bg-app-success'
	} else if (percentage >= 40) {
		summary = `Only ${correctCount} of ${tracked.length} tasks matched their size band — review your sizing`
		bgClass = 'bg-app-warning'
	} else {
		summary = `${correctCount} of ${tracked.length} tasks matched their size band — consider adjusting estimates`
		bgClass = 'bg-app-danger'
	}

	return { percentage, taskCount: tracked.length, summary, bgClass }
}

describe('getActualBand', () => {
	it('maps durations to the correct size band using midpoint thresholds', () => {
		// Midpoints: 0-22.5=Short(15), 22.5-45=Mid(30), 45-90=Long(60), 90+=VeryLong(120)
		expect(getActualBand(10, defaultBands)).toBe(15)   // Short
		expect(getActualBand(22, defaultBands)).toBe(15)   // Still Short (below 22.5)
		expect(getActualBand(23, defaultBands)).toBe(30)   // Mid (above 22.5)
		expect(getActualBand(30, defaultBands)).toBe(30)   // Mid
		expect(getActualBand(44, defaultBands)).toBe(30)   // Still Mid (below 45)
		expect(getActualBand(45, defaultBands)).toBe(60)   // Long (at 45)
		expect(getActualBand(60, defaultBands)).toBe(60)   // Long
		expect(getActualBand(89, defaultBands)).toBe(60)   // Still Long (below 90)
		expect(getActualBand(90, defaultBands)).toBe(120)  // Very Long (at 90)
		expect(getActualBand(150, defaultBands)).toBe(120) // Very Long
	})

	it('handles custom band settings', () => {
		const customBands = { short: 10, mid: 20, long: 40, veryLong: 80 }
		// Midpoints: 15, 30, 60
		expect(getActualBand(14, customBands)).toBe(10)
		expect(getActualBand(16, customBands)).toBe(20)
		expect(getActualBand(29, customBands)).toBe(20)
		expect(getActualBand(31, customBands)).toBe(40)
	})

	it('returns smallest band for zero minutes', () => {
		expect(getActualBand(0, defaultBands)).toBe(15)
	})
})

describe('estimationAccuracy', () => {
	it('returns null when no tasks have time tracking data', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 30, completedDateTime: '2025-01-01' },
			{ sizing: 60, completedDateTime: '2025-01-02' }
		])

		expect(result).toBeNull()
	})

	it('returns null for an empty completed list', () => {
		expect(calcEstimationAccuracy([])).toBeNull()
	})

	it('returns 100% when actual durations land in the correct bands', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 30, actualDuration: 30 },  // Mid band, actual is Mid
			{ sizing: 60, actualDuration: 60 }   // Long band, actual is Long
		])

		expect(result.percentage).toBe(100)
		expect(result.bgClass).toBe('bg-app-success')
		expect(result.taskCount).toBe(2)
	})

	it('counts as correct when actual is in the same band even if not exact', () => {
		// A 45-minute task estimated as Long (60) — actual band is Long (45 >= 45 threshold)
		const result = calcEstimationAccuracy([
			{ sizing: 60, actualDuration: 45 }
		])

		expect(result.percentage).toBe(100)
		expect(result.bgClass).toBe('bg-app-success')
	})

	it('shows warning when most tasks land in wrong bands', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 15, actualDuration: 60 },  // Estimated Short, actual Long
			{ sizing: 30, actualDuration: 90 },  // Estimated Mid, actual VeryLong
			{ sizing: 60, actualDuration: 60 }   // Estimated Long, actual Long (correct)
		])

		// 1 of 3 correct = 33%
		expect(result.percentage).toBe(33)
		expect(result.bgClass).toBe('bg-app-danger')
	})

	it('shows moderate warning for mixed accuracy', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 30, actualDuration: 30 },  // Correct
			{ sizing: 60, actualDuration: 60 },  // Correct
			{ sizing: 15, actualDuration: 60 },  // Wrong
			{ sizing: 120, actualDuration: 50 }  // Wrong
		])

		// 2 of 4 correct = 50%
		expect(result.percentage).toBe(50)
		expect(result.bgClass).toBe('bg-app-warning')
	})

	it('ignores tasks without sizing', () => {
		const result = calcEstimationAccuracy([
			{ sizing: null, actualDuration: 30 },
			{ sizing: 60, actualDuration: 60 }
		])

		expect(result.taskCount).toBe(1)
		expect(result.percentage).toBe(100)
	})

	it('ignores tasks with zero sizing', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 0, actualDuration: 30 },
			{ sizing: 60, actualDuration: 45 }
		])

		expect(result.taskCount).toBe(1)
	})

	it('uses estimateBandsAtCompletion when available', () => {
		// Task was completed when bands were different
		const result = calcEstimationAccuracy([
			{
				sizing: 20,
				actualDuration: 18,
				estimateBandsAtCompletion: { short: 10, mid: 20, long: 40, veryLong: 80 }
			}
		])

		// With custom bands: midpoints at 15, 30, 60. 18min → mid(20) band. Sizing is 20. Match!
		expect(result.percentage).toBe(100)
	})

	it('falls back to default bands when estimateBandsAtCompletion is missing', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 30, actualDuration: 25 }  // Mid band with defaults, actual is Mid (25 >= 22.5)
		])

		expect(result.percentage).toBe(100)
	})
})
