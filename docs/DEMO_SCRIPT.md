# Hybrid FinOps Command Center: Demo Scripts

This document provides tailored scripts for presenting the application to different audiences.

## The 90-Second Core Demo

*"Welcome to the Hybrid FinOps Command Center. Traditional cloud billing tools only show what you've spent on public cloud. But enterprise waste hides everywhere: in oversized on-premise VMs, orphaned NetApp storage, and forgotten M365 licenses.*

*This platform is an AI-native waste intelligence engine. We normalize telemetry across Azure, VMware, Oracle, NetApp, Pure Storage, Rubrik, and SharePoint into a single pane of glass.*

*On the **Executive Overview**, you immediately see our proprietary Hybrid Waste Score and the true risk-adjusted savings potential.*

*Drilling down into the **Savings Opportunity Board**, we don't just list resources; our deterministic engine flags exact actions—like downsizing a specific Azure VM—with an calculated risk level and an owner.*

*To execute, we open the **AI FinOps Analyst**. Powered securely by Gemini 2.5 via Serverless Edge, I can ask for a '30-day optimization plan'. The AI parses our normalized data and outputs a structured execution plan.*

*Finally, with one click, we can export a Markdown-ready executive report for the CIO."*

---

## Audience-Specific Variations

### 1. The Recruiter Version (Focus: Impact & Skills)
"I built this application to showcase a complete B2B SaaS lifecycle. I acted as the Product Manager, UX Designer, and Lead Engineer. It uses React, Vite, and Tailwind v4 for a premium dark-mode interface, and integrates Google Gemini via Vercel Serverless Edge functions. It proves I can build complex, data-dense applications that look boardroom-ready and solve real business problems, rather than just basic crud apps."

### 2. The CIO / Client Version (Focus: Value & Security)
"Your biggest problem isn't data collection, it's actionable intelligence. We ingest your cross-platform telemetry securely—the data stays strictly within the browser and is evaluated offline by our deterministic rules engine. Only sanitized, token-optimized context is sent to the Gemini AI to generate action plans. You get instant visibility into where your money is bleeding across VMware and Azure, without risking production stability."

### 3. The Technical Interviewer Version (Focus: Architecture)
"The core challenge was unifying disparate telemetry formats from 7 different vendors without a heavy backend. I solved this by building a client-side CSV staging area using PapaParse and a normalized React Context state machine. For the AI Copilot, I implemented a Vercel Serverless function utilizing Google's `genai` SDK with Structured JSON Outputs, guaranteeing deterministic UI rendering. If the API fails or is unconfigured, I implemented a seamless fallback to local regex heuristics to ensure the app never breaks in production."
