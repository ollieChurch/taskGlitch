# Improve Lighthouse Score

**Phase:** 2 | **Version:** 0.15 | **Status:** Not Started

## Problem

The Lighthouse score has not been measured or optimised. As a PWA, TaskGlitch should score well across all categories to ensure a good user experience and discoverability.

## Requirements

### Audit

- [ ] Run Lighthouse audit across all four categories: Performance, Accessibility, Best Practices, SEO
- [ ] Document current baseline scores
- [ ] Prioritise fixes by impact

### Performance

- [ ] Ensure code splitting is configured (Vite should handle this, but verify route-level splitting)
- [ ] Optimise images and icons (if any static assets)
- [ ] Check for unnecessary re-renders in Vue components
- [ ] Verify Firebase SDK is tree-shaken (only importing used modules)
- [ ] Check bundle size and identify any oversized dependencies
- [ ] Ensure fonts (Rajdhani, Wallpoet) are loaded efficiently (preload, font-display: swap)

### SEO

- [ ] Add meta descriptions to index.html
- [ ] Add Open Graph tags for social sharing
- [ ] Ensure semantic HTML structure
- [ ] Add robots.txt and sitemap.xml

### PWA

- [ ] Verify web manifest is complete and correct
- [ ] Ensure service worker is registered and functioning
- [ ] Test offline behaviour (at minimum: show a friendly offline message)
- [ ] Verify app is installable on mobile

### Best Practices

- [ ] Ensure HTTPS everywhere
- [ ] Check for console errors in production
- [ ] Verify no deprecated APIs in use

## Files Likely Affected

- `index.html` — meta tags, preload hints
- `public/manifest.json` — PWA manifest
- `vite.config.js` — build optimisation, code splitting
- `src/assets/main.css` — font loading
- Various components — performance optimisations

## Acceptance Criteria

1. Lighthouse Performance score: 90+
2. Lighthouse Accessibility score: 90+ (aligns with accessibility work)
3. Lighthouse Best Practices score: 90+
4. Lighthouse SEO score: 90+
5. PWA is installable and shows basic offline support
