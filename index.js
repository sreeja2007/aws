const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My AWS App</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 50px 60px;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4);
    }
    .badge {
      background: #00d4aa;
      color: #000;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 20px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    h1 { font-size: 2.2rem; margin-bottom: 12px; }
    p { color: rgba(255,255,255,0.6); font-size: 1rem; line-height: 1.6; margin-bottom: 30px; }
    .status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(0,212,170,0.1);
      border: 1px solid rgba(0,212,170,0.3);
      border-radius: 10px;
      padding: 12px 20px;
      font-size: 0.9rem;
      color: #00d4aa;
    }
    .dot {
      width: 8px; height: 8px;
      background: #00d4aa;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .stack { margin-top: 30px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .tag {
      background: rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.7);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🚀 Live on AWS</div>
    <h1>Hello, World!</h1>
    <p>This Node.js app is deployed automatically using AWS CodePipeline, CodeBuild, and Elastic Beanstalk.</p>
    <div class="status">
      <div class="dot"></div>
      Application is running healthy
    </div>
    <div class="stack">
      <span class="tag">Node.js</span>
      <span class="tag">Express</span>
      <span class="tag">Elastic Beanstalk</span>
      <span class="tag">CodePipeline</span>
    </div>
  </div>
</body>
</html>
`));

app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
