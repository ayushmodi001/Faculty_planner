# 🎓 UAPS: University Academic Planning System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple)

> **The next-generation academic scheduler that combines Smart AI Reasoning with Deterministic Logic.**

---

## 🚀 Overview

**UAPS (University Academic Planning System)** solves the complex problem of academic scheduling by bridging the gap between rigid calendar constraints and flexible syllabus requirements.

Traditional systems are either too rigid (Excel sheets) or too chaotic (manual planning). UAPS uses **Large Language Models (LLMs)** to intelligently structure a course syllabus based on semantic understanding (prerequisites, complexity), and then uses **deterministic algorithms** to map that structure onto a real-world university calendar, accounting for holidays, faculty availability, and exam buffers.

### Key Value Proposition
- **🤖 Smart Syllabus Parsing**: Upload a raw text syllabus, and the AI breaks it down into logical lecture units.
- **📅 Deterministic Scheduling**: Guarantees simple, conflict-free mapping to the calendar.
- **⚡ Reactive Re-planning**: If a class is missed, the system automatically shifts future topics or suggests "Self-Study" compression strategies.

---

## ✨ Features

### Phase 1: Core Architecture (✅ Completed)
- **Next.js 15 App Router**: Server-side rendering and Server Actions for maximum performance.
- **MongoDB + Mongoose**: Strongly typed schemas with connection pooling for serverless environments.
- **Global Caching**: Optimized specifically for Vercel/Serverless deployment.
- **Premium UI**: Glassmorphism design system with dark mode support.

### Phase 2: HOD Admin Console (🚧 In Progress)
- **Interactive Calendar**: Visual interface to toggle holidays and special working days.
- **Faculty Management**: Define availability and subject constraints.
- **Department Settings**: Set semester start/end dates and lecture durations.

### Phase 3: The "Smart" Engine (Planned)
- **LLM Integration**: Uses OpenRouter (Llama 3 / Mistral) to "understand" course topics.
- **Budgeting Algorithm**: "We have 40 lectures but 45 topics. Which 5 can be self-study?"
- **Conflict Resolution**: Auto-detects timing clashes.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/) (with Mongoose ODM)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **AI Provider**: [OpenRouter](https://openrouter.ai/)
- **Validation**: [Zod](https://zod.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + custom Glassmorphism utilities

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas Account (Free Tier is fine)
- OpenRouter API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayushmodi001/Faculty_planner.git
   cd Faculty_planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Duplicate `.env.local.example` to `.env.local` and add your keys:
   ```bash
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/uaps
   OPENROUTER_API_KEY=sk-or-v1-...
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📸 Screenshots

*(Coming Soon: Admin Dashboard & Calendar Views)*

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by University Developers
</p>
