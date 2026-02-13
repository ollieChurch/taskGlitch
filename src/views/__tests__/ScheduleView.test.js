import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'

// Mock vue-router
vi.mock('vue-router', () => ({
	useRouter: () => ({ push: vi.fn() }),
	useRoute: () => ({ path: '/schedule' })
}))

// Capture Firebase writes so we can inspect saved schedules
const mockSet = vi.fn(() => Promise.resolve())
vi.mock('firebase/database', () => ({
	getDatabase: vi.fn(),
	ref: vi.fn(),
	set: (...args) => mockSet(...args),
	remove: vi.fn(() => Promise.resolve())
}))

import { useTaskActions } from '@/composables/useTaskActions'

describe('ScheduleView — reschedule logic', () => {
	let store
	let actions

	beforeEach(() => {
		setActivePinia(createPinia())
		store = useAppStore()
		actions = useTaskActions()
		mockSet.mockClear()
	})

	function makeTask(id, name, sizing = 30) {
		return {
			id,
			name,
			sizing,
			priority: 1,
			type: null,
			score: 10
		}
	}

	function makeBreak(id) {
		return {
			id,
			name: 'Take a break',
			sizing: 10,
			type: store.taskType.systemBreak
		}
	}

	/**
	 * Simulates the reschedule logic from ScheduleView.
	 * We extract the core algorithm here to test it in isolation,
	 * mirroring exactly what the component method does.
	 */
	function simulateReschedule(schedule, activeTasks) {
		const taskType = store.taskType

		// Split completed vs remaining (same logic as ScheduleView.reschedule)
		// Snapshot display times on completed tasks so they survive the start time change
		const completedTasks = schedule.tasks.filter(t => {
			const isUserTask = t.type == null || t.type === taskType.userTask
			return isUserTask && !activeTasks.find(x => x.id === t.id)
		}).map(t => ({
			...t,
			completedTime: t.time || t.completedTime,
			completedDate: t.date || t.completedDate
		}))

		const remainingTasks = schedule.tasks.filter(t => {
			const isUserTask = t.type == null || t.type === taskType.userTask
			return isUserTask && activeTasks.find(x => x.id === t.id)
		})

		if (remainingTasks.length === 0) {
			return null // no-op
		}

		const now = new Date()
		const startDateTime = new Date(schedule.start)
		const isStartTimeInPast = now > startDateTime

		const calculatedTimes = actions.getScheduleTimes(
			schedule.start,
			isStartTimeInPast
				? now.toLocaleTimeString()
				: startDateTime.toLocaleTimeString(),
			null, // Don't maintain finish for test simplicity
			null
		)

		const scheduledRemaining = actions.getScheduleTasks(
			remainingTasks,
			calculatedTimes.sessionInMins,
			schedule.includeBreaks
		)

		// Set actualStartTime on first remaining user task
		const firstRemainingUserTask = scheduledRemaining.tasks.find(
			t => t.type == null || t.type === taskType.userTask
		)
		if (firstRemainingUserTask) {
			firstRemainingUserTask.actualStartTime = new Date().toISOString()
		}

		return {
			categoriesToInclude: schedule.categoriesToInclude,
			tasks: [...completedTasks, ...scheduledRemaining.tasks],
			start: calculatedTimes.start.toString(),
			finish: calculatedTimes.finish.toString(),
			includeBreaks: schedule.includeBreaks
		}
	}

	it('preserves completed tasks at the top of the rescheduled schedule', () => {
		const task1 = makeTask('task-1', 'Completed Task')
		const task2 = makeTask('task-2', 'Remaining Task A')
		const task3 = makeTask('task-3', 'Remaining Task B')

		const start = new Date()
		start.setHours(start.getHours() - 1)

		const schedule = {
			start: start.toString(),
			finish: new Date(start.getTime() + 240 * 60000).toString(),
			includeBreaks: false,
			categoriesToInclude: ['Work'],
			tasks: [task1, task2, task3]
		}

		// task-1 is completed (not in active backlog), task-2 and task-3 remain
		const activeTasks = [task2, task3]

		const result = simulateReschedule(schedule, activeTasks)

		expect(result).not.toBeNull()
		expect(result.tasks.length).toBeGreaterThanOrEqual(2)

		// First task should be the completed one
		expect(result.tasks[0].id).toBe('task-1')
		expect(result.tasks[0].name).toBe('Completed Task')

		// Remaining tasks should follow
		const remainingInResult = result.tasks.filter(t =>
			t.id === 'task-2' || t.id === 'task-3'
		)
		expect(remainingInResult.length).toBe(2)
	})

	it('removes old system breaks and regenerates new ones for remaining tasks', () => {
		const task1 = makeTask('task-1', 'Completed Task')
		const oldBreak = makeBreak('break-old')
		const task2 = makeTask('task-2', 'Remaining A', 60)
		const task3 = makeTask('task-3', 'Remaining B', 60)
		const task4 = makeTask('task-4', 'Remaining C', 60)

		const start = new Date()
		start.setHours(start.getHours() - 1)

		const schedule = {
			start: start.toString(),
			finish: new Date(start.getTime() + 480 * 60000).toString(),
			includeBreaks: true,
			categoriesToInclude: ['Work'],
			tasks: [task1, oldBreak, task2, task3, task4]
		}

		// task-1 completed, rest remaining
		const activeTasks = [task2, task3, task4]

		const result = simulateReschedule(schedule, activeTasks)

		// Old break should not be in result (it was a system break, filtered out)
		const oldBreakInResult = result.tasks.find(t => t.id === 'break-old')
		expect(oldBreakInResult).toBeUndefined()

		// Completed task should be first
		expect(result.tasks[0].id).toBe('task-1')
	})

	it('returns null (no-op) when all tasks are completed', () => {
		const task1 = makeTask('task-1', 'Done A')
		const task2 = makeTask('task-2', 'Done B')

		const schedule = {
			start: new Date().toString(),
			finish: new Date(Date.now() + 120 * 60000).toString(),
			includeBreaks: false,
			categoriesToInclude: ['Work'],
			tasks: [task1, task2]
		}

		// Both completed — not in active backlog
		const activeTasks = []

		const result = simulateReschedule(schedule, activeTasks)

		expect(result).toBeNull()
	})

	it('behaves like a full rebuild when nothing is completed', () => {
		const task1 = makeTask('task-1', 'Task A')
		const task2 = makeTask('task-2', 'Task B')
		const task3 = makeTask('task-3', 'Task C')

		const start = new Date()
		start.setHours(start.getHours() - 1)

		const schedule = {
			start: start.toString(),
			finish: new Date(start.getTime() + 240 * 60000).toString(),
			includeBreaks: false,
			categoriesToInclude: ['Work'],
			tasks: [task1, task2, task3]
		}

		// All still active
		const activeTasks = [task1, task2, task3]

		const result = simulateReschedule(schedule, activeTasks)

		expect(result).not.toBeNull()
		// No completed tasks at top, all should be remaining
		expect(result.tasks.length).toBe(3)
		expect(result.tasks.every(t =>
			t.type == null || t.type === store.taskType.userTask
		)).toBe(true)
	})

	it('sets actualStartTime on the first remaining user task', () => {
		const task1 = makeTask('task-1', 'Completed')
		const task2 = makeTask('task-2', 'Remaining')

		const start = new Date()
		start.setHours(start.getHours() - 1)

		const schedule = {
			start: start.toString(),
			finish: new Date(start.getTime() + 240 * 60000).toString(),
			includeBreaks: false,
			categoriesToInclude: ['Work'],
			tasks: [task1, task2]
		}

		const activeTasks = [task2]
		const beforeReschedule = new Date()

		const result = simulateReschedule(schedule, activeTasks)

		// The remaining task should have actualStartTime set
		const remainingTask = result.tasks.find(t => t.id === 'task-2')
		expect(remainingTask.actualStartTime).toBeDefined()

		const startTime = new Date(remainingTask.actualStartTime)
		expect(startTime.getTime()).toBeGreaterThanOrEqual(beforeReschedule.getTime() - 1000)
	})

	it('preserves categoriesToInclude and includeBreaks settings', () => {
		const task1 = makeTask('task-1', 'Completed')
		const task2 = makeTask('task-2', 'Remaining')

		const start = new Date()
		start.setHours(start.getHours() - 1)

		const schedule = {
			start: start.toString(),
			finish: new Date(start.getTime() + 240 * 60000).toString(),
			includeBreaks: true,
			categoriesToInclude: ['Work', 'Personal'],
			tasks: [task1, task2]
		}

		const activeTasks = [task2]

		const result = simulateReschedule(schedule, activeTasks)

		expect(result.categoriesToInclude).toEqual(['Work', 'Personal'])
		expect(result.includeBreaks).toBe(true)
	})

	it('stores completedTime and completedDate on completed tasks for display preservation', () => {
		const task1 = makeTask('task-1', 'Completed')
		task1.time = '2:00 PM'
		task1.date = 'Wed Feb 11 2026'
		const task2 = makeTask('task-2', 'Remaining')

		const start = new Date()
		start.setHours(start.getHours() - 1)

		const schedule = {
			start: start.toString(),
			finish: new Date(start.getTime() + 240 * 60000).toString(),
			includeBreaks: false,
			categoriesToInclude: ['Work'],
			tasks: [task1, task2]
		}

		const activeTasks = [task2]
		const result = simulateReschedule(schedule, activeTasks)

		const completedTask = result.tasks.find(t => t.id === 'task-1')
		expect(completedTask.completedTime).toBe('2:00 PM')
		expect(completedTask.completedDate).toBe('Wed Feb 11 2026')
	})

	it('handles schedule with only system breaks and completed tasks correctly', () => {
		const task1 = makeTask('task-1', 'Completed A')
		const task2 = makeTask('task-2', 'Completed B')
		const breakTask = makeBreak('break-1')

		const schedule = {
			start: new Date().toString(),
			finish: new Date(Date.now() + 120 * 60000).toString(),
			includeBreaks: true,
			categoriesToInclude: ['Work'],
			tasks: [task1, breakTask, task2]
		}

		// Both user tasks completed
		const activeTasks = []

		const result = simulateReschedule(schedule, activeTasks)

		// All done = no-op
		expect(result).toBeNull()
	})
})
