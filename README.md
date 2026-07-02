# SLATracker

![License](https://img.shields.io/badge/license-MIT-blue)

Real-time Service Level Agreement (SLA) monitoring and incident tracking dashboard.

## Features

* **Real-Time SLA Tracking:** Monitor active SLA targets and breach thresholds instantly.
* **Incident Lifecycle Management:** Track, assign, and resolve service incidents.
* **Metrics & Analytics:** Visualize uptime, MTTR (Mean Time to Resolution), and breach rates.
* **Policy Configuration:** Define custom SLA policies, targets, and escalation paths.
* **Interactive Dashboard:** Unified view of system health and active incidents.
* **State Management:** Centralized client-side state for fast, reactive updates.
* **Responsive Design:** Mobile-friendly interface optimized for ops teams.

## Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Deployment:** Cloudflare Pages
* **State:** React Context API

## Getting Started

### Prerequisites

* Node.js 18+
* npm / pnpm / yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```text
src/
├── __tests__/
│   ├── store.test.ts
│   └── types.test.ts
├── app/
│   ├── dashboard/
│   │   ├── incidents/
│   │   │   └── page.tsx
│   │   ├── metrics/
│   │   │   └── page.tsx
│   │   ├── policies/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
└── lib/
    ├── store.tsx
    └── types.ts
```

## License

This project is licensed under the MIT License.