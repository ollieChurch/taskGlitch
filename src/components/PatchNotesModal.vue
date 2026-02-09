<template>
	<BaseModal ref="modalRef" title="" :hideHeaderClose="true" :showDefaultFooter="false">
		<h5 class="mb-4 font-rajdhani font-semibold text-lg">Task Glitch has been upgraded.</h5>
		<ul class="divide-y" v-if="changes.length > 0">
			<li
				v-for="(change, index) in changes"
				:key="`patchNotes-change-${index}`"
				class="py-2"
			>
				{{ change }}
			</li>
		</ul>

		<template #footer>
			<button
				class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 font-rajdhani font-semibold"
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
