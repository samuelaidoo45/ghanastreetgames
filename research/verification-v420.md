# v4.20.0 — PWA installation

- Launch and lobby install entry points; native prompt only after user action.
- iPhone/iPad Safari home-screen steps; Android and desktop browser-menu fallback.
- Standalone manifest, 192/512 PNG icons, maskable icon and Apple touch icon.
- Hide install entry points inside standalone apps and after appinstalled.
- Dismissed/failed prompts leave normal gameplay available.
- Service worker stores only a small offline explanation. Game assets/modules and external API/auth requests bypass interception. No forced reload, skipWaiting, full asset download or persistent account caching.

Validation: 372 tests passed; 53 modules passed syntax/import/asset checks. Browser verified launch and instruction dialog at 390×844, iPhone user-agent routing, and launch at 844×390. Browser parsed manifest with zero errors. Native OS installation cannot be completed in the in-app browser; prompt lifecycle is covered by unit tests. Manifest/install flows follow web.dev installation-prompt guidance and Apple Safari Add to Home Screen guidance.

Security review: same-origin worker scope; no remote scripts, new permissions, third-party requests, or credential caching. Existing CSP and authorization remain unchanged.
