# DeskFlow — Support Ticket Triage Board

DeskFlow is a production-ready, Kanban-style support ticket triage board that helps support teams manage customer tickets, track SLA compliance, and visually transition tickets through defined lifecycles.

---

## Live Deployment Links
- **Frontend App (Vercel)**: *[Will be updated post-deployment]*
- **Backend API (Render)**: https://bajaj-api-rohan-vishwakarma.onrender.com

---

## Tech Stack

### Frontend
- **React + Vite** (Single Page Application)
- **Tailwind CSS** (Utility-first styling with modern dark theme)
- **Axios** (API communications)
- **React Hot Toast** (Reactivity alerts and validation notifications)
- **React Icons** (Visual icons)
- **@dnd-kit/core** (Fluid drag-and-drop Kanban movement)

### Backend
- **Node.js** & **Express.js** (Server layer)
- **MongoDB Atlas** & **Mongoose** (Database & Model validation)
- **dotenv** (Configuration management)
- **CORS** (Secure cross-origin requests)
- **Nodemon** (Development hot reloading)

---

## Application Directory Structure

```
DeskFlow/
 ├── backend/
 │    ├── config/          # Database configuration
 │    ├── controllers/     # Controller logics (CRUD & Stats)
 │    ├── middleware/      # Error handler
 │    ├── models/          # Mongoose schemas & Virtual properties
 │    ├── routes/          # REST Endpoint declarations
 │    └── utils/           # Status transition validators
 └── frontend/
      ├── src/
      │    ├── api/        # Axios API client
      │    ├── components/ # Kanban UI, Column, Card, Modal, Stats
      │    └── utils/      # Age formatting & priority stylings
```

---

## Environment Variables

### Backend (`/backend/.env`)
Create a `.env` file inside the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/deskflow?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

### Frontend (`/frontend/.env`)
Create a `.env` file inside the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000
```

---

## API Endpoints

### Ticket CRUD Operations

#### 1. Create Ticket
- **Endpoint**: `POST /tickets`
- **Body Request**:
  ```json
  {
    "subject": "Email delivery failing",
    "description": "Emails are bouncing back with a 550 error.",
    "customerEmail": "user@domain.com",
    "priority": "high"
  }
  ```
- **Responses**:
  - `201 Created` on success.
  - `400 Bad Request` if missing fields or invalid format/priority.

#### 2. Get Tickets (with filters)
- **Endpoint**: `GET /tickets`
- **Query Params**:
  - `status`: Filter by `open`, `in_progress`, `resolved`, `closed`
  - `priority`: Filter by `low`, `medium`, `high`, `urgent`
  - `breached`: Filter by `true` to fetch breached tickets
- **Example**: `GET /tickets?priority=high&breached=true`

#### 3. Update Status
- **Endpoint**: `PATCH /tickets/:id`
- **Body Request**:
  ```json
  {
    "status": "in_progress"
  }
  ```
- **Constraint Rules**:
  - Single-step forward only (`open` ➔ `in_progress` ➔ `resolved` ➔ `closed`).
  - Single-step backward only (e.g. `closed` ➔ `resolved`, `resolved` ➔ `in_progress`).
  - Skipping steps (e.g., `open` ➔ `resolved`) returns `400 Bad Request`.
  - Setting status to `resolved` or `closed` computes `resolvedAt`. Moving backward clears it.

#### 4. Delete Ticket
- **Endpoint**: `DELETE /tickets/:id`

#### 5. Get Analytics Stats
- **Endpoint**: `GET /tickets/stats`
- **Returns**: Counts per status, priority, and total currently breached.
  ```json
  {
    "success": true,
    "data": {
      "statusCounts": { "open": 3, "in_progress": 2, "resolved": 1, "closed": 0 },
      "priorityCounts": { "low": 1, "medium": 3, "high": 1, "urgent": 1 },
      "breachedCount": 2
    }
  }
  ```

---

## SLA Targets & Logic
SLA targets are defined as:
- **Urgent**: 1 hour
- **High**: 4 hours
- **Medium**: 24 hours
- **Low**: 72 hours

*Dynamic Read calculations:*
1. `ageMinutes`: Time since creation until `resolvedAt` (if resolved/closed) or `new Date()` (if unresolved).
2. `slaBreached`: `true` if `ageMinutes` exceeds the corresponding priority threshold.

---

## Getting Started

### Prerequisites
- Node.js installed (v18+)
- MongoDB Atlas account (free tier)

### 1. Run the Backend
1. Open a terminal and navigate to the backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file with your Mongo URI.
4. Run in development mode:
   ```bash
   npm run dev
   ```
The backend server will run on `http://localhost:5000`.

### 2. Run the Frontend
1. Open a new terminal and navigate to the frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
The frontend web page will launch on `http://localhost:5173`.

---

## Screenshots Section
*(Screenshots of Kanban Board, Filters, Stats Strip, and Create Form will be added once running)*
