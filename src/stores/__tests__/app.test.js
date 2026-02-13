import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'

describe('useAppStore', () => {
	let store

	beforeEach(() => {
		setActivePinia(createPinia())
		store = useAppStore()
	})

	describe('getSizeLabel', () => {
		it('returns Short for sizing 15', () => {
			expect(store.getSizeLabel(15)).toBe('Short')
		})

		it('returns Medium for sizing 30', () => {
			expect(store.getSizeLabel(30)).toBe('Medium')
		})

		it('returns Long for sizing 60', () => {
			expect(store.getSizeLabel(60)).toBe('Long')
		})

		it('returns Very Long for sizing 120', () => {
			expect(store.getSizeLabel(120)).toBe('Very Long')
		})

		it('returns fallback with mins suffix for unknown sizing', () => {
			expect(store.getSizeLabel(45)).toBe('45 mins')
		})
	})

	describe('showNotification / hideNotification', () => {
		it('sets visible to true with title and text', () => {
			store.showNotification({ title: 'Success', text: 'Task saved' })

			expect(store.notification.visible).toBe(true)
			expect(store.notification.title).toBe('Success')
			expect(store.notification.text).toBe('Task saved')
		})

		it('uses default autoDismissMs when not provided', () => {
			store.showNotification({ title: 'Info', text: 'Hello' })

			expect(store.notification.autoDismissMs).toBe(5000)
		})

		it('hideNotification sets visible to false', () => {
			store.showNotification({ title: 'Test', text: 'Visible' })
			expect(store.notification.visible).toBe(true)

			store.hideNotification()
			expect(store.notification.visible).toBe(false)
		})
	})

	describe('setPendingScheduleUpdate / clearPendingScheduleUpdate', () => {
		it('stores the task', () => {
			const task = { id: 'task-1', name: 'My Task' }
			store.setPendingScheduleUpdate(task)

			expect(store.pendingScheduleUpdate).toEqual(task)
		})

		it('clearPendingScheduleUpdate sets it to null', () => {
			store.setPendingScheduleUpdate({ id: 'task-1', name: 'My Task' })
			store.clearPendingScheduleUpdate()

			expect(store.pendingScheduleUpdate).toBeNull()
		})
	})

	describe('setSchedule', () => {
		it('stores the schedule', () => {
			const schedule = { tasks: [{ id: 'task-1' }], startTime: '09:00' }
			store.setSchedule(schedule)

			expect(store.schedule).toEqual(schedule)
		})

		it('sets updateScheduleStatus to true', () => {
			expect(store.updateScheduleStatus).toBe(false)

			store.setSchedule({ tasks: [] })

			expect(store.updateScheduleStatus).toBe(true)
		})
	})

	describe('setTasks', () => {
		it('sorts by targetDateTime then priority', () => {
			const payload = {
				a: { id: 'a', targetDateTime: '2025-03-01T00:00:00Z', priority: 2 },
				b: { id: 'b', targetDateTime: '2025-01-01T00:00:00Z', priority: 1 },
				c: { id: 'c', targetDateTime: '2025-01-01T00:00:00Z', priority: 3 },
				d: { id: 'd', targetDateTime: '2025-02-01T00:00:00Z', priority: 0 }
			}

			store.setTasks(payload)

			expect(store.tasks[0].id).toBe('b') // earliest date, lower priority value
			expect(store.tasks[1].id).toBe('c') // earliest date, higher priority value
			expect(store.tasks[2].id).toBe('d') // middle date
			expect(store.tasks[3].id).toBe('a') // latest date
		})

		it('handles null payload gracefully', () => {
			store.setTasks(null)

			// tasks should remain at default (empty array) without throwing
			expect(store.tasks).toEqual([])
		})
	})

	describe('setCompleted', () => {
		it('sorts by completedDateTime descending', () => {
			const payload = {
				a: { id: 'a', completedDateTime: '2025-01-10T12:00:00Z' },
				b: { id: 'b', completedDateTime: '2025-03-15T12:00:00Z' },
				c: { id: 'c', completedDateTime: '2025-02-20T12:00:00Z' }
			}

			store.setCompleted(payload)

			expect(store.completed[0].id).toBe('b') // most recent
			expect(store.completed[1].id).toBe('c')
			expect(store.completed[2].id).toBe('a') // oldest
		})
	})
})
