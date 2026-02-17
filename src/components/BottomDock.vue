<template>
	<nav v-if="user" class="bottom-dock fixed bottom-0 left-0 right-0 z-40 border-t border-border-visible md:static md:shrink-0">
		<div class="dock-inner flex items-end justify-around px-2">
			<!-- Dashboard -->
			<router-link
				to="/dashboard"
				class="dock-item"
				:class="{ active: $route.path === '/dashboard' }"
			>
				<LayoutDashboard :size="20" />
				<span class="dock-label">Dashboard</span>
			</router-link>

			<!-- Tasks -->
			<router-link
				to="/"
				class="dock-item"
				:class="{ active: $route.path === '/' }"
			>
				<ListTodo :size="20" />
				<span class="dock-label">Tasks</span>
			</router-link>

			<!-- Add Task (center fab) -->
			<button
				class="dock-fab"
				@click="handleAddTask()"
				aria-label="Add task"
			>
				<Plus :size="22" />
			</button>

			<!-- Schedule / Glitch -->
			<router-link
				to="/schedule"
				class="dock-item"
				:class="{ active: $route.path === '/schedule' }"
			>
				<Zap :size="20" />
				<span class="dock-label">Glitch</span>
			</router-link>

			<!-- Profile -->
			<router-link
				to="/profile"
				class="dock-item"
				:class="{ active: $route.path === '/profile' }"
			>
				<User :size="20" />
				<span class="dock-label">Profile</span>
			</router-link>
		</div>
	</nav>
</template>

<script>
import { useAppStore } from '@/stores/app'
import { LayoutDashboard, ListTodo, Plus, Zap, User } from 'lucide-vue-next'

export default {
	name: 'BottomDock',

	components: { LayoutDashboard, ListTodo, Plus, Zap, User },

	setup() {
		const store = useAppStore()
		return { store }
	},

	computed: {
		user() {
			return this.store.user
		}
	},

	methods: {
		handleAddTask() {
			// If not on a page with TaskModal, navigate to Tasks first
			const currentPath = this.$route.path
			if (currentPath !== '/' && currentPath !== '/dashboard') {
				this.$router.push('/')
			}
			// Trigger the add task modal via store
			this.$nextTick(() => {
				this.store.triggerAddTask()
			})
		}
	}
}
</script>

<style scoped>
.bottom-dock {
	background: linear-gradient(
		180deg,
		var(--color-surface-raised) 0%,
		var(--color-surface-base) 100%
	);
	padding-bottom: env(safe-area-inset-bottom, 0px);
}

.dock-inner {
	height: 56px;
}

@media (min-width: 768px) {
	.dock-inner {
		max-width: 720px;
		margin: 0 auto;
	}
}

.dock-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 2px;
	flex: 1;
	padding: 6px 0;
	color: var(--color-text-secondary);
	text-decoration: none;
	transition: color 0.15s ease;
}

.dock-item:hover {
	color: var(--color-text-primary);
}

.dock-item.active {
	color: var(--color-accent);
}

.dock-label {
	font-family: 'Rajdhani', sans-serif;
	font-size: 0.6rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	line-height: 1;
}

/* Centre floating action button */
.dock-fab {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: var(--color-accent);
	color: var(--color-text-inverse);
	border: 2px solid var(--color-accent-dim);
	margin-bottom: 6px;
	flex-shrink: 0;
	transition: transform 0.15s ease, box-shadow 0.15s ease;
	box-shadow: 0 0 8px var(--color-accent-glow);
}

.dock-fab:hover {
	transform: scale(1.08);
	box-shadow: 0 0 14px var(--color-accent-glow);
}

.dock-fab:active {
	transform: scale(0.95);
}
</style>
