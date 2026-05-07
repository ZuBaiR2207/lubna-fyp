# How to Check if Node.js is Installed

## Method 1: Check via Command Prompt/PowerShell

Open **Command Prompt** or **PowerShell** and type:

```bash
node --version
```

**If Node.js is installed**, you'll see something like:
```
v18.17.0
```
or
```
v20.10.0
```

**If Node.js is NOT installed**, you'll see:
```
'node' is not recognized as an internal or external command
```

---

## Method 2: Check npm (Node Package Manager)

Also check if npm is available:

```bash
npm --version
```

**If npm is installed**, you'll see something like:
```
9.8.1
```

**If npm is NOT installed**, you'll see:
```
'npm' is not recognized as an internal or external command
```

---

## Method 3: Check via Windows Search

1. Press **Windows Key**
2. Type "Node.js" in the search bar
3. If Node.js is installed, you'll see "Node.js command prompt" or similar

---

## Method 4: Check Program Files

1. Open **File Explorer**
2. Navigate to: `C:\Program Files\nodejs\`
3. If this folder exists, Node.js is installed

---

## Result: Node.js is NOT Installed

If Node.js is not installed, follow these steps:

### Step 1: Download Node.js
1. Go to: **https://nodejs.org/**
2. Download the **LTS (Long Term Support)** version
   - This is the recommended stable version
   - Usually shows as "Recommended For Most Users"

### Step 2: Install Node.js
1. Run the downloaded installer (`.msi` file)
2. Click "Next" through the installation wizard
3. **Important**: Make sure "Add to PATH" option is checked (usually checked by default)
4. Complete the installation

### Step 3: Verify Installation
1. **Close and reopen** your Command Prompt/PowerShell
2. Run these commands again:
   ```bash
   node --version
   npm --version
   ```
3. You should now see version numbers

### Step 4: Restart Your Computer (if needed)
Sometimes you need to restart your computer for PATH changes to take effect.

---

## After Installing Node.js

Once Node.js is installed, you can proceed with the SLMS setup:

1. **Install project dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run setup
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

---

## Troubleshooting

### "node is not recognized" after installation
- **Solution**: Restart your Command Prompt/PowerShell
- If still not working, restart your computer
- Check if Node.js was added to PATH during installation

### "npm is not recognized"
- npm comes with Node.js, so if node works but npm doesn't, try reinstalling Node.js
- Make sure you downloaded the full installer, not just the runtime

### Still having issues?
- Try installing Node.js again
- Make sure you're using the LTS version
- Check Windows system requirements

---

## Quick Test

After installation, test with a simple command:

```bash
node -e "console.log('Node.js is working!')"
```

You should see: `Node.js is working!`
