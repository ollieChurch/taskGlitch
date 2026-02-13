import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock canvas-confetti to avoid canvas issues in jsdom
vi.mock('canvas-confetti', () => ({
	default: vi.fn()
}))

import ScheduleComplete from '@/components/ScheduleComplete.vue'
import confetti from 'canvas-confetti'

function mountComplete(summary) {
	return mount(ScheduleComplete, {
		props: { summary }
	})
}

describe('ScheduleComplete', () => {
	describe('summary display', () => {
		it('renders tasks completed count', () => {
			const wrapper = mountComplete({
				tasksCompleted: 5,
				estimatedMins: 150,
				actualMins: 140
			})

			expect(wrapper.text()).toContain('5')
		})

		it('renders estimated time formatted as hours and minutes', () => {
			const wrapper = mountComplete({
				tasksCompleted: 3,
				estimatedMins: 90,
				actualMins: 85
			})

			expect(wrapper.text()).toContain('1h 30m')
		})

		it('renders actual time formatted as minutes for short sessions', () => {
			const wrapper = mountComplete({
				tasksCompleted: 2,
				estimatedMins: 45,
				actualMins: 40
			})

			expect(wrapper.text()).toContain('40m')
		})

		it('shows dash when actual time is not available', () => {
			const wrapper = mountComplete({
				tasksCompleted: 2,
				estimatedMins: 60,
				actualMins: null
			})

			expect(wrapper.text()).toContain('—')
		})

		it('shows "under" when actual time is less than estimated', () => {
			const wrapper = mountComplete({
				tasksCompleted: 3,
				estimatedMins: 90,
				actualMins: 70
			})

			expect(wrapper.text()).toContain('20m under')
		})

		it('shows "over" when actual time exceeds estimated', () => {
			const wrapper = mountComplete({
				tasksCompleted: 3,
				estimatedMins: 90,
				actualMins: 110
			})

			expect(wrapper.text()).toContain('20m over')
		})

		it('shows "On time" when actual equals estimated', () => {
			const wrapper = mountComplete({
				tasksCompleted: 3,
				estimatedMins: 90,
				actualMins: 90
			})

			expect(wrapper.text()).toContain('On time')
		})
	})

	describe('heading and text', () => {
		it('renders Schedule Complete heading', () => {
			const wrapper = mountComplete({
				tasksCompleted: 1,
				estimatedMins: 30,
				actualMins: 25
			})

			expect(wrapper.text()).toContain('Schedule Complete!')
		})

		it('renders trophy icon', () => {
			const wrapper = mountComplete({
				tasksCompleted: 1,
				estimatedMins: 30,
				actualMins: 25
			})

			expect(wrapper.find('.fa-trophy').exists()).toBe(true)
		})
	})

	describe('events', () => {
		it('emits clearSchedule when Done button is clicked', async () => {
			const wrapper = mountComplete({
				tasksCompleted: 1,
				estimatedMins: 30,
				actualMins: 25
			})

			const doneButton = wrapper.findAll('button').find(b => b.text() === 'Done')
			await doneButton.trigger('click')

			expect(wrapper.emitted('clearSchedule')).toHaveLength(1)
		})

		it('emits newSchedule when New Schedule button is clicked', async () => {
			const wrapper = mountComplete({
				tasksCompleted: 1,
				estimatedMins: 30,
				actualMins: 25
			})

			const newButton = wrapper.findAll('button').find(b => b.text() === 'New Schedule')
			await newButton.trigger('click')

			expect(wrapper.emitted('newSchedule')).toHaveLength(1)
		})
	})

	describe('confetti', () => {
		it('fires confetti on mount', () => {
			confetti.mockClear()

			mountComplete({
				tasksCompleted: 1,
				estimatedMins: 30,
				actualMins: 25
			})

			expect(confetti).toHaveBeenCalledTimes(1)
			expect(confetti).toHaveBeenCalledWith(
				expect.objectContaining({
					particleCount: 100,
					spread: 70
				})
			)
		})
	})

	describe('formatDuration', () => {
		it('formats minutes under 60 as Xm', () => {
			const wrapper = mountComplete({
				tasksCompleted: 1,
				estimatedMins: 45,
				actualMins: 45
			})

			expect(wrapper.vm.formatDuration(45)).toBe('45m')
		})

		it('formats exact hours without minutes', () => {
			const wrapper = mountComplete({
				tasksCompleted: 1,
				estimatedMins: 120,
				actualMins: 120
			})

			expect(wrapper.vm.formatDuration(120)).toBe('2h')
		})

		it('formats hours and minutes combined', () => {
			const wrapper = mountComplete({
				tasksCompleted: 1,
				estimatedMins: 90,
				actualMins: 90
			})

			expect(wrapper.vm.formatDuration(90)).toBe('1h 30m')
		})

		it('returns dash for null value', () => {
			const wrapper = mountComplete({
				tasksCompleted: 1,
				estimatedMins: 30,
				actualMins: null
			})

			expect(wrapper.vm.formatDuration(null)).toBe('—')
		})
	})
})
