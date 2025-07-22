# 👁️‍🗨️ Drishti Event AI

**Drishti Event AI** is an AI-powered real-time crowd monitoring and anomaly detection system built using Firebase and integrated tools. It is designed to enhance public safety at large gatherings or events by monitoring live footage, analyzing crowd density, detecting unusual behaviors, and assisting in missing person identification.

## 🔍 Features

### 🔴 Zone Status Overview

- Monitors 4 live camera zones

- **Scan** button triggers AI analysis
 
- Detects **abnormal activity** and activates buzzer alert
 
- Manual **Stop Buzzer** button available
 
- Displays zone-wise:
 
  - Status
   
  - Risk Level
    
  - Detected Anomaly
    
  - Description

### 🧠 Analysis Tools

Divided into three sections:

#### 1. **Crowd Density**

- Upload image to analyze crowd levels

- Displays:
  
  - **Analysis Result**
    
  - **Crowd Trends** (Graphical View)

#### 3. **Face Match**

- Upload missing person’s photo
  
- Real-time face detection from live footage
  
- Outputs possible matches for missing persons

### 🚨 Alerts Section

- Common across all tools
  
- Displays a historical log of detected abnormal activities

---

## 🛠 Tech Stack

- **Frontend:** Firebase Studio, HTML, JavaScript
  
- **Backend:** Firebase Functions, Firestore

- **AI/ML:** Image Analysis APIs, Face Recognition Models
  
- **Deployment:** Firebase Hosting

---

## 📦 Installation (Cloning to VSCode)

```bash
git clone https://github.com/Dhivyaa12/Drishti-Event-AI.git
cd Drishti-Event-AI
npm install
npm run dev
