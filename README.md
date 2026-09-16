# SMARTSCAN — Mission-Adaptive Receiver Search Strategy (RSS) Engine
### DRDO Problem Statement ID: SIH26055 | Smart India Hackathon 2026
**Team:** The Pioneers  
**Theme:** Clean & Green Technology / Defence Software

---

## 🎯 Executive Summary
Traditional super-heterodyne ESM receivers have an Instantaneous Bandwidth (IBW) far narrower than the full threat band (e.g. 2 GHz IBW across 16 GHz band = 12.5% single-look coverage). Fixed round-robin sweeps are easily defeated by modern frequency-agile and AESA radar emitters.

**SMARTSCAN** replaces fixed sweeps with a mission-adaptive closed-loop search strategy:
1. **SENSE**: Tune to sub-band with finite retune latency modeling.
2. **EXTRACT PDW**: Measure Pulse Descriptor Words (RF carrier, PW, PRI, AoA, Amplitude, ToA).
3. **SCORE**: De-interleave complex overlapping pulse trains, update Bayesian threat belief distribution.
4. **RE-PLAN**: Contextual-Bandit / Reinforcement Learning scheduler dynamically ranks sub-bands and generates optimal dwell lists `{sub_band, dwell_time, revisit_period, priority}`.

---

## 🚀 Tech Stack
- **Core Framework**: React 18+ with TypeScript & Vite
- **Data & Server State**: `@tanstack/react-query` & `axios`
- **Live Streaming**: `reconnecting-websocket` with high-speed pulse physics engine
- **Visualizations**: Real-time 2D Canvas Spectrogram Waterfall, 360° Tactical AoA Polar Scope, and `recharts` for Cumulative POI & TTI Latency curves
- **Tables**: `@tanstack/react-table` for sortable/filterable emitter tracks and dwell schedules
- **State Management**: `zustand` for tactical UI telemetry, filters, and audio toggles
- **Forms & Validation**: `react-hook-form` + `zod` for MDD radar threat signature CRUD
- **Styling**: TailwindCSS with custom Defence Avionics HUD theme & Web Audio API synthesizer

---

## 📦 How to Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 📊 Modules & Capabilities

- **Live Mission Ops HUD**: Real-time 4-step pipeline animation (`SENSE` $\rightarrow$ `EXTRACT` $\rightarrow$ `SCORE` $\rightarrow$ `RE-PLAN`), sub-band tuner indicator, and live pulse stream.
- **RF Spectrogram Waterfall (2.0–18.0 GHz)**: Real-time scrolling thermal waterfall with active receiver IBW tuning window overlay.
- **360° Polar AoA Scope**: Azimuth PPI radar scope with bearing strobes, amplitude rings, and confidence rings.
- **Strategy Benchmarks ($P_{\text{cum}} = 1 - (1 - p)^N$)**: Head-to-head comparison between Round-Robin, MDD-Weighted, and SmartScan Bandit.
- **Monte-Carlo Validation Harness ($\ge 1000$ Runs)**: Batch stochastic simulation with PRI jitter (0–25%), pulse dropouts (0–35%), and agile hopping to produce 95% confidence intervals on TTI.
- **MDD Threat Library Editor**: Full CRUD interface with Zod validation for adding/modifying radar threat signatures and exporting JSON mission libraries.
