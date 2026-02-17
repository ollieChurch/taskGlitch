import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'

// Mock vue-router
vi.mock('vue-router', () => ({
	useRouter: () => ({ push: vi.fn() })
}))

// Mock Firebase
vi.mock('firebase/database', () => ({
	getDatabase: vi.fn(),
	ref: vi.fn(),
	set: vi.fn(() => Promise.resolve()),
	remove: vi.fn(() => Promise.resolve())
}))

import TaskSchedule from '@/components/TaskSchedule.vue'

// Stub VueDraggable to avoid drag-and-drop complexity in tests
const VueDraggableStub = {
	name: 'VueDraggable',
	template: '<div><slot /></div>',
	props: ['modelValue', 'handle']
}

function makeSchedule(tasks, startOffset = 0) {
	const start = new Date()
	start.setMinutes(start.getMinutes() + startOffset)

	return {
		start: start.toString(),
		finish: new Date(start.getTime() + 180 * 60000).toString(),
		includeBreaks: false,
		tasks: tasks.map((t, i) => ({
			id: `task-${i}`,
			name: `Task ${i}`,
			sizing: 30,
			priority: 1,
			...t
		}))
	}
}

function mountSchedule(schedule, storeOverrides = {}) {
	const pinia = createPinia()
	setActivePinia(pinia)
	const store = useAppStore()

	store.schedule = schedule

	// Default: all tasks exist in active backlog (not completed)
	if (!storeOverrides.tasks) {
		store.tasks = schedule.tasks
			.filter(t => t.type == null || t.type === store.taskType.userTask)
			.map(t => ({ ...t }))
	} else {
		store.tasks = storeOverrides.tasks
	}

	if (storeOverrides.completed) {
		store.completed = storeOverrides.completed
	}

	const wrapper = mount(TaskSchedule, {
		global: {
			plugins: [pinia],
			stubs: {
				VueDraggable: VueDraggableStub
			}
		}
	})

	return { wrapper, store }
}

describe('TaskSchedule', () => {
	describe('scheduleDetails computed — active task derivation', () => {
		it('marks the first non-completed user task as active', () => {
			const schedule = makeSchedule([
				{ type: null },
				{ type: null },
				{ type: null }
			])

			const { wrapper } = mountSchedule(schedule)
			const details = wrapper.vm.scheduleDetails

			expect(details.tasks[0].isActive).toBe(true)
			expect(details.tasks[1].isActive).toBe(false)
			expect(details.tasks[2].isActive).toBe(false)
		})

		it('marks second task as active when first is completed', () => {
			const schedule = makeSchedule([
				{ id: 'done-1', type: null },
				{ id: 'active-1', type: null },
				{ id: 'pending-1', type: null }
			])

			// First task not in active backlog = completed
			const { wrapper } = mountSchedule(schedule, {
				tasks: [
					{ id: 'active-1', name: 'Task 1', sizing: 30, priority: 1 },
					{ id: 'pending-1', name: 'Task 2', sizing: 30, priority: 1 }
				]
			})

			const details = wrapper.vm.scheduleDetails

			expect(details.tasks[0].completed).toBe(true)
			expect(details.tasks[0].isActive).toBe(false)
			expect(details.tasks[1].completed).toBe(false)
			expect(details.tasks[1].isActive).toBe(true)
			expect(details.tasks[2].isActive).toBe(false)
		})

		it('marks no tasks as active when all are completed', () => {
			const schedule = makeSchedule([
				{ id: 'done-1', type: null },
				{ id: 'done-2', type: null }
			])

			// No tasks in active backlog = all completed
			const { wrapper } = mountSchedule(schedule, { tasks: [] })
			const details = wrapper.vm.scheduleDetails

			expect(details.tasks[0].isActive).toBe(false)
			expect(details.tasks[1].isActive).toBe(false)
			expect(details.tasks.every(t => t.completed)).toBe(true)
		})

		it('skips system breaks when determining active task', () => {
			const taskType = Object.freeze({ userTask: 'userTask', systemBreak: 'systemBreak' })

			const schedule = makeSchedule([
				{ id: 'done-1', type: null },
				{ id: 'break-1', type: taskType.systemBreak, name: 'Take a break' },
				{ id: 'active-1', type: null }
			])

			// First user task completed, break in between
			const { wrapper } = mountSchedule(schedule, {
				tasks: [
					{ id: 'active-1', name: 'Task 2', sizing: 30, priority: 1 }
				]
			})

			const details = wrapper.vm.scheduleDetails
			const breakTask = details.tasks.find(t => t.id === 'break-1')
			const activeTask = details.tasks.find(t => t.id === 'active-1')

			expect(breakTask.isActive).toBe(false)
			expect(activeTask.isActive).toBe(true)
		})

		it('handles empty schedule gracefully', () => {
			const { wrapper } = mountSchedule({
				start: new Date().toString(),
				finish: new Date().toString(),
				tasks: []
			}, { tasks: [] })

			const details = wrapper.vm.scheduleDetails
			expect(details.tasks).toHaveLength(0)
		})
	})

	describe('scheduleDetails computed — time calculation', () => {
		it('assigns time strings to each task', () => {
			const schedule = makeSchedule([
				{ type: null, sizing: 30 },
				{ type: null, sizing: 45 }
			])

			const { wrapper } = mountSchedule(schedule)
			const details = wrapper.vm.scheduleDetails

			expect(details.tasks[0].time).toBeDefined()
			expect(details.tasks[1].time).toBeDefined()
			// Second task time should be different from first (offset by 30 mins)
			expect(details.tasks[0].time).not.toBe(details.tasks[1].time)
		})

		it('calculates estimated finish time', () => {
			const schedule = makeSchedule([
				{ type: null, sizing: 30 },
				{ type: null, sizing: 60 }
			])

			const { wrapper } = mountSchedule(schedule)
			const details = wrapper.vm.scheduleDetails

			expect(details.estimatedFinishTime).toBeDefined()
			expect(typeof details.estimatedFinishTime).toBe('string')
		})
	})

	describe('template — In Progress badge', () => {
		it('renders In Progress text for the active task', () => {
			const schedule = makeSchedule([
				{ type: null },
				{ type: null }
			])

			const { wrapper } = mountSchedule(schedule)

			expect(wrapper.text()).toContain('In Progress')
		})

		it('does not render In Progress when all tasks are completed', () => {
			const schedule = makeSchedule([
				{ id: 'done-1', type: null },
				{ id: 'done-2', type: null }
			])

			const { wrapper } = mountSchedule(schedule, { tasks: [] })

			expect(wrapper.text()).not.toContain('In Progress')
		})
	})

	describe('template — active task highlighting', () => {
		it('applies accent highlight class to active task card', () => {
			const schedule = makeSchedule([
				{ type: null },
				{ type: null }
			])

			const { wrapper } = mountSchedule(schedule)
			const cards = wrapper.findAll('.schedule-item')

			// First card should have the active highlight (bg-accent/10)
			const firstCardHtml = cards[0].html()
			expect(firstCardHtml).toContain('bg-accent')

			// Second card should not have it
			const secondCardHtml = cards[1].html()
			expect(secondCardHtml).not.toContain('bg-accent/10')
		})
	})

	describe('template — Remaining Tasks divider', () => {
		it('shows divider when there are both completed and remaining tasks', () => {
			const schedule = makeSchedule([
				{ id: 'done-1', type: null },
				{ id: 'active-1', type: null }
			])

			const { wrapper } = mountSchedule(schedule, {
				tasks: [
					{ id: 'active-1', name: 'Task 1', sizing: 30, priority: 1 }
				]
			})

			expect(wrapper.text()).toContain('Remaining Tasks')
		})

		it('does not show divider when no tasks are completed', () => {
			const schedule = makeSchedule([
				{ type: null },
				{ type: null }
			])

			const { wrapper } = mountSchedule(schedule)

			expect(wrapper.text()).not.toContain('Remaining Tasks')
		})

		it('does not show divider when all tasks are completed', () => {
			const schedule = makeSchedule([
				{ id: 'done-1', type: null },
				{ id: 'done-2', type: null }
			])

			const { wrapper } = mountSchedule(schedule, { tasks: [] })

			expect(wrapper.text()).not.toContain('Remaining Tasks')
		})

		it('marks isFirstRemaining on the first non-completed task', () => {
			const schedule = makeSchedule([
				{ id: 'done-1', type: null },
				{ id: 'active-1', type: null },
				{ id: 'pending-1', type: null }
			])

			const { wrapper } = mountSchedule(schedule, {
				tasks: [
					{ id: 'active-1', name: 'Task 1', sizing: 30, priority: 1 },
					{ id: 'pending-1', name: 'Task 2', sizing: 30, priority: 1 }
				]
			})

			const details = wrapper.vm.scheduleDetails

			expect(details.tasks[0].isFirstRemaining).toBe(false) // completed
			expect(details.tasks[1].isFirstRemaining).toBe(true)  // first remaining
			expect(details.tasks[2].isFirstRemaining).toBe(false) // not first
		})
	})

	describe('computed — hasCompletedTasks', () => {
		it('returns true when some user tasks are completed', () => {
			const schedule = makeSchedule([
				{ id: 'done-1', type: null },
				{ id: 'active-1', type: null }
			])

			const { wrapper } = mountSchedule(schedule, {
				tasks: [
					{ id: 'active-1', name: 'Task 1', sizing: 30, priority: 1 }
				]
			})

			expect(wrapper.vm.hasCompletedTasks).toBe(true)
		})

		it('returns false when no tasks are completed', () => {
			const schedule = makeSchedule([
				{ type: null },
				{ type: null }
			])

			const { wrapper } = mountSchedule(schedule)

			expect(wrapper.vm.hasCompletedTasks).toBe(false)
		})
	})

	describe('template — completion buttons', () => {
		it('shows check icon for non-completed tasks', () => {
			const schedule = makeSchedule([
				{ type: null }
			])

			const { wrapper } = mountSchedule(schedule)

			// Non-completed tasks render the CheckCircle2 Lucide icon (svg) inside a button
			const buttons = wrapper.findAll('button')
			const svgButton = buttons.find(b => b.find('svg').exists())

			expect(svgButton).toBeTruthy()
			expect(svgButton.html()).toContain('bg-app-success')
		})

		it('shows undo icon for completed tasks', () => {
			const schedule = makeSchedule([
				{ id: 'done-1', type: null }
			])

			const { wrapper } = mountSchedule(schedule, { tasks: [] })

			// Completed tasks render the Undo2 Lucide icon (svg) inside a button
			const buttons = wrapper.findAll('button')
			const svgButton = buttons.find(b => b.find('svg').exists())

			expect(svgButton).toBeTruthy()
			expect(svgButton.html()).toContain('bg-app-warning')
		})
	})
})
