# Changelog

## [v0.1.0] - 2026-06-12
### Added
- **Initial Enterprise Release**: Consolidated portfolio MVP.
- **Executive Dashboard**: KPIs, Platform Breakdown, Risk Matrix.
- **Savings Opportunity Board**: Detailed grid with 20+ columns of data.
- **CSV Intelligence Layer**: PapaParse integration to ingest CSV telemetry from 9 platforms (Azure, VMware, NetApp, etc.).
- **Global Data Context**: React Context built to toggle seamlessly between `Mock Data`, `CSV Ready`, and `Hybrid Mode`.
- **AI Optimization Copilot Backend**: Integrated Gemini 2.5 Flash via a Vercel Serverless Function (`/api/copilot`).
- **Structured Outputs**: Copilot now responds with strict JSON (summary, savings, risk caveats, action plans).
- **Secure Fallback Engine**: If the Gemini API is unreachable, unconfigured, or offline, the Copilot seamlessly routes requests to the deterministic offline Regex engine.
- **Executive Report Export**: Markdown document generator for CIO presentations.
- **Bilingual Interface**: Full English and Spanish localization for enterprise terminology.
