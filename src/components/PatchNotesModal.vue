<template>
	<b-modal id="patchNotesModal" size="l" hide-header>
		<b-card-title class="mb-4">Task Glitch has been upgraded.</b-card-title>
		<b-list-group flush v-if="changes.length > 0">
			<b-list-group-item
				v-for="(change, index) in changes"
				:key="`patchNotes-change-${index}`"
				class="py-2 px-0"
			>
				{{ change }}
			</b-list-group-item>
		</b-list-group>

		<template #modal-footer="{ ok }">
			<b-button size="sm" variant="success" @click="ok()"> OK </b-button>
		</template>
	</b-modal>
</template>

<script>
	import { patchNotes } from '../assets/patchNotes'

	export default {
		props: ['lastVersion'],

		data() {
			return {
				changes: []
			}
		},

		created() {
			this.getChanges()
		},

		methods: {
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
		}
	}
</script>
