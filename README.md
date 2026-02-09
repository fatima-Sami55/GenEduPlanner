# AskGem - AI-Powered Educational Roadmap

AskGem is a modern, AI-driven web application designed to help students discover their ideal career path and academic roadmap. By analyzing student interests, strengths, and goals through an interactive questionnaire, it generates a personalized, step-by-step educational strategy using Google's Gemini AI.

## 🚀 Features

### 🌟 Core Functionality
- **Interactive Questionnaire**: AI-driven chat interface that adapts to student responses.
- **Personalized Roadmap**: Generates a detailed, phase-by-phase career and education plan.
- **University Recommendations**: Suggests top-tier institutions and courses tailored to the student's profile.
- **PDF Export**: Download the complete career plan as a professional PDF report.

### 🎨 Premium UI/UX
- **Modern Design**: Built with Tailwind CSS, featuring glassmorphism, gradients, and smooth animations (Framer Motion).
- **Dark Mode**: Fully supported dark mode with a toggle switch, persisting user preference.
- **Responsive Layout**: optimized for all devices, from mobile to desktop.
- **Interactive Cards**: detailed modal views for roadmap phases with cost estimates and actionable steps.

### 🛠️ Technical Highlights
- **Smart Route Protection**: Ensures users cannot access results without completing the assessment, handling page reloads gracefully via local storage persistence.
- **Robust Error Handling**: informative empty states (e.g., "Sad Robot" for no plan) and API error management.
- **Data Persistence**: Backend uses file-based storage (`profiles.json`) to persist session data across server restarts.
- **AI Integration**: Powered by **Google Gemini 1.5 Flash / 2.0 Flash** for high-speed, intelligent responses.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide React, jsPDF.
- **Backend**: Node.js, Express.js.
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`).
- **Storage**: JSON-based local file storage (Server) / LocalStorage (Client).

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/AskGem.git
cd AskGem
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd client
npm install
npm run dev
```

## 🛡️ Usage

1.  Open the application (default: `http://localhost:5173`).
2.  Click **"Start Planning"** to begin the assessment.
3.  Answer the AI's questions to build your profile.
4.  Wait for the **Analysis** to complete.
5.  View your **Results**: Explore recommedations and your personalized roadmap.
6.  **Toggle Theme**: Use the Sun/Moon icon in the navbar to switch modes.
7.  **Download PDF**: Save your plan for later.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

MIT License
