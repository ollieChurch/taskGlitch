<template>
	<BaseModal ref="modalRef" title="" :hideHeaderClose="true" :showDefaultFooter="false" size="lg">
		<h5 class="mb-4 font-rajdhani font-semibold text-lg text-text-heading">
			{{ showChangelog ? "What's new in Task Glitch" : 'Task Glitch has been upgraded.' }}
		</h5>

		<!-- Upgrade mode: flat list of changes since last login -->
		<ul class="divide-y divide-border-default" v-if="!showChangelog && changes.length > 0">
			<li
				v-for="(change, index) in changes"
				:key="`patchNotes-change-${index}`"
				class="py-2 text-text-primary font-rajdhani"
			>
				{{ change }}
			</li>
		</ul>

		<!-- Changelog mode: versioned sections -->
		<div v-if="showChangelog" class="space-y-4 max-h-96 overflow-y-auto scroll-panel pr-1">
			<div
				v-for="version in allNotes"
				:key="`version-${version.version}`"
			>
				<p class="font-wallpoet text-accent text-sm mb-2">v{{ version.version }}</p>
				<ul class="divide-y divide-border-default">
					<li
						v-for="(change, index) in version.changes"
						:key="`changelog-${version.version}-${index}`"
						class="py-1.5 text-sm text-text-primary font-rajdhani"
					>
						{{ change }}
					</li>
				</ul>
			</div>
		</div>

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
			changes: [],
			allNotes: [...patchNotes],
			forceChangelog: false
		}
	},

	watch: {
		lastVersion(newVal) {
			if (newVal) {
				this.changes = []
				this.getChanges()
			}
		}
	},

	computed: {
		showChangelog() {
			return this.forceChangelog || !this.lastVersion
		}
	},

	created() {
		if (this.lastVersion) {
			this.getChanges()
		}
	},

	methods: {
		show(mode) {
			if (mode === 'changelog') {
				this.forceChangelog = true
			} else {
				this.forceChangelog = false
			}
			this.$refs.modalRef.show()
		},
		getChanges() {
			const notesCopy = [...patchNotes]
			const indexOfUserVersion = notesCopy.findIndex(
				x => x.version == this.lastVersion
			)

			if (indexOfUserVersion == -1) return

			const changesSinceLastLogin = notesCopy.slice(0, indexOfUserVersion)

			changesSinceLastLogin.forEach(version => {
				version.changes.forEach(change => this.changes.push(change))
			})
		}
	},
	expose: ['show']
}
</script>
