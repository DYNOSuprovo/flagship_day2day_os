# How to Deploy "Flagship" Online

Since this application uses **Docker Compose** and **SQLite** (for data persistence), the best and most reliable way to deploy it online is using a **Virtual Private Server (VPS)**.

This ensures your database file (`flagship.db`) is saved on a real disk and isn't lost when the server restarts (which happens on platforms like Vercel).

## Recommended Providers
-   **DigitalOcean** (Droplet) - ~$6/mo
-   **AWS** (EC2) - Free tier available
-   **Hetzner** - Very cheap, high performance
-   **Linode** / **Vultr**

---

## Step-by-Step Deployment Guide (VPS)

### 1. Get a Server
1.  Sign up for a provider (e.g., DigitalOcean).
2.  Create a new **Droplet** (or Instance).
3.  Choose **Ubuntu 22.04 LTS** (or newer).
4.  Choose a plan with at least **2GB RAM** (to handle the build process).

### 2. Connect to your Server
Open your terminal (or Command Prompt) and SSH into your new server:
```bash
ssh root@<YOUR_SERVER_IP>
```

### 3. Install Docker
Run these commands on your server to install Docker and Docker Compose:
```bash
# Update repositories
apt-get update

# Install Docker
apt-get install -y docker.io

# Install Docker Compose
apt-get install -y docker-compose

# Start Docker
systemctl start docker
systemctl enable docker
```

### 4. Get Your Code
You have two options:
**Option A: Git (Recommended)**
Push your code to GitHub, then clone it on the server:
```bash
git clone https://github.com/yourusername/flagship.git
cd flagship
```

**Option B: Copy Manually (SCP)**
If you don't use GitHub, copy your project folder from your local machine:
```bash
# Run this on your LOCAL machine, NOT the server
scp -r d:/app/flagship root@<YOUR_SERVER_IP>:/root/flagship
```

### 5. Configure Environment
Create your `.env` file on the server:
```bash
cd flagship
nano .env
```
Paste your API key:
```
GEMINI_API_KEY=AIzaSyDp-mzHD9Nyk1T3xCPRyrc1RCiVLZzkNy8
```
Press `Ctrl+X`, then `Y`, then `Enter` to save.

### 6. Run It!
Build and start the application just like you did locally:
```bash
docker-compose up --build -d
```

### 7. Access Your App
Open your browser and visit:
`http://<YOUR_SERVER_IP>:3000`

---

## Alternative: Railway.app (Easier, but costs money)
If you don't want to manage a server, you can use **Railway**:
1.  Push your code to GitHub.
2.  Login to [Railway.app](https://railway.app).
3.  "New Project" -> "Deploy from GitHub repo".
4.  Railway will detect the `docker-compose.yml`.
5.  **Crucial**: You must add a **Persistent Volume** for the backend service mounted at `/app/data` to save your SQLite database.
