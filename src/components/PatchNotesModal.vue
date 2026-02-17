<template>
	<BaseModal ref="modalRef" title="" :hideHeaderClose="true" :showDefaultFooter="false">
		<h5 class="mb-4 font-rajdhani font-semibold text-lg text-text-heading">Task Glitch has been upgraded.</h5>
		<ul class="divide-y divide-border-default" v-if="changes.length > 0">
			<li
				v-for="(change, index) in changes"
				:key="`patchNotes-change-${index}`"
				class="py-2 text-text-primary"
			>
				{{ change }}
			</li>
		</ul>

		<template #footer>
			<button
				class="btn-themed px-3 py-1 bg-accent text-text-inverse text-sm hover:brightness-110 font-rajdhani font-semibold transition-all"
				@click="$refs.modalRef.close()"
			>
				OK
			</button>
		</template>
	</BaseModal>
</template>

<script>
import { patchNotes } from '../assets/patchNotes'
import BaseModal from './ui/BaseModal.vue'

export default {
	props: ['lastVersion'],
	components: { BaseModal },

	data() {
		return {
			changes: []
		}
	},

	created() {
		this.getChanges()
	},

	methods: {
		show() {
			this.$refs.modalRef.show()
		},
		getChanges() {
			const indexOfUserVersion = patchNotes.findIndex(
				x => x.version == this.lastVersion
			)

			if (indexOfUserVersion == -1) return

			const changesSinceLastLogin = patchNotes.splice(
				0,
				indexOfUserVersion
			)

			changesSinceLastLogin.forEach(version => {
				version.changes.forEach(change => this.changes.push(change))
			})
		}
	},
	expose: ['show']
}
</script>
