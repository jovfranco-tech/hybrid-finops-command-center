# Hybrid FinOps Command Center

**AI-native hybrid infrastructure waste intelligence platform for cloud, virtualization, storage, backup, and Microsoft 365.**

🌍 **Live Production:** [hybrid-finops-cc.vercel.app](https://hybrid-finops-cc.vercel.app)  
📦 **Repository:** [github.com/jovfranco-tech/hybrid-finops-command-center](https://github.com/jovfranco-tech/hybrid-finops-command-center)

## 📸 Screenshots

*(Replace these paths with actual high-resolution images of the application in your repository)*

1. **Executive Overview**  
   `![Executive Overview](docs/screenshots/executive-overview.png)`

2. **Savings Opportunity Board**  
   `![Savings Opportunity Board](docs/screenshots/savings-board.png)`

3. **AI Optimization Copilot**  
   `![AI Optimization Copilot](docs/screenshots/ai-copilot.png)`

4. **CSV Import / Data Source Readiness**  
   `![Data Connectors](docs/screenshots/data-connectors.png)`

## Product Overview

Hybrid FinOps Command Center is an enterprise-grade intelligence layer designed for CIOs, Infrastructure Directors, and Cloud Operations teams. It moves beyond standard cloud billing dashboards by providing a **unified waste intelligence engine** across hybrid environments. 

Rather than merely displaying historical spend, the platform identifies deterministic waste, calculates risk-adjusted recoverable savings, and dictates exact mitigation workflows.

### The Problem
Modern IT sprawl is not limited to public cloud. Enterprise waste hides in oversized on-premise VMs, orphaned storage volumes, forgotten database backups, and unassigned SaaS licenses. Traditional FinOps tools focus exclusively on public cloud billing APIs, leaving IT leaders blind to millions of dollars in on-premise and hybrid storage waste.

### The Differentiator
Hybrid FinOps Command Center analyzes cross-domain telemetry natively. It bridges the gap between Cloud (Azure), Virtualization (VMware, Oracle), Storage (NetApp, Pure), Data Protection (Rubrik), and Collaboration (M365) into a single pane of glass, paired with a deterministic Waste Intelligence Engine and a Gemini-powered AI Optimization Copilot.

---

## Covered Platforms

The platform's unified schema currently ingests and analyzes telemetry from:
- **Cloud:** Microsoft Azure
- **Virtualization:** VMware vSphere, Oracle VM
- **Primary Storage:** NetApp ONTAP, Pure Storage FlashArray
- **Data Protection:** Rubrik Cloud Data Management
- **SaaS / Collaboration:** Microsoft SharePoint / Microsoft 365

---

## Core Features

- **Executive Overview:** High-level trailing run-rates, risk-adjusted potential savings, and a proprietary Hybrid Waste Score designed for boardroom reporting.
- **Platform Breakdown:** Granular visibility into waste distribution across diverse vendors and operational layers.
- **Savings Opportunity Board:** An actionable, dense data grid detailing exact savings opportunities with calculated confidence levels and production impact metrics.
- **Risk & Governance Layer:** Deep-dive analytics into high-risk optimizations, missing resource owners (orphans), and zero-downtime execution planning.
- **Waste Intelligence Rules:** Deterministic, offline heuristics that parse telemetry to immediately flag actionable waste (e.g., `CPU < 5%`, `Snapshots > 30 Days`).
- **AI Optimization Copilot:** Context-aware, Gemini 2.5 Flash-powered chat interface capable of generating 30/60/90-day execution plans and drafting emails to resource owners. Includes a seamless offline regex fallback.
- **Executive Report Export:** Auto-generated, Markdown-based CIO briefings ready for copy-pasting into Notion or Confluence.
- **CSV Import Readiness:** A robust staging area powered by PapaParse to ingest raw telemetry exports natively in the browser.
- **Bilingual Support (EN/ES):** Real-time, localized toggling utilizing strict, high-end enterprise FinOps terminology.

---

## Architecture & Tech Stack

The architecture is built for rapid deployment, extreme security, and edge performance, adhering to a strict serverless paradigm.

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS (v4), Recharts, Framer Motion.
- **Backend:** Vercel Edge Serverless Functions (`/api/copilot`).
- **AI Engine:** Google Gemini 2.5 Flash via `@google/genai` (Structured Outputs).
- **State Management:** React Context API + LocalStorage persistence.
- **Parsing:** PapaParse for massive client-side CSV normalization.
- **Deployment:** Vercel Zero-Config integration.

### Data Model
Data is normalized into a unified `OptimizationRecommendation` interface, enforcing fields such as `platform`, `riskLevel` (Low, Medium, High), `monthlySavings`, `confidenceScore`, and `productionImpact`.

### Security & Data Caveats
- **Zero Client-Side Keys:** The Gemini API key is securely isolated in the Vercel Edge Serverless backend.
- **Local Telemetry:** Uploaded CSV data never leaves the browser environment; it is parsed locally and stored in standard `localStorage`.
- **Token Optimization:** Telemetry is heuristically summarized prior to reaching the LLM to avoid data leaks of full infrastructure topologies and to drastically reduce token consumption.
- **Responsible AI:** The Gemini copilot operates under strict system prompts prohibiting the recommendation of destructive actions on Production systems without engineering verification.

---

## Waste Detection Rules

The deterministic engine utilizes hard-coded FinOps best practices applied during the CSV ingest phase:

| Platform | Heuristic Trigger | Action | Risk Level |
|----------|-------------------|--------|------------|
| **Azure** | PowerState == 'Stopped' or 'Deallocated' | Cleanup (Delete Resource) | Low |
| **Azure** | CPU Average < 10% | Rightsize (Downscale Compute) | Medium |
| **VMware** | Snapshot Count > 3 AND Oldest > 30 Days | Cleanup (Consolidate Snapshots) | Low |
| **VMware** | CPU Average < 5% | Rightsize (Reclaim Resources) | Medium |
| **NetApp/Pure** | Last Access > 90 Days | Archive (Move to Cold Tier) | High |
| **Rubrik** | Unattached Backup Object | Cleanup (Expire SLA) | Low |

*(When running without CSVs, the platform utilizes realistic `mockFactory` data generation to simulate a $400k/mo enterprise environment).*

---

## Quick Start Guide

### Prerequisites
- Node.js (v20+ recommended)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/) (Required only for the AI Copilot backend).

### How to Run Locally

1. **Clone the repository & install dependencies:**
   ```bash
   git clone https://github.com/your-org/hybrid-finops-command-center.git
   cd hybrid-finops-command-center
   npm install
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API Key to `.env.local`: `GEMINI_API_KEY="your-key-here"`

3. **Start the local server:**
   To test the full suite (including the Serverless backend), use the Vercel CLI:
   ```bash
   npx vercel dev
   ```
   *Note: Using standard `npm run dev` will boot the frontend successfully, but Copilot requests will intentionally failover to the offline deterministic engine.*

### How to Build & Deploy to Vercel

The application is natively tuned for Vercel deployment.

1. Commit and push your code to a GitHub repository.
2. In the Vercel Dashboard, select **Import Project** and point to your repository.
3. In the Deployment Settings, expand **Environment Variables** and add `GEMINI_API_KEY`.
4. Click **Deploy**. Vercel will automatically execute `npm run build` (`tsc -b && vite build`) and host the Edge function.

---

## Live Demo

Production deployment:
[https://hybrid-finops-cc.vercel.app](https://hybrid-finops-cc.vercel.app)

Demo flow:
1. Start with the **Executive Overview** and explain the Hybrid Waste Score.
2. Open **Platform Topology** to show cross-domain waste across Azure, VMware, Oracle VM, NetApp, Pure, Rubrik, and SharePoint.
3. Use the **Savings Opportunity Board** to show owner-aware, risk-adjusted recommendations.
4. Ask the **AI Copilot** for a 30/60/90 optimization plan.
5. Export the executive **Markdown report**.

---

## Roadmap

- [x] **v0.1.0:** Portfolio MVP (UI framework, CSV Intelligence Engine, Gemini Copilot, Bilingual).
- [ ] **v0.2.0:** ServiceNow / Jira Workflow (ITSM integration for one-click ticket generation).
- [ ] **v0.3.0:** Real API Connectors (Direct read-only integrations with Azure Resource Graph and vCenter).

---

*This application is a conceptual enterprise SaaS architecture designed for portfolio demonstration and product strategy validation.*
