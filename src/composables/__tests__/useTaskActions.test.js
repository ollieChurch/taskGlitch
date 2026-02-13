import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'

// Mock vue-router since useTaskActions calls useRouter()
vi.mock('vue-router', () => ({
	useRouter: () => ({
		push: vi.fn()
	})
}))

// Mock Firebase to avoid real DB calls
vi.mock('firebase/database', () => ({
	getDatabase: vi.fn(),
	ref: vi.fn(),
	set: vi.fn(() => Promise.resolve()),
	remove: vi.fn(() => Promise.resolve())
}))

import { useTaskActions } from '@/composables/useTaskActions'

describe('useTaskActions', () => {
	let store
	let actions

	beforeEach(() => {
		setActivePinia(createPinia())
		store = useAppStore()
		actions = useTaskActions()
	})

	describe('getScheduleTimes', () => {
		it('calculates session duration in minutes', () => {
			const result = actions.getScheduleTimes(
				new Date('2025-01-15').toString(),
				'09:00:00',
				'12:00:00'
			)

			expect(result.sessionInMins).toBe(180)
		})

		it('handles overnight sessions (to time < from time)', () => {
			const result = actions.getScheduleTimes(
				new Date('2025-01-15').toString(),
				'22:00:00',
				'02:00:00'
			)

			expect(result.sessionInMins).toBe(240)
		})

		it('returns start and finish as Date objects', () => {
			const result = actions.getScheduleTimes(
				new Date('2025-01-15').toString(),
				'09:00:00',
				'12:00:00'
			)

			expect(result.start).toBeInstanceOf(Date)
			expect(result.finish).toBeInstanceOf(Date)
		})

		it('uses fromTime as toTime when toTime is null', () => {
			const result = actions.getScheduleTimes(
				new Date('2025-01-15').toString(),
				'09:00:00',
				null
			)

			// When toTime is null, session from 09:00 to 09:00 next day = 1440 mins
			expect(result.sessionInMins).toBe(1440)
		})

		it('respects finishDate parameter for multi-day sessions', () => {
			const result = actions.getScheduleTimes(
				new Date('2025-01-15').toString(),
				'09:00:00',
				'17:00:00',
				new Date('2025-01-16').toString()
			)

			// 15th 09:00 to 16th 17:00 = 32 hours = 1920 mins
			expect(result.sessionInMins).toBe(1920)
		})
	})

	describe('getScheduleTasks', () => {
		const makeTasks = (count) => {
			return Array.from({ length: count }, (_, i) => ({
				id: `task-${i}`,
				name: `Task ${i}`,
				sizing: 30,
				priority: 1,
				type: 'userTask'
			}))
		}

		it('allocates tasks that fit within session duration', () => {
			const tasks = makeTasks(5)
			const result = actions.getScheduleTasks(tasks, 90, false)

			expect(result.tasks).toHaveLength(3)
			expect(result.totalTaskTime).toBe(90)
		})

		it('returns empty schedule when session is too short for any task', () => {
			const tasks = makeTasks(3)
			const result = actions.getScheduleTasks(tasks, 10, false)

			expect(result.tasks).toHaveLength(0)
			expect(result.totalTaskTime).toBe(0)
		})

		it('returns all tasks when session is longer than total task time', () => {
			const tasks = makeTasks(3)
			const result = actions.getScheduleTasks(tasks, 300, false)

			expect(result.tasks).toHaveLength(3)
			expect(result.totalTaskTime).toBe(90)
		})

		it('inserts breaks at configured frequency when includeBreaks is true', () => {
			// Default break frequency is 120 mins, break length is 10 mins
			const tasks = Array.from({ length: 10 }, (_, i) => ({
				id: `task-${i}`,
				name: `Task ${i}`,
				sizing: 30,
				priority: 1,
				type: 'userTask'
			}))

			const result = actions.getScheduleTasks(tasks, 300, true)

			const breaks = result.tasks.filter(t => t.type === 'systemBreak')
			expect(breaks.length).toBeGreaterThan(0)
			expect(breaks[0].name).toBe('Take a break')
		})

		it('does not insert breaks when includeBreaks is false', () => {
			const tasks = makeTasks(10)
			const result = actions.getScheduleTasks(tasks, 300, false)

			const breaks = result.tasks.filter(t => t.type === 'systemBreak')
			expect(breaks).toHaveLength(0)
		})

		it('does not end schedule with a break', () => {
			// 4 tasks * 30 mins = 120 mins, which equals break frequency
			// A break would normally be inserted after 120 mins but should be stripped if last
			const tasks = makeTasks(4)
			const result = actions.getScheduleTasks(tasks, 150, true)

			const lastTask = result.tasks[result.tasks.length - 1]
			expect(lastTask.type).not.toBe('systemBreak')
		})

		it('deep clones tasks to avoid reactive proxy issues', () => {
			const tasks = makeTasks(2)
			const result = actions.getScheduleTasks(tasks, 120, false)

			// Modifying the result should not affect the input
			result.tasks[0].name = 'Modified'
			expect(tasks[0].name).toBe('Task 0')
		})

		it('handles empty task list', () => {
			const result = actions.getScheduleTasks([], 120, false)

			expect(result.tasks).toHaveLength(0)
			expect(result.totalTaskTime).toBe(0)
		})
	})

	describe('scorePriority', () => {
		it('gives lower scores to higher priority tasks (lower priority number)', () => {
			const today = new Date().toJSON()

			const criticalTask = {
				priority: 0,
				createdDateTime: today,
				targetDateTime: null
			}

			const lowTask = {
				priority: 3,
				createdDateTime: today,
				targetDateTime: null
			}

			const criticalScore = actions.scorePriority(criticalTask)
			const lowScore = actions.scorePriority(lowTask)

			expect(criticalScore).toBeLessThan(lowScore)
		})

		it('gives lower scores to older tasks (all else equal)', () => {
			const oldTask = {
				priority: 2,
				createdDateTime: new Date('2024-01-01').toJSON(),
				targetDateTime: null
			}

			const newTask = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: null
			}

			const oldScore = actions.scorePriority(oldTask)
			const newScore = actions.scorePriority(newTask)

			expect(oldScore).toBeLessThan(newScore)
		})

		it('gives lower scores to tasks with nearer deadlines', () => {
			const tomorrow = new Date()
			tomorrow.setDate(tomorrow.getDate() + 1)

			const nextMonth = new Date()
			nextMonth.setDate(nextMonth.getDate() + 30)

			const urgentTask = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: tomorrow.toJSON(),
				isHardDeadline: false
			}

			const laterTask = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: nextMonth.toJSON(),
				isHardDeadline: false
			}

			const urgentScore = actions.scorePriority(urgentTask)
			const laterScore = actions.scorePriority(laterTask)

			expect(urgentScore).toBeLessThan(laterScore)
		})

		it('gives lower scores to hard deadlines vs soft deadlines', () => {
			const deadline = new Date()
			deadline.setDate(deadline.getDate() + 10)

			const hardTask = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: deadline.toJSON(),
				isHardDeadline: true
			}

			const softTask = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: deadline.toJSON(),
				isHardDeadline: false
			}

			const hardScore = actions.scorePriority(hardTask)
			const softScore = actions.scorePriority(softTask)

			expect(hardScore).toBeLessThan(softScore)
		})

		it('handles tasks with no deadline', () => {
			const task = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: null
			}

			const score = actions.scorePriority(task)
			expect(score).toBeTypeOf('number')
			expect(isNaN(score)).toBe(false)
		})

		it('treats far-future deadlines (>60 days) like no-deadline tasks', () => {
			const farFuture = new Date()
			farFuture.setDate(farFuture.getDate() + 90)

			const farDeadlineTask = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: farFuture.toJSON(),
				isHardDeadline: false
			}

			const noDeadlineTask = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: null
			}

			const farScore = actions.scorePriority(farDeadlineTask)
			const noDeadlineScore = actions.scorePriority(noDeadlineTask)

			// Should use the same formula (priorityScore + 30 - createdDateScore)
			expect(farScore).toBe(noDeadlineScore)
		})
	})
})
