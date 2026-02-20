<template>
	<BaseModal
		ref="modalRef"
		:hideHeaderClose="false"
		:showDefaultFooter="false"
		size="md"
		@hide="onClose"
	>
		<template #header>
			<div class="flex items-center gap-3">
				<glitch-emblem :size="28" />
				<h3 class="text-lg font-semibold font-rajdhani text-text-heading">
					Welcome to Task Glitch
				</h3>
			</div>
		</template>

		<!-- Step content -->
		<div class="min-h-[220px] text-left">
			<!-- Step 1: Value prop -->
			<div v-if="step === 0">
				<h4 class="text-text-heading font-rajdhani font-bold text-xl mb-3">
					Stop juggling, start shipping.
				</h4>
				<p class="font-rajdhani text-text-primary mb-4 leading-relaxed">
					Task Glitch turns your messy backlog into an optimised work session.
					Add tasks, let the algorithm rank them, then hit
					<strong class="text-accent">Glitch It</strong> to generate your schedule.
				</p>
				<p class="font-rajdhani text-text-secondary text-sm">
					Here's a quick look at how it works &mdash;
				</p>
			</div>

			<!-- Step 2: Add tasks -->
			<div v-if="step === 1">
				<div class="flex items-start gap-3 mb-3">
					<span class="shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-text-inverse font-wallpoet text-sm">1</span>
					<div>
						<h4 class="text-text-heading font-rajdhani font-bold text-lg mb-1">Add tasks to your backlog</h4>
						<p class="font-rajdhani text-text-primary">
							Hit <strong class="text-accent">Add Task</strong> and give each task a name, priority level, estimated size,
							and an optional deadline. The more context you give, the smarter the scheduling.
						</p>
					</div>
				</div>
				<div class="depth-panel p-3 text-sm font-rajdhani text-text-secondary">
					<p class="mb-1"><strong class="text-text-primary">Priority</strong> — Critical, High, Medium, Low</p>
					<p class="mb-1"><strong class="text-text-primary">Size</strong> — Short (15 min) to Very Long (2 hrs)</p>
					<p class="mb-0"><strong class="text-text-primary">Deadline</strong> — hard (must finish) or soft (prefer to finish)</p>
				</div>
			</div>

			<!-- Step 3: Auto-prioritisation -->
			<div v-if="step === 2">
				<div class="flex items-start gap-3 mb-3">
					<span class="shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-text-inverse font-wallpoet text-sm">2</span>
					<div>
						<h4 class="text-text-heading font-rajdhani font-bold text-lg mb-1">TaskGlitch scores your backlog</h4>
						<p class="font-rajdhani text-text-primary">
							Every task gets an automatic score based on its priority, how long it's been waiting,
							and how close its deadline is. Your backlog is always ranked so the most critical work
							surfaces to the top.
						</p>
					</div>
				</div>
				<p class="font-rajdhani text-text-secondary text-sm">
					You never need to manually sort or reprioritise — the algorithm does it for you as time passes and deadlines approach.
				</p>
			</div>

			<!-- Step 4: Glitch It -->
			<div v-if="step === 3">
				<div class="flex items-start gap-3 mb-3">
					<span class="shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-text-inverse font-wallpoet text-sm">3</span>
					<div>
						<h4 class="text-text-heading font-rajdhani font-bold text-lg mb-1">Hit "Glitch It" to generate your schedule</h4>
						<p class="font-rajdhani text-text-primary">
							When you're ready to work, go to the <strong class="text-accent">Glitch</strong> tab and hit
							<strong class="text-accent">Glitch It!</strong>. Set your available time and Task Glitch
							fills it with your highest-priority tasks, including automatic breaks.
						</p>
					</div>
				</div>
				<p class="font-rajdhani text-text-secondary text-sm">
					Work through your schedule, mark tasks done, and track your progress on the Dashboard.
				</p>
			</div>
		</div>

		<!-- Step indicators -->
		<div class="flex justify-center gap-2 mt-4 mb-2">
			<button
				v-for="i in totalSteps"
				:key="`dot-${i}`"
				class="w-2 h-2 rounded-full transition-colors"
				:class="step === i - 1 ? 'bg-accent' : 'bg-border-visible'"
				:aria-label="`Go to step ${i}`"
				@click="step = i - 1"
			/>
		</div>

		<template #footer>
			<div class="flex items-center justify-between w-full gap-2">
				<button
					class="btn-themed px-3 py-1 text-sm text-text-secondary font-rajdhani hover:text-accent transition-colors"
					@click="skip()"
				>
					Skip
				</button>
				<div class="flex gap-2">
					<button
						v-if="step > 0"
						class="btn-themed px-4 py-1.5 bg-surface-hover border border-border-default text-text-secondary text-sm font-rajdhani font-semibold hover:border-accent-dim transition-colors"
						@click="step--"
					>
						Back
					</button>
					<button
						v-if="step < totalSteps - 1"
						class="btn-themed px-4 py-1.5 bg-accent text-text-inverse text-sm font-rajdhani font-semibold hover:brightness-110 transition-all"
						@click="step++"
					>
						Next
					</button>
					<button
						v-else
						class="btn-themed px-4 py-1.5 bg-accent text-text-inverse text-sm font-rajdhani font-semibold hover:brightness-110 transition-all"
						@click="finish()"
					>
						Let's go!
					</button>
				</div>
			</div>
		</template>
	</BaseModal>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { useTaskActions } from '@/composables/useTaskActions'
import BaseModal from './ui/BaseModal.vue'
import GlitchEmblem from './GlitchEmblem.vue'

export default {
	name: 'OnboardingModal',
	components: { BaseModal, GlitchEmblem },

	setup() {
		const store = useAppStore()
		const { saveAccountToDatabase } = useTaskActions()
		return { store, saveAccountToDatabase }
	},

	data() {
		return {
			step: 0,
			totalSteps: 4
		}
	},

	methods: {
		show() {
			this.step = 0
			this.$refs.modalRef.show()
		},

		skip() {
			this.markComplete()
			this.$refs.modalRef.close()
		},

		finish() {
			this.markComplete()
			this.$refs.modalRef.close()
		},

		onClose() {
			this.markComplete()
		},

		markComplete() {
			if (!this.store.account) return
			const newAccount = {
				...this.store.account,
				onboardingComplete: true
			}
			this.saveAccountToDatabase(newAccount)
		}
	},

	expose: ['show']
}
</script>
