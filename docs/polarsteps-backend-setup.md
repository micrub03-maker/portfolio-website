# Polarsteps Backend — Setup & Run Guide

This doc explains how to run the local Polarsteps API that powers the **TravelMap** widget on the About/Home page.

> **Note:** This backend uses the unofficial [polarsteps-api](https://github.com/remuzel/polarsteps-api) library, which relies on undocumented Polarsteps internal APIs. It is for personal use only and may break without notice.

---

## Prerequisites

- Python 3.9+
- `pip`
- A Polarsteps account (username: `micrub03`)

---

## 1 — Get your Polarsteps token

The API authenticates using the `remember_token` cookie from your browser session.

1. Go to [polarsteps.com](https://www.polarsteps.com) and log in.
2. Open **DevTools** (`F12` or right-click → Inspect).
3. Go to the **Application** tab → **Cookies** → `https://www.polarsteps.com`.
4. Find the cookie named **`remember_token`** and copy its value.

> The token can expire. If you get auth errors, repeat these steps and update your `.env`.

---

## 2 — Install `polarsteps-api`

This library is not on PyPI, so clone and install it manually:

```bash
git clone https://github.com/remuzel/polarsteps-api
cd polarsteps-api
pip install -e .
cd ..
```

---

## 3 — Install backend dependencies

```bash
cd "C:\Users\micru\portfolio website\portfolio-website\polarsteps-backend"
pip install -r requirements.txt
```

This installs `fastapi`, `uvicorn`, and `python-dotenv`.

---

## 4 — Configure the `.env` file

The backend folder already has a placeholder `.env`. Edit it:

```
polarsteps-backend/.env
```

Replace `your_token_here` with the token you copied in step 1:

```
POLARSTEPS_REMEMBER_TOKEN=eyJhbGci...
```

The `.env` file is git-ignored and will never be committed.

---

## 5 — Run the server

From the `polarsteps-backend/` folder:

```bash
uvicorn server:app --reload
```

The API will be available at:

```
http://localhost:8000/api/polarsteps
```

You can open that URL in a browser to confirm it returns JSON with your travel stats.

---

## 6 — Run the portfolio dev server

In a separate terminal, from the `portfolio-website/` folder:

```bash
npm run dev
```

Navigate to the **About** page. The TravelMap widget will fetch from the backend and display your countries, km traveled, and trip count.

---

## How it works

```
Browser (Vite :5173)
    └── TravelMap.jsx
            └── fetch GET http://localhost:8000/api/polarsteps
                        └── polarsteps_fetcher.py
                                └── polarsteps-api (unofficial)
                                        └── Polarsteps internal API
```

---

## Production / GitHub Pages

The backend is **local-only** and not deployed. On the live GitHub Pages site the TravelMap widget detects the failed fetch and shows a "Backend offline" message instead of breaking.
