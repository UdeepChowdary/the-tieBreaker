<div align="center">
  <img width="1200" height="475" alt="The Tiebreaker Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" style="border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);" />
</div>

<br />

# ⚡ The Tiebreaker

> A premium, AI-powered decision-making cockpit designed to untangle complex choices with absolute precision and zero friction.

**The Tiebreaker** is a high-fidelity visual workspace that empowers you to map, weigh, and analyze complex scenarios. Bypassing cumbersome cloud authentications and high-friction login gates, the application offers a lightning-fast, **offline-first local workspace** running on top of an ultra-modern glassmorphic dark-mode HUD theme, powered by Google's Gemini models.

---

## ✨ Features & Visual Highlights

### 🌌 Elite Glassmorphic HUD Aesthetic
*   **Space Glow Accents**: Dynamic violet and cyan blur blooms anchor the background, creating a high-contrast premium workspace.
*   **Modern Typography**: Styled with high-character typefaces (`Outfit` for prominent headings and `Plus Jakarta Sans` for clean, high-legibility interface controls).
*   **Tactile Responsiveness**: Cards lift, borders highlight on hover, and custom spring-loaded numeric badges react instantaneously.

### 🛡️ Frictionless Offline-First Workspace
*   **Supabase Decoupling**: Completely login-free environment. An intelligent, transparent ES6 Proxy wrapper intercepts database requests and stores everything seamlessly inside your browser's secure `localStorage`.
*   **Zero Signup Gates**: Start analyzing immediately without email setups or authentication rate-limiting.

### 📊 Powerful Analysis Methodologies
1.  **Weighted Pros & Cons**: Assign custom weights (+1 to +5) to individual items. The holographic **Tiebreaker Score Gauge** automatically balances the inputs to calculate a live weighted outcome indicator.
2.  **Harmonized SWOT Grid**: A sleek four-quadrant matrix classifying **Strengths, Weaknesses, Opportunities, and Threats** into HSL tailored alert HUD layouts.
3.  **Aligned Comparison Deck**: Side-by-side option cards that align comparison factors **row-by-row** at equal heights. If options have unbalanced counts, missing indicators gracefully preserve perfect horizontal grids.

### 🧠 Gemini AI Engine
*   A secure Express proxy channels user input safely to your local Gemini model configuration, generating instantaneous contextual summaries, SWOT evaluations, or option comparisons.

---

## 🛠️ Architecture & Tech Stack

*   **Frontend**: React (TypeScript), Vite, Tailwind CSS (V3), Lucide React, motion/react
*   **Database/Storage Layer**: Custom ES6 Local-Storage Mock Proxy
*   **Backend**: Node.js, Express, `dotenv` for secure environment keys
*   **AI Engine**: Google Gen AI SDK (Gemini API)

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   A Google AI Studio / Gemini API Key

### Installation

1.  **Clone the repository** (or navigate to your project directory):
    ```bash
    git clone https://github.com/UdeepChowdary/the-tieBreaker.git
    cd the-tieBreaker
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure environment variables**:
    Create a `.env` file in the root directory (do not commit this to public git) and add your Gemini API Key:
    ```env
    PORT=3000
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Launch the development server**:
    ```bash
    npm run dev
    ```

5.  **Explore the App**:
    Open your browser and navigate to **`http://localhost:3000`** to access your private local cockpit.

---

## ⚙️ Secure Configuration

The application is engineered to prevent credentials leaks.
*   The `.env` file is listed in `.gitignore` to ensure API keys are never published publicly.
*   Analysis queries are proxied through a lightweight backend controller so that keys are never exposed to the client side.

---

<div align="center">
  <sub>Built for rapid, logical, and beautiful decision-making.</sub>
</div>
