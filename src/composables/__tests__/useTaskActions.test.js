import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'
import { set } from 'firebase/database'

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

		it('excludes manually blocked tasks', () => {
			const tasks = [
				{ id: 'a', name: 'A', sizing: 30, type: 'userTask', blocked: false },
				{ id: 'b', name: 'B', sizing: 30, type: 'userTask', blocked: true },
				{ id: 'c', name: 'C', sizing: 30, type: 'userTask', blocked: false }
			]
			const result = actions.getScheduleTasks(tasks, 120, false)

			const ids = result.tasks.map(t => t.id)
			expect(ids).toContain('a')
			expect(ids).not.toContain('b')
			expect(ids).toContain('c')
		})

		it('schedules both prerequisite and dependent when both are active (same session)', () => {
			// A and B both active; B depends on A — both should be scheduled with A first
			store.setTasks({
				a: { id: 'a', name: 'A', sizing: 30, type: 'userTask' },
				b: { id: 'b', name: 'B', sizing: 30, type: 'userTask', dependsOn: ['a'] }
			})

			const tasks = store.getPrioritisedTasks
			const result = actions.getScheduleTasks(tasks, 120, false)

			const ids = result.tasks.map(t => t.id)
			expect(ids).toContain('a')
			expect(ids).toContain('b')
		})

		it('excludes dependent when its prerequisite is manually blocked (not schedulable)', () => {
			// A is manually blocked so excluded; B depends on A so B is also excluded
			store.setTasks({
				a: { id: 'a', name: 'A', sizing: 30, type: 'userTask', blocked: true },
				b: { id: 'b', name: 'B', sizing: 30, type: 'userTask', dependsOn: ['a'] }
			})

			const tasks = store.getPrioritisedTasks
			const result = actions.getScheduleTasks(tasks, 120, false)

			const ids = result.tasks.map(t => t.id)
			expect(ids).not.toContain('a')
			expect(ids).not.toContain('b')
		})

		it('includes dependent when its prerequisite is already completed', () => {
			store.setTasks({
				b: { id: 'b', name: 'B', sizing: 30, type: 'userTask', dependsOn: ['a'] }
			})
			store.setCompleted({
				a: { id: 'a', name: 'A', sizing: 30, type: 'userTask', completedDateTime: new Date().toJSON() }
			})

			const tasks = store.getPrioritisedTasks
			const result = actions.getScheduleTasks(tasks, 60, false)

			expect(result.tasks.map(t => t.id)).toContain('b')
		})

		it('schedules prerequisite before dependent task', () => {
			store.setTasks({
				a: { id: 'a', name: 'A', sizing: 30, type: 'userTask', score: 10 },
				b: { id: 'b', name: 'B', sizing: 30, type: 'userTask', score: 5, dependsOn: ['a'] }
			})

			// Pass tasks in score order (B first since lower score = higher priority),
			// but B depends on A so A must appear first after topo sort
			const tasks = store.getPrioritisedTasks
			const result = actions.getScheduleTasks(tasks, 120, false)

			const ids = result.tasks.filter(t => t.type === 'userTask').map(t => t.id)
			expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'))
		})

		it('handles a chain A -> B -> C in correct order', () => {
			store.setTasks({
				a: { id: 'a', name: 'A', sizing: 30, type: 'userTask', score: 10 },
				b: { id: 'b', name: 'B', sizing: 30, type: 'userTask', score: 5, dependsOn: ['a'] },
				c: { id: 'c', name: 'C', sizing: 30, type: 'userTask', score: 1, dependsOn: ['b'] }
			})

			const tasks = store.getPrioritisedTasks
			const result = actions.getScheduleTasks(tasks, 180, false)

			const ids = result.tasks.map(t => t.id)
			expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'))
			expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('c'))
		})
	})

	describe('detectCircularDependency', () => {
		const makeTask = (id, dependsOn = []) => ({ id, name: id, dependsOn })

		it('returns false when there are no deps', () => {
			const tasks = [makeTask('a'), makeTask('b')]
			expect(actions.detectCircularDependency('a', [], tasks)).toBe(false)
		})

		it('returns false for a valid dependency (B depends on A)', () => {
			const tasks = [makeTask('a'), makeTask('b')]
			expect(actions.detectCircularDependency('b', ['a'], tasks)).toBe(false)
		})

		it('returns true for a direct self-dependency', () => {
			const tasks = [makeTask('a')]
			expect(actions.detectCircularDependency('a', ['a'], tasks)).toBe(true)
		})

		it('returns true for a two-task cycle (A->B, B->A)', () => {
			// A already depends on B; now trying to make B depend on A
			const tasks = [makeTask('a', ['b']), makeTask('b')]
			expect(actions.detectCircularDependency('b', ['a'], tasks)).toBe(true)
		})

		it('returns true for an indirect cycle in a chain (A->B->C, C->A)', () => {
			// A->B->C already exists; trying to add C depends on A
			const tasks = [makeTask('a'), makeTask('b', ['a']), makeTask('c', ['b'])]
			expect(actions.detectCircularDependency('a', ['c'], tasks)).toBe(true)
		})

		it('returns false for a valid diamond dependency (A->B, A->C, both->D)', () => {
			const tasks = [makeTask('a'), makeTask('b', ['a']), makeTask('c', ['a']), makeTask('d')]
			// Making D depend on B and C is not circular
			expect(actions.detectCircularDependency('d', ['b', 'c'], tasks)).toBe(false)
		})

		it('returns false when proposedDeps do not reach the task', () => {
			const tasks = [makeTask('a'), makeTask('b'), makeTask('c', ['b'])]
			// C depends on B; B has no deps; making A depend on C is fine
			expect(actions.detectCircularDependency('a', ['c'], tasks)).toBe(false)
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

		it('uses effective deadline when recurrence.deadlineDays is set', () => {
			const today = new Date()
			today.setHours(0, 0, 0, 0)

			// Task with targetDateTime = today, deadlineDays = 3 → effective deadline 3 days out
			const taskWithDeadlineDays = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: today.toISOString(),
				isHardDeadline: false,
				recurrence: { type: 'daily', interval: 1, deadlineDays: 3 }
			}

			// Task with targetDateTime = 3 days out, no deadlineDays
			const threeDaysOut = new Date(today)
			threeDaysOut.setDate(threeDaysOut.getDate() + 3)
			const taskWithDirectDeadline = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: threeDaysOut.toISOString(),
				isHardDeadline: false
			}

			const scoreWithDays = actions.scorePriority(taskWithDeadlineDays)
			const scoreWithDirect = actions.scorePriority(taskWithDirectDeadline)

			// Both should have similar scores since effective deadline is the same
			expect(scoreWithDays).toBeCloseTo(scoreWithDirect, 1)
		})

		it('ignores deadlineDays when null', () => {
			const tomorrow = new Date()
			tomorrow.setDate(tomorrow.getDate() + 1)

			const taskNullDeadlineDays = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: tomorrow.toISOString(),
				isHardDeadline: false,
				recurrence: { type: 'daily', interval: 1, deadlineDays: null }
			}

			const taskNoRecurrence = {
				priority: 2,
				createdDateTime: new Date().toJSON(),
				targetDateTime: tomorrow.toISOString(),
				isHardDeadline: false
			}

			const scoreNull = actions.scorePriority(taskNullDeadlineDays)
			const scoreNone = actions.scorePriority(taskNoRecurrence)

			expect(scoreNull).toBe(scoreNone)
		})
	})

	describe('calculateNextOccurrence', () => {
		// Use a fixed Monday as the reference date
		const monday = new Date('2026-03-02T00:00:00.000Z') // Monday

		it('daily interval=1 returns the next day', () => {
			const result = actions.calculateNextOccurrence({ type: 'daily', interval: 1 }, monday)
			const next = new Date(result)
			expect(next.getUTCDate()).toBe(3) // Tuesday
		})

		it('daily interval=3 returns 3 days ahead', () => {
			const result = actions.calculateNextOccurrence({ type: 'daily', interval: 3 }, monday)
			const next = new Date(result)
			expect(next.getUTCDate()).toBe(5) // Thursday
		})

		it('weekly on a single day returns the next occurrence of that day', () => {
			// From Monday, next Wednesday (day 3)
			const result = actions.calculateNextOccurrence(
				{ type: 'weekly', interval: 1, daysOfWeek: [3] }, // Wednesday
				monday
			)
			const next = new Date(result)
			expect(next.getDay()).toBe(3) // Wednesday
			expect(next > monday).toBe(true)
		})

		it('weekly on multiple days returns the soonest upcoming day', () => {
			// From Monday, soonest of Wed(3) and Fri(5) should be Wednesday
			const result = actions.calculateNextOccurrence(
				{ type: 'weekly', interval: 1, daysOfWeek: [3, 5] },
				monday
			)
			const next = new Date(result)
			expect(next.getDay()).toBe(3) // Wednesday is soonest
		})

		it('weekly interval=2 returns at least 8 days ahead', () => {
			const result = actions.calculateNextOccurrence(
				{ type: 'weekly', interval: 2, daysOfWeek: [1] }, // Monday
				monday
			)
			const next = new Date(result)
			const diffDays = (next - monday) / (1000 * 60 * 60 * 24)
			expect(diffDays).toBeGreaterThanOrEqual(8) // at least next week +1
			expect(next.getDay()).toBe(1) // still a Monday
		})

		it('monthly interval=1 returns the same day next month', () => {
			const result = actions.calculateNextOccurrence(
				{ type: 'monthly', interval: 1, dayOfMonth: 15 },
				new Date('2026-03-10')
			)
			const next = new Date(result)
			expect(next.getMonth()).toBe(3) // April (0-indexed)
			expect(next.getDate()).toBe(15)
		})

		it('monthly caps to last day of month when dayOfMonth overflows', () => {
			// dayOfMonth=31 in April (30 days) should give April 30
			const result = actions.calculateNextOccurrence(
				{ type: 'monthly', interval: 1, dayOfMonth: 31 },
				new Date('2026-03-10')
			)
			const next = new Date(result)
			expect(next.getMonth()).toBe(3) // April
			expect(next.getDate()).toBe(30) // last day of April
		})

		it('monthly handles day 31 from Jan to Feb correctly', () => {
			// Jan 31 + 1 month with dayOfMonth=31 → Feb 28 (not March 31)
			const result = actions.calculateNextOccurrence(
				{ type: 'monthly', interval: 1, dayOfMonth: 31 },
				new Date('2026-01-31')
			)
			const next = new Date(result)
			expect(next.getMonth()).toBe(1) // February
			expect(next.getDate()).toBe(28) // last day of Feb 2026
		})

		it('monthly handles day 29 from Jan to Feb in non-leap year', () => {
			const result = actions.calculateNextOccurrence(
				{ type: 'monthly', interval: 1, dayOfMonth: 29 },
				new Date('2026-01-15')
			)
			const next = new Date(result)
			expect(next.getMonth()).toBe(1) // February
			expect(next.getDate()).toBe(28) // 2026 is not a leap year
		})
	})

	describe('shouldCreateNextInstance', () => {
		it('returns true when there are no end conditions', () => {
			const task = {
				recurrence: { endDate: null, endAfterCount: null },
				recurrenceCount: 0
			}
			expect(actions.shouldCreateNextInstance(task)).toBe(true)
		})

		it('returns false when endDate has passed', () => {
			const task = {
				recurrence: { endDate: new Date('2020-01-01').toISOString(), endAfterCount: null },
				recurrenceCount: 0
			}
			expect(actions.shouldCreateNextInstance(task)).toBe(false)
		})

		it('returns true when endDate is in the future', () => {
			const future = new Date()
			future.setFullYear(future.getFullYear() + 1)
			const task = {
				recurrence: { endDate: future.toISOString(), endAfterCount: null },
				recurrenceCount: 0
			}
			expect(actions.shouldCreateNextInstance(task)).toBe(true)
		})

		it('returns false when endAfterCount has been reached', () => {
			const task = {
				recurrence: { endDate: null, endAfterCount: 3 },
				recurrenceCount: 3
			}
			expect(actions.shouldCreateNextInstance(task)).toBe(false)
		})

		it('returns true when recurrenceCount is below endAfterCount', () => {
			const task = {
				recurrence: { endDate: null, endAfterCount: 3 },
				recurrenceCount: 2
			}
			expect(actions.shouldCreateNextInstance(task)).toBe(true)
		})

		it('returns false when recurrence is null', () => {
			const task = { recurrence: null }
			expect(actions.shouldCreateNextInstance(task)).toBe(false)
		})
	})

	describe('buildRecurringInstance', () => {
		const baseTask = {
			id: 'original-id',
			name: 'Daily standup',
			priority: 1,
			sizing: 30,
			category: 'Work',
			isHardDeadline: false,
			recurrence: { type: 'daily', interval: 1, endDate: null, endAfterCount: null, catchUpMissed: false },
			recurrenceParentId: null,
			recurrenceCount: 0,
			createdDateTime: new Date('2026-03-01').toJSON(),
			targetDateTime: new Date('2026-03-02').toJSON()
		}

		it('generates a new unique id', () => {
			const instance = actions.buildRecurringInstance(baseTask, new Date('2026-03-03').toISOString())
			expect(instance.id).not.toBe(baseTask.id)
			expect(typeof instance.id).toBe('string')
		})

		it('sets recurrenceParentId to the original task id on first recurrence', () => {
			const instance = actions.buildRecurringInstance(baseTask, new Date('2026-03-03').toISOString())
			expect(instance.recurrenceParentId).toBe('original-id')
		})

		it('preserves recurrenceParentId from parent on subsequent recurrences', () => {
			const secondTask = { ...baseTask, id: 'instance-1', recurrenceParentId: 'original-id', recurrenceCount: 1 }
			const instance = actions.buildRecurringInstance(secondTask, new Date('2026-03-04').toISOString())
			expect(instance.recurrenceParentId).toBe('original-id')
		})

		it('increments recurrenceCount', () => {
			const instance = actions.buildRecurringInstance(baseTask, new Date('2026-03-03').toISOString())
			expect(instance.recurrenceCount).toBe(1)
		})

		it('copies name, priority, sizing, category, and recurrence from parent', () => {
			const instance = actions.buildRecurringInstance(baseTask, new Date('2026-03-03').toISOString())
			expect(instance.name).toBe(baseTask.name)
			expect(instance.priority).toBe(baseTask.priority)
			expect(instance.sizing).toBe(baseTask.sizing)
			expect(instance.category).toBe(baseTask.category)
			expect(instance.recurrence).toEqual(baseTask.recurrence)
		})

		it('resets completion and blocking fields', () => {
			const instance = actions.buildRecurringInstance(baseTask, new Date('2026-03-03').toISOString())
			expect(instance.completedDateTime).toBeNull()
			expect(instance.actualStartTime).toBeNull()
			expect(instance.actualDuration).toBeNull()
			expect(instance.blocked).toBe(false)
			expect(instance.blockedReason).toBeNull()
			expect(instance.dependsOn).toEqual([])
		})

		it('sets the provided targetDateTime', () => {
			const target = new Date('2026-03-03').toISOString()
			const instance = actions.buildRecurringInstance(baseTask, target)
			expect(instance.targetDateTime).toBe(target)
		})

		it('does not copy isHardDeadline when no deadlineDays', () => {
			const hardDeadlineTask = { ...baseTask, isHardDeadline: true }
			const instance = actions.buildRecurringInstance(hardDeadlineTask, new Date('2026-03-03').toISOString())
			expect(instance.isHardDeadline).toBe(false)
		})

		it('copies deadlineIsHard when deadlineDays is set', () => {
			const taskWithDeadline = {
				...baseTask,
				recurrence: { ...baseTask.recurrence, deadlineDays: 5, deadlineIsHard: true }
			}
			const instance = actions.buildRecurringInstance(taskWithDeadline, new Date('2026-03-03').toISOString())
			expect(instance.isHardDeadline).toBe(true)
		})

		it('sets isHardDeadline false when deadlineDays set but deadlineIsHard false', () => {
			const taskWithDeadline = {
				...baseTask,
				recurrence: { ...baseTask.recurrence, deadlineDays: 3, deadlineIsHard: false }
			}
			const instance = actions.buildRecurringInstance(taskWithDeadline, new Date('2026-03-03').toISOString())
			expect(instance.isHardDeadline).toBe(false)
		})
	})

	describe('moveTask recurrence', () => {
		const makeRecurringTask = (overrides = {}) => ({
			id: 'task-1',
			name: 'Daily standup',
			priority: 1,
			sizing: 30,
			category: 'Work',
			isHardDeadline: false,
			blocked: false,
			dependsOn: [],
			recurrence: { type: 'daily', interval: 1, endDate: null, endAfterCount: null, catchUpMissed: false },
			recurrenceParentId: null,
			recurrenceCount: 0,
			createdDateTime: new Date().toJSON(),
			targetDateTime: new Date().toJSON(),
			completedDateTime: null,
			actualStartTime: null,
			actualDuration: null,
			score: 10,
			type: 'userTask',
			...overrides
		})

		beforeEach(() => {
			vi.mocked(set).mockClear()
			store.user = { uid: 'user-1' }
		})

		it('calls set twice when completing a recurring task (once for new instance, once for completed task)', async () => {
			const task = makeRecurringTask()
			store.setTasks({ 'task-1': task })

			await actions.moveTask(task, 'completed')

			// set called for: new instance + completed task
			expect(vi.mocked(set).mock.calls.length).toBeGreaterThanOrEqual(2)
		})

		it('does not create a new instance when endAfterCount has been reached', async () => {
			const task = makeRecurringTask({
				recurrence: { type: 'daily', interval: 1, endDate: null, endAfterCount: 2, catchUpMissed: false },
				recurrenceCount: 2
			})
			store.setTasks({ 'task-1': task })

			vi.mocked(set).mockClear()
			await actions.moveTask(task, 'completed')

			// set should only be called once: for the completed task itself (not a new instance)
			const taskWriteCalls = vi.mocked(set).mock.calls
			// The completed task write goes to 'completed/...' path
			// Verify no write went to 'tasks/...' with a new id
			const tasksWrites = taskWriteCalls.filter(call => {
				const refArg = call[0]
				return refArg && String(refArg).includes?.('tasks')
			})
			// Should have no new task instance writes (rescoreActiveBacklog may write but store.tasks will be empty)
			expect(vi.mocked(set).mock.calls.length).toBe(1) // only the completed task
		})

		it('does not create a new instance for non-recurring tasks', async () => {
			const task = makeRecurringTask({ recurrence: null })
			store.setTasks({ 'task-1': task })

			vi.mocked(set).mockClear()
			await actions.moveTask(task, 'completed')

			// Only one set call: the completed task
			expect(vi.mocked(set).mock.calls.length).toBe(1)
		})
	})

	describe('getVisibleTasks', () => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)

		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		const makeTask = (overrides = {}) => ({
			id: 'task-1',
			name: 'Test task',
			priority: 1,
			sizing: 30,
			category: 'Work',
			score: 10,
			type: 'userTask',
			blocked: false,
			dependsOn: [],
			recurrence: null,
			recurrenceParentId: null,
			recurrenceCount: 0,
			createdDateTime: new Date().toJSON(),
			targetDateTime: null,
			completedDateTime: null,
			...overrides
		})

		it('shows tasks with no recurrence', () => {
			store.setTasks({ 'task-1': makeTask() })
			expect(store.getVisibleTasks).toHaveLength(1)
		})

		it('shows recurring tasks with today targetDateTime', () => {
			store.setTasks({
				'task-1': makeTask({
					recurrenceParentId: 'parent-1',
					targetDateTime: today.toISOString()
				})
			})
			expect(store.getVisibleTasks).toHaveLength(1)
		})

		it('shows recurring tasks with past targetDateTime', () => {
			store.setTasks({
				'task-1': makeTask({
					recurrenceParentId: 'parent-1',
					targetDateTime: yesterday.toISOString()
				})
			})
			expect(store.getVisibleTasks).toHaveLength(1)
		})

		it('hides recurring tasks with future targetDateTime', () => {
			store.setTasks({
				'task-1': makeTask({
					recurrenceParentId: 'parent-1',
					targetDateTime: tomorrow.toISOString()
				})
			})
			expect(store.getVisibleTasks).toHaveLength(0)
		})

		it('shows the original recurring task even with future targetDateTime', () => {
			store.setTasks({
				'task-1': makeTask({
					recurrenceParentId: null,
					targetDateTime: tomorrow.toISOString(),
					recurrence: { type: 'daily', interval: 1 }
				})
			})
			expect(store.getVisibleTasks).toHaveLength(1)
		})

		it('cascades to getPrioritisedTasks', () => {
			store.setTasks({
				'visible': makeTask({ id: 'visible', score: 5 }),
				'hidden': makeTask({
					id: 'hidden',
					score: 1,
					recurrenceParentId: 'parent-1',
					targetDateTime: tomorrow.toISOString()
				})
			})
			const ids = store.getPrioritisedTasks.map(t => t.id)
			expect(ids).toContain('visible')
			expect(ids).not.toContain('hidden')
		})

		it('cascades to getCategories', () => {
			store.setTasks({
				'visible': makeTask({ id: 'visible', category: 'Work' }),
				'hidden': makeTask({
					id: 'hidden',
					category: 'Hidden Category',
					recurrenceParentId: 'parent-1',
					targetDateTime: tomorrow.toISOString()
				})
			})
			expect(store.getCategories).toContain('Work')
			expect(store.getCategories).not.toContain('Hidden Category')
		})

		it('cascades to getTasksInCreatedOrder', () => {
			store.setTasks({
				'visible': makeTask({ id: 'visible' }),
				'hidden': makeTask({
					id: 'hidden',
					recurrenceParentId: 'parent-1',
					targetDateTime: tomorrow.toISOString()
				})
			})
			const ids = store.getTasksInCreatedOrder.map(t => t.id)
			expect(ids).toContain('visible')
			expect(ids).not.toContain('hidden')
		})
	})
})
