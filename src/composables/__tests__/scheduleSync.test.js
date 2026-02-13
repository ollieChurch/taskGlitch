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

describe('Schedule Sync Functions', () => {
	let store
	let actions

	const makeScheduleTask = (overrides = {}) => ({
		id: 'task-1',
		name: 'Test Task',
		sizing: 30,
		priority: 1,
		category: 'work',
		type: 'userTask',
		targetDateTime: null,
		isHardDeadline: false,
		completed: false,
		actualStartTime: '2025-01-15T09:00:00.000Z',
		...overrides
	})

	const makeSchedule = (tasks = [], extras = {}) => ({
		tasks,
		...extras
	})

	beforeEach(() => {
		setActivePinia(createPinia())
		store = useAppStore()
		actions = useTaskActions()
	})

	describe('findTaskInSchedule', () => {
		it('returns -1 when schedule has no tasks', () => {
			store.schedule = {}

			const result = actions.findTaskInSchedule('task-1')

			expect(result).toBe(-1)
		})

		it('returns -1 when task not found', () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-2' }),
				makeScheduleTask({ id: 'task-3' })
			])

			const result = actions.findTaskInSchedule('task-99')

			expect(result).toBe(-1)
		})

		it('returns correct index when task found', () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-a' }),
				makeScheduleTask({ id: 'task-b' }),
				makeScheduleTask({ id: 'task-c' })
			])

			expect(actions.findTaskInSchedule('task-a')).toBe(0)
			expect(actions.findTaskInSchedule('task-b')).toBe(1)
			expect(actions.findTaskInSchedule('task-c')).toBe(2)
		})
	})

	describe('syncTaskToSchedule', () => {
		it('returns inSchedule false when task not in schedule', () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-other' })
			])

			const updatedTask = makeScheduleTask({ id: 'task-missing' })
			const result = actions.syncTaskToSchedule(updatedTask)

			expect(result).toEqual({ inSchedule: false })
		})

		it('returns inSchedule false when schedule has no tasks', () => {
			store.schedule = {}

			const updatedTask = makeScheduleTask({ id: 'task-1' })
			const result = actions.syncTaskToSchedule(updatedTask)

			expect(result).toEqual({ inSchedule: false })
		})

		it('detects size change correctly', () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-1', sizing: 30 })
			])

			const updatedTask = makeScheduleTask({ id: 'task-1', sizing: 60 })
			const result = actions.syncTaskToSchedule(updatedTask)

			expect(result.inSchedule).toBe(true)
			expect(result.sizeChanged).toBe(true)
			expect(result.anyChanged).toBe(true)
		})

		it('detects name change correctly', () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-1', name: 'Original Name' })
			])

			const updatedTask = makeScheduleTask({ id: 'task-1', name: 'Updated Name' })
			const result = actions.syncTaskToSchedule(updatedTask)

			expect(result.inSchedule).toBe(true)
			expect(result.nameChanged).toBe(true)
			expect(result.anyChanged).toBe(true)
		})

		it('detects category change correctly', () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-1', category: 'work' })
			])

			const updatedTask = makeScheduleTask({ id: 'task-1', category: 'personal' })
			const result = actions.syncTaskToSchedule(updatedTask)

			expect(result.inSchedule).toBe(true)
			expect(result.categoryChanged).toBe(true)
			expect(result.anyChanged).toBe(true)
		})

		it('sets categoryMatchesFilter to false when category not in schedule filter', () => {
			store.schedule = makeSchedule(
				[makeScheduleTask({ id: 'task-1', category: 'work' })],
				{ categoriesToInclude: ['work', 'urgent'] }
			)

			const updatedTask = makeScheduleTask({ id: 'task-1', category: 'personal' })
			const result = actions.syncTaskToSchedule(updatedTask)

			expect(result.categoryMatchesFilter).toBe(false)
		})

		it('sets categoryMatchesFilter to true when no filter is set', () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-1', category: 'work' })
			])

			const updatedTask = makeScheduleTask({ id: 'task-1', category: 'anything' })
			const result = actions.syncTaskToSchedule(updatedTask)

			expect(result.categoryMatchesFilter).toBe(true)
		})

		it('sets categoryMatchesFilter to true when filter is empty array', () => {
			store.schedule = makeSchedule(
				[makeScheduleTask({ id: 'task-1', category: 'work' })],
				{ categoriesToInclude: [] }
			)

			const updatedTask = makeScheduleTask({ id: 'task-1', category: 'anything' })
			const result = actions.syncTaskToSchedule(updatedTask)

			expect(result.categoryMatchesFilter).toBe(true)
		})

		it('sets anyChanged to false when nothing changed', () => {
			const task = makeScheduleTask({ id: 'task-1', name: 'Same', sizing: 30, category: 'work' })
			store.schedule = makeSchedule([task])

			const updatedTask = makeScheduleTask({ id: 'task-1', name: 'Same', sizing: 30, category: 'work' })
			const result = actions.syncTaskToSchedule(updatedTask)

			expect(result.inSchedule).toBe(true)
			expect(result.sizeChanged).toBe(false)
			expect(result.nameChanged).toBe(false)
			expect(result.categoryChanged).toBe(false)
			expect(result.anyChanged).toBe(false)
		})
	})

	describe('applyScheduleUpdate', () => {
		it('updates task properties while preserving schedule fields like completed and actualStartTime', async () => {
			const scheduleTask = makeScheduleTask({
				id: 'task-1',
				name: 'Old Name',
				sizing: 30,
				priority: 1,
				category: 'work',
				completed: true,
				actualStartTime: '2025-01-15T09:00:00.000Z'
			})
			store.schedule = makeSchedule([scheduleTask])
			store.user = { uid: 'test-user' }

			const updatedTask = {
				id: 'task-1',
				name: 'New Name',
				sizing: 60,
				priority: 2,
				category: 'personal',
				targetDateTime: '2025-02-01T00:00:00.000Z',
				isHardDeadline: true
			}

			const result = await actions.applyScheduleUpdate(updatedTask)

			expect(result).toBe(true)

			// Verify the store was updated with merged data
			const updated = store.schedule.tasks[0]
			expect(updated.name).toBe('New Name')
			expect(updated.sizing).toBe(60)
			expect(updated.priority).toBe(2)
			expect(updated.category).toBe('personal')
			expect(updated.targetDateTime).toBe('2025-02-01T00:00:00.000Z')
			expect(updated.isHardDeadline).toBe(true)

			// Schedule-specific fields should be preserved
			expect(updated.completed).toBe(true)
			expect(updated.actualStartTime).toBe('2025-01-15T09:00:00.000Z')
		})

		it('with shouldRemove=true removes the task from schedule', async () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-1' }),
				makeScheduleTask({ id: 'task-2' })
			])
			store.user = { uid: 'test-user' }

			const taskToRemove = { id: 'task-1' }
			const result = await actions.applyScheduleUpdate(taskToRemove, true)

			expect(result).toBe(true)
			expect(store.schedule.tasks).toHaveLength(1)
			expect(store.schedule.tasks[0].id).toBe('task-2')
		})

		it('returns false when task not found', async () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-1' })
			])
			store.user = { uid: 'test-user' }

			const missingTask = { id: 'task-missing' }
			const result = await actions.applyScheduleUpdate(missingTask)

			expect(result).toBe(false)
		})

		it('returns false when schedule has no tasks', async () => {
			store.schedule = {}
			store.user = { uid: 'test-user' }

			const task = { id: 'task-1' }
			const result = await actions.applyScheduleUpdate(task)

			expect(result).toBe(false)
		})

		it('does not mutate the original store schedule directly', async () => {
			const originalTask = makeScheduleTask({ id: 'task-1', name: 'Original' })
			store.schedule = makeSchedule([originalTask])
			store.user = { uid: 'test-user' }

			// Capture a reference to the original tasks array
			const originalTasksRef = store.schedule.tasks

			const updatedTask = { id: 'task-1', name: 'Updated', sizing: 60, priority: 2, category: 'personal', targetDateTime: null, isHardDeadline: false }
			await actions.applyScheduleUpdate(updatedTask)

			// setSchedule replaces the schedule entirely, so the original reference should be stale
			expect(store.schedule.tasks).not.toBe(originalTasksRef)
		})
	})

	describe('removeTaskFromSchedule', () => {
		it('removes task and returns true', async () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-1' }),
				makeScheduleTask({ id: 'task-2' }),
				makeScheduleTask({ id: 'task-3' })
			])
			store.user = { uid: 'test-user' }

			const result = await actions.removeTaskFromSchedule('task-2')

			expect(result).toBe(true)
			expect(store.schedule.tasks).toHaveLength(2)
			expect(store.schedule.tasks.map(t => t.id)).toEqual(['task-1', 'task-3'])
		})

		it('returns false when task not found', async () => {
			store.schedule = makeSchedule([
				makeScheduleTask({ id: 'task-1' })
			])
			store.user = { uid: 'test-user' }

			const result = await actions.removeTaskFromSchedule('task-missing')

			expect(result).toBe(false)
			expect(store.schedule.tasks).toHaveLength(1)
		})

		it('returns false when schedule has no tasks', async () => {
			store.schedule = {}
			store.user = { uid: 'test-user' }

			const result = await actions.removeTaskFromSchedule('task-1')

			expect(result).toBe(false)
		})
	})
})
