# MDR Triage Automation Tool (Medical Device Reporting)

## 📋 Overview
A Python-based automation tool designed to streamline the **Post-Market Surveillance (PMS)** triage process. This tool ingests unstructured complaint descriptions, applies Natural Language Processing (NLP) and keyword logic to assess risk, and suggests appropriate FDA/IMDRF regulatory codes.

**Goal:** Reduce manual review time for high-volume complaint handling (GCH) and standardize decision-making for regulatory reporting.

## 🚀 Key Features
* **Automated Risk Assessment:** Scans event descriptions for high-risk keywords (e.g., "spark," "fire," "injury," "failure to pace") to flag serious adverse events.
* **FDA Code Mapping:** Suggests potential **FDA 21 CFR 803** and **IMDRF** codes based on failure modes detected in the text.
* **Data Cleansing:** Standardizes input data (dates, product codes) to ensure TrackWise/SAP compatibility.
* **Batch Processing:** Capable of processing .CSV or .XLSX datasets containing thousands of rows in seconds.

## 🛠️ Tech Stack
* **Language:** Python 3.9+
* **Libraries:** `pandas` (Data Manipulation), `re` (Regular Expressions), `nltk` (Text Processing), `streamlit` (UI/Dashboard).

## ⚡ How It Works
1.  **Input:** User uploads a raw export of complaint data (Excel/CSV).
2.  **Processing:** The script normalizes text, removes stopwords, and runs a decision-tree algorithm against a library of known failure modes.
3.  **Output:** A clean dataset with appended columns for `Suggested_Classification`, `Risk_Level`, and `Review_Priority`.

## ⚠️ Disclaimer
*This repository contains a **sanitized, demo version** of the logic used in production environments. No proprietary patient data, specific device design history, or confidential internal SOPs are included in this code.*

---
*Created by [Your Name] - Regulatory Operations & Automation Specialist*
