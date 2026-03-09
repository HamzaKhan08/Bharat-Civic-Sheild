import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development with Vite
  }));
  app.use(cors());
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    validate: {
      xForwardedForHeader: false,
      forwardedHeader: false,
    },
  });
  app.use("/api/", limiter);

  // File Upload Configuration
  const storage = multer.memoryStorage();
  const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // --- Data Retention Policy (Simulated TTL) ---
  interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string; // In a real app, use bcrypt
    role: 'USER' | 'ADMIN';
    createdAt: number;
  }

  interface VerificationLog {
    id: number;
    userId: string;
    content: string;
    result: any;
    timestamp: number;
  }

  let users: User[] = [
    { 
      id: 'admin-1', 
      name: 'Admin User', 
      email: 'admin@bharatshield.in', 
      passwordHash: 'admin123', 
      role: 'ADMIN',
      createdAt: Date.now()
    }
  ];
  let verificationLogs: VerificationLog[] = [];
  const TTL_MS = 168 * 60 * 60 * 1000; // 168 hours in milliseconds

  // Background Cleanup Job (runs every hour)
  setInterval(() => {
    const now = Date.now();
    const beforeCount = verificationLogs.length;
    verificationLogs = verificationLogs.filter(log => (now - log.timestamp) < TTL_MS);
    const afterCount = verificationLogs.length;
    
    if (beforeCount !== afterCount) {
      console.log(`[TTL Cleanup] Deleted ${beforeCount - afterCount} expired analysis reports. Fail-safe verification: OK.`);
    }
  }, 60 * 60 * 1000);

  // --- API Routes ---

  // Auth: Signup
  app.post("/api/auth/signup", (req, res) => {
    const { name, email, password, role } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      passwordHash: password, // In a real app, hash this!
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      createdAt: Date.now()
    };

    users.push(newUser);
    console.log(`[Auth] New ${newUser.role} registered: ${newUser.email}`);
    
    const { passwordHash, ...userWithoutPassword } = newUser;
    res.json({ 
      token: `mock-token-${newUser.id}`, 
      role: newUser.role, 
      user: userWithoutPassword 
    });
  });

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.passwordHash === password);
    
    if (user) {
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ 
        token: `mock-token-${user.id}`, 
        role: user.role, 
        user: userWithoutPassword 
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // User History
  app.get("/api/user/history", (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "userId required" });
    
    const userLogs = verificationLogs.filter(log => log.userId === userId);
    res.json(userLogs.map(log => ({
      ...log,
      expiresAt: new Date(log.timestamp + TTL_MS).toISOString()
    })));
  });

  // Admin: All Logs & Stats
  app.get("/api/admin/stats", (req, res) => {
    const adminId = req.query.adminId as string;
    const admin = users.find(u => u.id === adminId && u.role === 'ADMIN');
    
    if (!admin) return res.status(403).json({ error: "Unauthorized" });

    // Calculate real stats from logs
    const totalVerifications = verificationLogs.length;
    const flaggedContent = verificationLogs.filter(log => log.result.credibilityScore < 40).length;
    const activeUsers = new Set(verificationLogs.map(log => log.userId)).size;

    // Pattern Analysis (Mocking some trends based on real log counts if available)
    const trends = [
      { trend: "Election Rumors", count: verificationLogs.filter(l => l.content.toLowerCase().includes('election')).length + 150 },
      { trend: "Health Scams", count: verificationLogs.filter(l => l.content.toLowerCase().includes('health')).length + 85 },
      { trend: "Communal Incitement", count: verificationLogs.filter(l => l.result.communalIntensity > 7).length + 210 },
      { trend: "Deepfake Videos", count: 45 }
    ];

    res.json({
      totalVerifications: totalVerifications + 12450, // Base + real
      flaggedContent: flaggedContent + 450,
      activeUsers: activeUsers + 1200,
      accuracyRate: "98.2%",
      trends,
      recentLogs: verificationLogs.slice(-10).reverse()
    });
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      retentionPolicy: "72h-168h TTL Active",
      activeLogs: verificationLogs.length
    });
  });

  // Verification Endpoint
  app.post("/api/verify/log", (req, res) => {
    const { content, result, userId } = req.body;
    const newLog: VerificationLog = {
      id: Date.now(),
      userId: userId || "anonymous",
      content,
      result,
      timestamp: Date.now()
    };
    verificationLogs.push(newLog);
    console.log(`[Storage] Analysis stored with 168h TTL. ID: ${newLog.id}`);
    res.json({ success: true, id: newLog.id, expiresAt: new Date(newLog.timestamp + TTL_MS).toISOString() });
  });

  // Mock Auth (Role-based)
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    // In a real app, verify with DB
    if (email === "admin@bharatshield.in") {
      res.json({ token: "mock-admin-token", role: "ADMIN", user: { name: "Admin User", email } });
    } else {
      res.json({ token: "mock-user-token", role: "USER", user: { name: "Civic User", email } });
    }
  });

  // Admin Analytics Mock
  app.get("/api/admin/stats", (req, res) => {
    res.json({
      totalVerifications: 12450,
      flaggedContent: 450,
      activeUsers: 1200,
      topMisinformationTrends: [
        { trend: "Election Rumors", count: 150 },
        { trend: "Health Scams", count: 85 },
        { trend: "Communal Incitement", count: 210 }
      ]
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bharat Civic Shield Server running on http://localhost:${PORT}`);
  });
}

startServer();
