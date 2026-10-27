# 📱 Pantry Fresh Mobile App (React Native + Expo)

A cross-platform React Native companion app for **Pantry Fresh (Food Waste Reducer)** with AI Multimodal Vision and OCR.

---

## 🌟 Key Features

### 1. 📷 Smart Product & Expiry Date Auto-Scanner
* **Replaces manual inventory typing entirely.**
* Tap **"Scan Item"** to take a photo of any grocery product, package, or expiration date text (e.g. `EXP 28/10/2026` or `BEST BEFORE`).
* Multimodal AI extracts:
  * **Product Name** (e.g., *Organic Greek Yogurt*, *Almond Milk*)
  * **Food Category** (e.g., *Dairy*, *Produce*, *Bakery*, *Meat & Poultry*)
  * **Expiry Date** (`YYYY-MM-DD` auto-detected via OCR or predicted based on food category)
  * **Quantity & Price**
  * **Optimal Storage Advice**
* Review the detected values, make 1-tap quick adjustments (+3 days, +1 week), and tap **"Add to Pantry Inventory"** to directly save to your MongoDB database.

### 2. 🍲 AI Dish Recognition & Preparation Guide
* Take a photo of any cooked dish or leftovers in your fridge.
* Multimodal AI analyzes the image and returns:
  * **Dish Name & Cuisine** (e.g. *Mediterranean Vegetable Sauté*, *Italian Penne Arbiatta*)
  * **Key Ingredients**
  * **Step-by-step Preparation Guide** (full recipe instructions)
  * **Safe Storage & Freshness Shelf-life**
  * **Zero-Waste Repurposing Ideas** (how to convert leftovers into tomorrow's meal instead of throwing them away)

### 3. 🧺 Pantry Tracker with Visual Expiry Badges
* View all items currently in your inventory.
* Color-coded status:
  * 🔴 **Expired**
  * 🟠 **Expires Today**
  * 🟡 **Expiring in ≤ 3 Days**
  * 🟢 **Fresh**
* Fast search and 1-tap **"Mark Used"** action.

### 4. 🍳 AI Zero-Waste Recipe Generator
* Generates recipes specifically prioritizing items expiring soon in your pantry.

---

## 🚀 How to Run the Mobile App

### Step 1: Ensure Backend Server is Running
From the project root:
```bash
cd server
npm run dev
```

### Step 2: Start Expo Mobile App
In another terminal:
```bash
cd mobile
npm start
```

### Step 3: Open on Your Device
1. **On Physical Phone (Android / iOS):**
   * Install **Expo Go** from Google Play Store or Apple App Store.
   * Open camera or Expo Go and scan the QR code printed in your terminal.
2. **On Android Emulator:** Press `a` in the terminal.
3. **On iOS Simulator (Mac):** Press `i` in the terminal.
4. **On Web Browser:** Press `w` in the terminal.

---

## ⚙️ Connecting Your Phone to Your Computer's Backend

When testing on a **physical phone** via Wi-Fi:
1. Find your computer's local IP address (e.g., in Windows PowerShell run `ipconfig`, look for IPv4 Address like `192.168.1.50`).
2. Open the mobile app.
3. In the top-right corner of the **Pantry** tab, tap the **⚙️ Settings** icon.
4. Enter: `http://192.168.1.50:5000/api` and tap **Save Endpoint**.

*(For Android Emulator, `http://10.0.2.2:5000/api` is used automatically).*
