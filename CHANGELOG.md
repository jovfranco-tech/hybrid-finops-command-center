# Changelog

## [v0.3.0] - 2026-06-12
### Added
- **AI Optimization Copilot Backend**: Integrated Gemini 2.5 Flash via a Vercel Serverless Function (`/api/copilot`).
- **Structured Outputs**: Copilot now responds with strict JSON (summary, savings, risk caveats, action plans).
- **Secure Fallback Engine**: If the Gemini API is unreachable, unconfigured, or offline, the Copilot seamlessly routes requests to the deterministic offline Regex engine.
- **Context Reduction Algorithm**: The telemetry is summarized prior to sending to Gemini to preserve tokens and improve latency.
- **Vercel Edge Ready**: Ready for one-click deployment.

## [v0.2.0] - 2026-06-12
### Added
- **CSV Intelligence Layer**: PapaParse integration to ingest CSV telemetry from 9 platforms (Azure, VMware, NetApp, etc.).
- **Global Data Context**: React Context built to toggle seamlessly between `Mock Data`, `CSV Ready`, and `Hybrid Mode`.
- **Staging Area Analytics**: The Data Connectors page now measures ingest metrics (Total Rows, Owner Coverage).
- **Offline Waste Engine Rules**: Built-in deterministic parsing algorithms identify waste based on CSV fields without a backend.
- **LocalStorage Persistence**: Ingested telemetry is persisted securely in the browser cache.

## [v0.1.0] - 2026-06-12
### Added
- Initial project structure using React, Vite, TypeScript, and Tailwind CSS.
- **Executive Dashboard**: KPIs, Platform Breakdown, Risk Matrix.
- **Savings Opportunity Board**: Detailed grid with 20+ columns of data.
- **AI Copilot (v1)**: Deterministic chat interface.
- **Executive Report**: Markdown document generator for CIO presentations.
- **Bilingual Interface**: Full English and Spanish localization for enterprise terminology.
