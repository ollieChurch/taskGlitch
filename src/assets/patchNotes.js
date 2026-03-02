export const patchNotes = [
	{
		version: '0.18.0',
		changes: [
			'Create repeating tasks — set a daily, weekly, or monthly recurrence pattern on any task',
			'When you complete a recurring task, the next instance is automatically added to your backlog',
			'Weekly recurrence lets you pick specific days of the week (e.g. Mon, Wed, Fri)',
			'Monthly recurrence lets you choose the day of the month',
			'Set a recurrence end date or a maximum number of occurrences',
			'Opt into "catch up missed instances" mode — creates all skipped occurrences when completing a late task',
			'Recurring task cards show a repeat icon with a summary of the pattern',
			'Deleting a recurring task offers a choice: skip this instance (next occurrence still created) or stop all future recurrences'
		]
	},
	{
		version: '0.17.0',
		changes: [
			'Mark any task as blocked with one click — blocked tasks are visually distinct and skip to the bottom of the backlog',
			'Blocked tasks are never included when generating a schedule',
			'Add an optional reason when blocking a task, editable via the task edit modal',
			'Filter the backlog by status — show only active or only blocked tasks',
			'Blocked task count shown at the top of the backlog when any tasks are blocked',
			'Set task dependencies — a task is automatically blocked until all its prerequisites are completed',
			'Task cards show "Blocked by: Task A, Task B" when dependencies are unmet',
			'The scheduler respects dependencies — prerequisites are always scheduled before dependents',
			'Circular dependencies are detected and prevented when saving a task',
			'Deleting a prerequisite task automatically cleans up dependency references'
		]
	},
	{
		version: '0.16.0',
		changes: [
			'Search your backlog instantly — find tasks by name or description',
			'Filter tasks by priority, category, size, and deadline status',
			'Filters combine (AND logic) and show an active count badge',
			'Completed tab gains the same search and filter controls, plus a completion date range filter',
			'Completing a task now fades it out smoothly instead of disappearing abruptly',
			'Undo toast appears for 5 seconds after completing a task — click Undo to bring it back'
		]
	},
	{
		version: '0.15.0',
		changes: [
			'New onboarding tour for first-time users — get up to speed in under a minute',
			'Footer now links to the onboarding guide, what\'s new, and feedback',
			'Landing page redesign for logged-out visitors — see how Task Glitch works before signing up',
			'Accessibility improvements: skip-to-content link, ARIA labels on all icon buttons, better keyboard navigation',
			'Added Open Graph and Twitter Card meta tags for better social sharing',
			'Improved SEO with descriptive page title and meta description',
			'PWA manifest updated with app description and categories'
		]
	},
	{
		version: '0.14.1',
		changes: [
			'New TG emblem and favicon replacing the old mascot',
			'Desktop layout locks to viewport height — no more page scroll',
			'Task lists and schedule scroll within their own panels on desktop',
			'Dashboard uses a 2-column layout on wider screens',
			'Content area widened to 720px for better use of screen space'
		]
	},
	{
		version: '0.14.0',
		changes: [
			'Full dark sci-fi redesign — angular panels, glowing accents, and a command-center aesthetic',
			'Toggleable Cyberpunk Mode in Profile settings — neon glow, scan lines, and glitch effects',
			'Switched to Lucide icons for a sharper, more consistent look',
			'New priority-low colour (violet) to stand out from the cyan UI accent',
			'Smoother page transitions and hover glow effects throughout'
		]
	},
	{
		version: '0.13.0',
		changes: [
			'Updated dependencies (Firebase, Vite) to fix security vulnerabilities',
			'Task sizes now display as friendly labels (Short, Medium, Long, Very Long)',
			'Editing or deleting a scheduled task now updates your schedule automatically',
			'Schedule shows a warning if tasks run past the planned end time',
			'Changing a task\'s category prompts you to keep or remove it from the schedule',
			'Cleaned up development logging from production builds'
		]
	},
	{
		version: '0.12.0',
		changes: [
			'Schedule now tracks time automatically — see how long each task actually takes',
			'Active task highlighted with an "In Progress" badge so you always know what\'s next',
			'Rescheduling now preserves completed tasks at the top — your progress is never lost',
			'Completed and remaining tasks separated with a clear divider',
			'Schedule complete celebration with confetti when all tasks are done',
			'Session summary shows tasks completed, estimated vs actual time',
			'Dashboard now shows your estimation accuracy based on scheduled task data'
		]
	},
	{
		version: '0.11.0',
		changes: [
			'Added loading indicators while your data syncs — no more empty screens on page load',
			'Helpful empty states when you have no tasks or schedule yet',
			'Dashboard chart colours are now consistent between page loads',
			'Charts and stats now update in real-time as your data changes'
		]
	},
	{
		version: '0.10.0',
		changes: [
			'Task Glitch has been rebuilt with a modernised tech stack for improved performance and reliability',
			'Fresh new look with a cleaner, more streamlined design',
			'Faster page loads and smoother interactions'
		]
	},
	{
		version: '0.9.0',
		changes: [
			'You will receive a new notification when Task Glitch is updated to keep you up to date with any changes'
		]
	},
	{
		version: '0.8.1',
		changes: ['Patch notes for user starts']
	}
]
