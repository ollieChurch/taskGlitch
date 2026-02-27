<template>
	<div class="mb-3">
		<!-- Search + toggle row -->
		<div class="flex items-center gap-2">
			<div class="relative flex-1">
				<Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" aria-hidden="true" />
				<input
					type="text"
					:value="filters.search"
					@input="update('search', $event.target.value)"
					placeholder="Search tasks..."
					class="w-full pl-8 pr-8 py-1.5 text-sm font-rajdhani bg-surface-hover border border-border-visible text-text-primary placeholder-text-secondary focus:border-accent-dim focus:outline-none"
					style="border-radius: var(--radius-btn);"
					aria-label="Search tasks"
				/>
				<button
					v-if="filters.search"
					@click="update('search', '')"
					class="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-heading transition-colors"
					aria-label="Clear search"
				>
					<X :size="14" />
				</button>
			</div>
			<button
				@click="panelOpen = !panelOpen"
				class="btn-themed relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-rajdhani font-semibold border transition-all shrink-0"
				:class="panelOpen
					? 'bg-accent-dim border-accent-dim text-text-heading'
					: 'bg-surface-hover border-border-visible text-text-secondary hover:border-accent-dim'"
				:aria-expanded="panelOpen"
				aria-label="Toggle filters"
			>
				<SlidersHorizontal :size="14" aria-hidden="true" />
				Filters
				<span
					v-if="activeCount > 0"
					class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full bg-accent text-text-inverse px-0.5"
					aria-label="Active filters"
				>{{ activeCount }}</span>
			</button>
		</div>

		<!-- Collapsible filter panel -->
		<Transition name="filter-panel">
			<div v-if="panelOpen" class="mt-2 p-3 border border-border-visible bg-surface-hover" style="border-radius: var(--radius-card-sm);">

				<!-- Priority -->
				<div class="mb-3">
					<p class="text-xs font-rajdhani font-semibold text-text-secondary uppercase tracking-widest mb-1.5 text-left">Priority</p>
					<div class="flex flex-wrap gap-1.5">
						<button
							v-for="(p, key) in priorities"
							:key="key"
							@click="toggleArrayFilter('priorities', p.value)"
							class="btn-themed px-2.5 py-0.5 text-xs font-rajdhani font-semibold border transition-all capitalize"
							:class="filters.priorities.includes(p.value)
								? 'text-text-inverse border-transparent'
								: 'bg-surface-base border-border-visible text-text-secondary hover:border-accent-dim'"
							:style="filters.priorities.includes(p.value) ? `background-color: ${p.color}; border-color: ${p.color};` : ''"
							:aria-pressed="filters.priorities.includes(p.value)"
						>{{ key }}</button>
					</div>
				</div>

				<!-- Category -->
				<div class="mb-3" v-if="categories.length > 0">
					<p class="text-xs font-rajdhani font-semibold text-text-secondary uppercase tracking-widest mb-1.5 text-left">Category</p>
					<div class="flex flex-wrap gap-1.5">
						<button
							v-for="cat in categories"
							:key="cat"
							@click="toggleArrayFilter('categories', cat)"
							class="btn-themed px-2.5 py-0.5 text-xs font-rajdhani font-semibold border transition-all"
							:class="filters.categories.includes(cat)
								? 'bg-accent-dim border-accent-dim text-text-heading'
								: 'bg-surface-base border-border-visible text-text-secondary hover:border-accent-dim'"
							:aria-pressed="filters.categories.includes(cat)"
						>{{ cat }}</button>
					</div>
				</div>

				<!-- Size -->
				<div class="mb-3">
					<p class="text-xs font-rajdhani font-semibold text-text-secondary uppercase tracking-widest mb-1.5 text-left">Size</p>
					<div class="flex flex-wrap gap-1.5">
						<button
							v-for="(label, size) in sizeLabels"
							:key="size"
							@click="toggleArrayFilter('sizes', Number(size))"
							class="btn-themed px-2.5 py-0.5 text-xs font-rajdhani font-semibold border transition-all"
							:class="filters.sizes.includes(Number(size))
								? 'bg-accent-dim border-accent-dim text-text-heading'
								: 'bg-surface-base border-border-visible text-text-secondary hover:border-accent-dim'"
							:aria-pressed="filters.sizes.includes(Number(size))"
						>{{ label }}</button>
					</div>
				</div>

				<!-- Deadline -->
				<div class="mb-3">
					<p class="text-xs font-rajdhani font-semibold text-text-secondary uppercase tracking-widest mb-1.5 text-left">Deadline</p>
					<div class="flex flex-wrap gap-1.5">
						<button
							v-for="opt in deadlineOptions"
							:key="opt.value"
							@click="update('deadline', filters.deadline === opt.value ? '' : opt.value)"
							class="btn-themed px-2.5 py-0.5 text-xs font-rajdhani font-semibold border transition-all"
							:class="filters.deadline === opt.value
								? 'bg-accent-dim border-accent-dim text-text-heading'
								: 'bg-surface-base border-border-visible text-text-secondary hover:border-accent-dim'"
							:aria-pressed="filters.deadline === opt.value"
						>{{ opt.label }}</button>
					</div>
				</div>

				<!-- Completion date range (completed tab only) -->
				<template v-if="showDateRange">
					<div class="mb-3">
						<p class="text-xs font-rajdhani font-semibold text-text-secondary uppercase tracking-widest mb-1.5 text-left">Completed After</p>
						<input
							type="date"
							:value="filters.completedAfter"
							@input="update('completedAfter', $event.target.value)"
							class="w-full px-2 py-1 text-sm font-rajdhani bg-surface-base border border-border-visible text-text-primary focus:border-accent-dim focus:outline-none"
							style="border-radius: var(--radius-btn);"
						/>
					</div>
					<div class="mb-3">
						<p class="text-xs font-rajdhani font-semibold text-text-secondary uppercase tracking-widest mb-1.5 text-left">Completed Before</p>
						<input
							type="date"
							:value="filters.completedBefore"
							@input="update('completedBefore', $event.target.value)"
							class="w-full px-2 py-1 text-sm font-rajdhani bg-surface-base border border-border-visible text-text-primary focus:border-accent-dim focus:outline-none"
							style="border-radius: var(--radius-btn);"
						/>
					</div>
				</template>

				<!-- Clear all -->
				<div v-if="activeCount > 0" class="flex justify-end">
					<button
						@click="clearAll"
						class="text-xs font-rajdhani font-semibold text-text-secondary hover:text-accent transition-colors"
					>
						Clear all filters
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script>
import { Search, X, SlidersHorizontal } from 'lucide-vue-next'

export default {
	name: 'FilterWidget',
	components: { Search, X, SlidersHorizontal },

	props: {
		filters: {
			type: Object,
			required: true
		},
		categories: {
			type: Array,
			default: () => []
		},
		sizeLabels: {
			type: Object,
			default: () => ({})
		},
		priorities: {
			type: Object,
			default: () => ({})
		},
		showDateRange: {
			type: Boolean,
			default: false
		}
	},

	emits: ['update:filters'],

	data() {
		return {
			panelOpen: false,
			deadlineOptions: [
				{ label: 'Has deadline', value: 'has' },
				{ label: 'No deadline', value: 'none' },
				{ label: 'Overdue', value: 'overdue' },
				{ label: 'Due this week', value: 'this-week' }
			]
		}
	},

	computed: {
		activeCount() {
			let count = 0
			if (this.filters.search) count++
			if (this.filters.priorities?.length) count++
			if (this.filters.categories?.length) count++
			if (this.filters.sizes?.length) count++
			if (this.filters.deadline) count++
			if (this.filters.completedAfter) count++
			if (this.filters.completedBefore) count++
			return count
		}
	},

	methods: {
		update(key, value) {
			this.$emit('update:filters', { ...this.filters, [key]: value })
		},

		toggleArrayFilter(key, value) {
			const current = this.filters[key] ?? []
			const updated = current.includes(value)
				? current.filter(v => v !== value)
				: [...current, value]
			this.update(key, updated)
		},

		clearAll() {
			const cleared = {
				search: '',
				priorities: [],
				categories: [],
				sizes: [],
				deadline: ''
			}
			if (this.showDateRange) {
				cleared.completedAfter = ''
				cleared.completedBefore = ''
			}
			this.$emit('update:filters', cleared)
		}
	}
}
</script>

<style scoped>
.filter-panel-enter-active,
.filter-panel-leave-active {
	transition: opacity 0.2s ease, transform 0.2s ease;
}

.filter-panel-enter-from,
.filter-panel-leave-to {
	opacity: 0;
	transform: translateY(-4px);
}
</style>
