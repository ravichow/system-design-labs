# System Design Labs ⚡

An interactive, visual system design platform featuring a hand-crafted 2.5D isometric vector diagram engine, interactive step-by-step architectural lessons, real-time chaos traffic simulator (**Design Lab**), production incident dilemma challenge mode (**Practice**), and back-of-the-envelope estimation **Cheatsheets**.

Inspired by [designed-to-scale.vercel.app](https://designed-to-scale.vercel.app/) by Dilum Sanjaya, rebuilt and extended to implement the complete vision including all pending modules.

---

## 🎨 Key Features & Architectural Capabilities

### 1. 📖 Learn (Interactive Course)
- **2.5D Isometric SVG Engine**: High-performance SVG-based isometric rendering matrix:
  ```
  X_screen = 14 * (x + y)
  Y_screen = 7 * (x - y) - height
  ```
- **Live Vector Glyphs**: Dynamic isometric rendering for Servers, Layer 7 Load Balancers, PostgreSQL Cylinders, Caches, Clients, Queues, and DNS Resolvers.
- **Dynamic Telemetry & Telemetry Badges**: Real-time CPU meters, glowing thermal heat pulses, crashed node indicators (`DOWN`), and status pills (`200 OK`, `304 Not Modified`, `429 Too Many Requests`).
- **Animated Cable Flows**: Moving packet pulses traveling along cables with bounce, rate, and latency indicators.
- **Interactive Step Scrubber**: Step-by-step breakdown with architectural diff badges (`+ Web Server`, `~ DNS Cached`, `- Direct Connection`).
- **Web Speech Narration**: Built-in text-to-speech audio reader (`SpeechSynthesisUtterance`) for automated read-along with pause/resume controls.

### 2. 🎯 Practice (Interactive Challenge Arena)
- **Production Incident Dilemmas**: Multiple-choice scenario-based challenges (Cache Stampedes, Database Sharding Key selection, CAP Theorem network partitions, Hot Keys).
- **In-depth Trade-off Analysis**: Every answer choice reveals real-world trade-offs and architectural rules of thumb.
- **Napkin Math & Capacity Sizing Trainer**: Interactive back-of-the-envelope estimation trainer with instant tolerance verification and step-by-step formula breakdown.
- **Technology & Requirement Matcher**: Architectural requirement to technology mapping (Redis, Kafka, Postgres, Elasticsearch, Cloudflare).

### 3. 🧪 Design Lab (Architecture Sandbox & Chaos Simulator)
- **Live Traffic Engine**: Control traffic from 200 RPS to 15,000+ RPS.
- **Topology Customization**: Scale out stateless app servers horizontally, toggle Redis cache hit rate, and enable edge CDN.
- **Chaos Engineering**: Instant node kill toggles (Kill Load Balancer, Kill Primary Database, Kill App Server) to observe cascading failures and failover resilience in real time.
- **Live Health Metrics**: Real-time throughput gauge, p99 latency curve, 5xx error rate, and dynamic bottleneck diagnostic alerts.

### 4. 📑 Cheatsheets (The System Design Reference)
- **Latency Numbers Every Engineer Should Know**: Interactive comparison table from 1 ns L1 cache to 150 ms transatlantic fiber optic undersea cables, complete with human-scale time analogies.
- **Powers of Two Table**: Quick data sizing conversions (KB, MB, GB, TB, PB).
- **API & Transport Protocol Matrix**: REST vs gRPC vs GraphQL vs WebSockets vs SSE.
- **Caching Strategy Blueprints**: Cache-Aside, Write-Through, Write-Behind, and Refresh-Ahead.
- **The 45-Minute Interview Blueprint**: Phase-by-phase framework (Scope -> Capacity -> High Level Architecture -> Deep Dive & SPOFs).

---

## 🛠️ Tech Stack & Design System

- **Framework**: Modern React 19 + TypeScript + Vite
- **Styling**: Custom CSS variables, warm editorial paper palette (`#f4ebe0`), JetBrains Mono typography, neo-brutalist crisp hard shadows (`1.5px 2.5px 0 var(--drop)`).
- **Theme**: Seamless Light / Dark mode switcher with persistent state.
- **Icons**: Lucide React + custom isometric vector glyphs.
- **Zero Heavy Runtime Bloat**: Pure SVG 2.5D math projection, sub-second initial paint.

---

## 🚀 Getting Started Locally

```bash
# Clone the repository
git clone https://github.com/ravichow/system-design-labs.git
cd system-design-labs

# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## ☁️ Cloudflare Pages Deployment

### Option 1: Via Wrangler CLI
```bash
# Authenticate with Cloudflare
npx wrangler login

# Deploy the production dist folder directly
npx wrangler pages deploy dist --project-name system-design-labs
```

### Option 2: Via GitHub Git Integration
1. Push this repository to GitHub.
2. In Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select this repository:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Deploy!

