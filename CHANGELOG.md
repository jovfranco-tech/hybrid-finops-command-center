# Changelog

## [v0.3.0] - 2026-06-12
### Added
- **Optimization Workflow Layer**: Convert recommendations into governed optimization actions.
- **Savings Pipeline Dashboard**: Centralized view for action tracking and estimated vs approved savings.
- **Action Register & Approval Queue**: Detailed grid to track state transitions.
- **Action Detail Drawer**: Dedicated view for specific action plans and context.
- **Local Workflow Persistence**: State preserved locally with localStorage.
- **Owner Follow-up Generator**: Automated email drafts for respective action owners.
- **ITSM Ticket Generator**: ServiceNow/Jira-style draft creation for tracking.
- **Workflow-Aware Copilot**: Gemini context now includes workflow summary and pending approvals.
- **Enhanced Executive Report**: Markdown export now summarizes workflow optimizations and approved savings.
- **Bilingual Workflow**: EN/ES support extended to workflow UI, emails, and ticket drafts.

### Security
- **No Real Connectors**: No sensitive connections to ServiceNow or Jira; functionality is purely deterministic.
- **Local Data Only**: Workflow state is entirely contained in browser storage.
- **Minimized Copilot Payload**: Only summarized workflow context is passed to the LLM.

## [v0.2.0] - 2026-06-12
### Added
- **CSV Intelligence Layer**: Browser-local CSV parsing with PapaParse.
- **Source Modes**: Mock Data, Imported CSV Data, and Hybrid Mode.
- **Sample CSVs**: Downloadable templates for VMware, Azure, SharePoint, Rubrik, NetApp, Pure Storage, and Owner Mapping.
- **Data Quality Score**: Real-time scoring for imported files.
- **CSV-driven Recommendations**: Rules engine generates recommendations based on imported CSV data.
- **Source Badges**: Visually distinct badges for Mock, CSV, and Hybrid recommendations.
- **Global Data Reflection**: Imported data reflected across KPIs, Platform Breakdown, Savings Opportunity Board, Risk & Governance, and Executive Report.
- **Gemini Copilot Enhancement**: Context now includes source mode and data quality summaries without sending full CSV rows, ensuring data privacy.
- **Documentation**: Updated README, CHANGELOG, and demo documentation.

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
