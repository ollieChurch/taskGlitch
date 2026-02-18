export const patchNotes = [
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
