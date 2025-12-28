# 🛡️ FINNOVATE: Merchant Shield

**Merchant Shield** is a high-performance fraud detection system that utilizes machine learning to secure transactions in real-time. It features a robust **Flask** backend and a **React-based** merchant dashboard to provide instant risk assessments and detailed audit logs.

---

## 📌 Problem Statement

E-commerce platforms face significant financial losses due to fraudulent credit card transactions. This project provides a standalone solution to:

* Identify high-risk transactions before they are processed.
* Offer transparent reasoning for flagged events via a technical dashboard.
* Provide a seamless integration point for merchants via a RESTful API.

## 🧠 The ML Approach

* **Model Selection:** The system utilizes a **Random Forest Classifier**, which was chosen over Logistic Regression for its superior handling of complex, non-linear fraud patterns.
* **Feature Selection:** The model focuses on the `Amount` and PCA-transformed variables `V1` through `V28`.
* **Data Handling:** The `Time` attribute is excluded to ensure model generalizability across different timeframes.
* **Optimization:** The pipeline uses stratified splits and handles class imbalance to ensure high precision in detecting rare fraud cases.

## 🛠️ Tech Stack

The project is built with the following technologies:

* **Backend:** Flask, PyJWT (Authentication), Werkzeug.
* **Machine Learning:** Scikit-learn, Pandas, Joblib.
* **Database:** MongoDB (via PyMongo).
* **Frontend:** React, Vite, Context API.
* **Environment:** Python-Dotenv.

---

## 📂 Project Structure

Based on the repository's current architecture:

```text
merchant-shield-api/
├── app/                 # Backend Core
│   ├── app.py           # Flask Entry Point
│   ├── auth.py          # JWT Authentication
│   ├── db_utils.py      # MongoDB Utilities
│   └── validation.py    # Request Validation
├── model/               # ML Artifacts
│   ├── model_v1.pkl     # Trained Random Forest Model
│   └── schema.json      # Feature Schema
├── src/                 # Frontend (React)
│   ├── components/      # UI: RiskGauge, PaymentForm, etc.
│   ├── context/         # Auth and Toast State
│   └── services/        # API Integration (api.js)
├── requirements.txt     # Backend Dependencies
└── package.json         # Frontend Dependencies

```

---

## 🚀 Local Setup Instructions

### 1. Repository Setup

Clone the project to your local machine:

```bash
git clone <your-repository-link>
cd merchant-shield-api

```

### 2. Backend Installation & Start

Install the necessary Python packages and launch the Flask server:

```bash
# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python3 app.py

```

### 3. Frontend Installation & Start

Navigate to the frontend source directory to launch the dashboard:

```bash
# Install Node dependencies
npm install

# Start the development server
npm run dev

```

---

## ✨ Key Features

* **Risk Gauge:** Real-time visual representation of fraud probability.
* **Technical Panel:** Detailed breakdown of feature influences for administrators.
* **Secure Auth:** JWT-protected routes for merchant and admin access.
* **Automated Logging:** All flagged transactions are stored in MongoDB for future model retraining.

---

## 📸 Screenshots & Demos

* **Merchant Dashboard:** Instant view of transaction health.
* **Risk Analysis:** Demonstration of the `RiskGauge.jsx` flagging a fraudulent payload.
* **Admin Audit:** Table view of historical transaction scores.
