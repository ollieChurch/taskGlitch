<template>
	<div class="glitch-emblem inline-flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
		<svg
			:width="size"
			:height="size"
			viewBox="0 0 120 120"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Task Glitch emblem"
		>
			<defs>
				<!-- Neon glow filter -->
				<filter id="emblem-glow" x="-40%" y="-40%" width="180%" height="180%">
					<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
					<feComposite in="SourceGraphic" in2="blur" operator="over" />
				</filter>
				<filter id="emblem-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
					<feComposite in="SourceGraphic" in2="blur" operator="over" />
				</filter>
			</defs>

			<!-- Outer hexagonal frame -->
			<polygon
				class="emblem-hex"
				:points="hexPoints"
				fill="none"
				stroke="var(--color-accent)"
				stroke-width="2"
				stroke-linejoin="bevel"
				filter="url(#emblem-glow)"
			/>

			<!-- Inner hexagonal frame (thinner, dimmer) -->
			<polygon
				class="emblem-hex-inner"
				:points="hexInnerPoints"
				fill="none"
				stroke="var(--color-accent-dim)"
				stroke-width="0.8"
				stroke-linejoin="bevel"
				opacity="0.5"
			/>

			<!-- Circuit trace decorations — extending from hex vertices -->
			<g class="emblem-traces" stroke="var(--color-accent-dim)" stroke-width="1" opacity="0.6">
				<!-- Top-right trace -->
				<line x1="90" y1="30" x2="100" y2="25" />
				<circle cx="100" cy="25" r="1.5" fill="var(--color-accent-dim)" />
				<!-- Top-left trace -->
				<line x1="30" y1="30" x2="20" y2="25" />
				<circle cx="20" cy="25" r="1.5" fill="var(--color-accent-dim)" />
				<!-- Bottom-right trace -->
				<line x1="90" y1="90" x2="100" y2="95" />
				<circle cx="100" cy="95" r="1.5" fill="var(--color-accent-dim)" />
				<!-- Bottom-left trace -->
				<line x1="30" y1="90" x2="20" y2="95" />
				<circle cx="20" cy="95" r="1.5" fill="var(--color-accent-dim)" />
				<!-- Mid-right tick -->
				<line x1="104" y1="60" x2="112" y2="60" />
				<!-- Mid-left tick -->
				<line x1="16" y1="60" x2="8" y2="60" />
			</g>

			<!-- TG Monogram — geometric, angular letterforms -->
			<g filter="url(#emblem-glow)">
				<!-- T: horizontal bar + vertical stem -->
				<path
					d="M 33 44 L 57 44 L 57 49 L 48 49 L 48 76 L 42 76 L 42 49 L 33 49 Z"
					fill="var(--color-accent)"
					class="emblem-letter"
				/>

				<!-- G: angular open shape with inward bar -->
				<path
					d="M 87 48 L 87 44 L 63 44 L 63 76 L 87 76 L 87 60 L 75 60 L 75 65 L 82 65 L 82 71 L 68 71 L 68 49 L 82 49 L 82 48 Z"
					fill="var(--color-accent)"
					class="emblem-letter"
				/>
			</g>

			<!-- Scan-line accent across the middle -->
			<line
				class="emblem-scanline"
				x1="25"
				y1="60"
				x2="95"
				y2="60"
				stroke="var(--color-accent)"
				stroke-width="0.5"
				opacity="0.25"
				stroke-dasharray="2 3"
			/>

			<!-- Corner brackets — HUD targeting feel -->
			<g class="emblem-brackets" stroke="var(--color-accent)" stroke-width="1.5" fill="none" opacity="0.4">
				<!-- Top-left bracket -->
				<polyline points="18,32 18,18 32,18" />
				<!-- Top-right bracket -->
				<polyline points="88,18 102,18 102,32" />
				<!-- Bottom-left bracket -->
				<polyline points="18,88 18,102 32,102" />
				<!-- Bottom-right bracket -->
				<polyline points="88,102 102,102 102,88" />
			</g>
		</svg>
	</div>
</template>

<script>
export default {
	name: 'GlitchEmblem',

	props: {
		size: {
			type: Number,
			default: 96
		}
	},

	computed: {
		hexPoints() {
			return this.getHexPoints(60, 60, 44)
		},
		hexInnerPoints() {
			return this.getHexPoints(60, 60, 38)
		}
	},

	methods: {
		getHexPoints(cx, cy, r) {
			const points = []
			for (let i = 0; i < 6; i++) {
				const angle = (Math.PI / 3) * i - Math.PI / 2
				const x = cx + r * Math.cos(angle)
				const y = cy + r * Math.sin(angle)
				points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
			}
			return points.join(' ')
		}
	}
}
</script>
