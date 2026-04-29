PlanIT: AI-Integrated Research Workstream and Database Management SystemPlanIT is a high-performance academic management platform designed for scholars to streamline research workstreams through intelligent automation and robust database architecture. Developed as a capstone project for the 21CSC550J - Database Technology course at SRM Institute of Science and Technology, PlanIT demonstrates the transition from relational database concepts to a modern, NoSQL document-oriented implementation.  🚀 Key FeaturesScholar Insights (AI Integration): Leverages the Google Gemini API to process project metadata and generate predictive academic advice and task prioritization.  Intelligent Dashboard: Features real-time workstream filtering and a secure JSON Data Export system for local research backups.  Dynamic 24-Hour Scheduler: An interactive calendar grid that maps MongoDB schedules documents to specific time slots using complex CSS grid positioning logic.  Weekly Activity Statistics: Visualizes research progress through stacked bar charts and efficiency gauges powered by Recharts.  Celebration Engine: A high-density UX feature that triggers a randomized 500-piece confetti burst via Framer Motion upon the completion of major research milestones.  🛠️ Technical StackFrontend: React 19 (Vite), Tailwind CSS, Framer Motion, Lucide-React.  Backend: Node.js, Express.js.  Database: MongoDB (Node.js Driver).  AI: Google Gemini API.  Data Visualization: Recharts.  📊 Database ArchitectureThe system utilizes a document-oriented model with the following core collections:  projects: Manages top-level research metadata, titles, and overall status.  tasks: Stores individual granular items linked to specific projects.  schedules: Manages time-sensitive events with startTime, endTime, and categorized workloads (Work/Study).  💻 Installation & SetupClone the repository:Bashgit clone https://github.com/yourusername/PlanIT.git
Install dependencies:Bashnpm install
Environment Configuration:Create a .env file in the root directory and add your credentials:Code snippet    MONGODB_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_google_gemini_key
    ```
4.  **Run the application:**
    ```bash
    npm run dev
    ```

## 🎓 Academic Context

*   **Institution:** SRM Institute of Science and Technology, Kattankulathur[cite: 1].
*   **Course:** 21CSC550J - Database Technology[cite: 1].
*   **Objective:** To demonstrate proficiency in MERN stack development, NoSQL schema design, and AI-driven data processing[cite: 1].

## 👥 Authors

*   **Piyush Pardesi** - Master of Technology, CSE[cite: 1].
*   **[Insert Partner Name]** - Master of Technology, CSE[cite: 1].
