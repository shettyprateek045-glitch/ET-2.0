# DataCentre AI EPC Intelligence Platform

An enterprise-grade platform harnessing the power of predictive AI, multi-agent workflows, and semantic document intelligence to design, build, and commission hyperscale data centres on-time and within specification.

## 🚀 Features

*   **Quality Compliance Agent**: Automated parsing of engineering drawings and standards against NEC, ASHRAE, and site guidelines.
*   **Predictive Schedule Engine**: Analyzes lead times, weather data, and crane/rigging schedules to predict bottlenecks.
*   **Supply Chain Risk Scout**: Monitors vendor financial status, lead time trends, and shipping backlogs.
*   **Commissioning QA Copilot**: Checks load step performance, heat run logs, and captures electronic certifications.
*   **RFI Knowledge Agent**: Vector-powered RAG matching contractor questions against project contracts and historical data.

## 🛠️ Technology Stack

*   **Frontend**: React, Next.js, Tailwind CSS, Framer Motion, Recharts, Lucide React
*   **Backend Options**:
    *   **Python FastAPI**: FastAPI, SQLAlchemy, SQLite/PostgreSQL, Uvicorn
    *   **Node.js Express**: Express.js, MongoDB (Mongoose), JWT, Multer
*   **AI/ML**: Langchain, FAISS (vector DB), OpenCV, PyTesseract (OCR)

## 📦 Project Structure

*   `frontend/`: Next.js web application.
*   `backend/`: FastAPI backend server.
*   `backend_node/`: Express.js + MongoDB backend server.

## ⚙️ Local Development Setup

### Backend (Option A: Node.js + MongoDB)

1.  Ensure you have a local MongoDB instance running at `mongodb://127.0.0.1:27017/datacentre_ai`.
2.  Navigate to the `backend_node` directory:
    ```bash
    cd backend_node
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm start
    ```
    The server will boot up and seed initial mock database records.

### Backend (Option B: Python FastAPI)

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the development server:
    ```bash
    python run.py
    ```
    The API will be available at `http://127.0.0.1:8000`.

### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## ☁️ Deployment

*   **Frontend**: Configured for Vercel deployment (see `vercel.json`).
*   **Backend**: Configured for Render/Railway deployment (see `render.yaml`).
