import { describe, it, expect } from 'vitest'

/**
 * Unit tests for the estimation accuracy logic used in DashboardView.
 * Extracted as a pure function to test independently of the component.
 */

function calcEstimationAccuracy(completedTasks) {
	const tracked = completedTasks.filter(
		t => t.actualDuration != null && t.sizing != null && t.sizing > 0
	)
	if (tracked.length === 0) return null

	const totalEstimated = tracked.reduce((sum, t) => sum + t.sizing, 0)
	const totalActual = tracked.reduce((sum, t) => sum + t.actualDuration, 0)

	const ratio = totalActual / totalEstimated
	const percentage = Math.round((1 - Math.abs(1 - ratio)) * 100)

	let summary, bgClass
	if (ratio > 1.1) {
		const overMins = totalActual - totalEstimated
		summary = `You tend to underestimate — tasks took ${overMins}m longer than expected`
		bgClass = 'bg-yellow-500'
	} else if (ratio < 0.9) {
		const underMins = totalEstimated - totalActual
		summary = `You tend to overestimate — tasks took ${underMins}m less than expected`
		bgClass = 'bg-blue-500'
	} else {
		summary = 'Your estimates are close to reality — nice work'
		bgClass = 'bg-green-500'
	}

	return { percentage: Math.max(0, percentage), taskCount: tracked.length, summary, bgClass }
}

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

	it('returns 100% when actual matches estimated exactly', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 30, actualDuration: 30 },
			{ sizing: 60, actualDuration: 60 }
		])

		expect(result.percentage).toBe(100)
		expect(result.bgClass).toBe('bg-green-500')
		expect(result.taskCount).toBe(2)
	})

	it('shows underestimate warning when tasks take much longer than expected', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 30, actualDuration: 60 }, // took double the estimate
		])

		expect(result.percentage).toBe(0)
		expect(result.bgClass).toBe('bg-yellow-500')
		expect(result.summary).toContain('underestimate')
		expect(result.summary).toContain('30m longer')
	})

	it('shows overestimate info when tasks take much less than expected', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 60, actualDuration: 30 }, // took half the estimate
		])

		expect(result.percentage).toBe(50)
		expect(result.bgClass).toBe('bg-blue-500')
		expect(result.summary).toContain('overestimate')
		expect(result.summary).toContain('30m less')
	})

	it('treats close estimates (within 10%) as accurate', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 100, actualDuration: 105 }
		])

		expect(result.percentage).toBe(95)
		expect(result.bgClass).toBe('bg-green-500')
		expect(result.summary).toContain('close to reality')
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

	it('clamps percentage to 0 minimum', () => {
		const result = calcEstimationAccuracy([
			{ sizing: 10, actualDuration: 100 } // 10x the estimate
		])

		expect(result.percentage).toBe(0)
	})
})
