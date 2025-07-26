// Server health monitoring for Render.com cold start
const RENDER_SERVER_URL = "https://swd392-g7-dupss.onrender.com/api";

interface ServerHealthStatus {
  isOnline: boolean;
  isWakingUp: boolean;
  lastCheck: number;
  responseTime: number;
}

class ServerHealthMonitor {
  private status: ServerHealthStatus = {
    isOnline: false,
    isWakingUp: false,
    lastCheck: 0,
    responseTime: 0,
  };

  private checkInterval: NodeJS.Timeout | null = null;

  // Check server health
  async checkHealth(): Promise<ServerHealthStatus> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${RENDER_SERVER_URL.replace("/api", "")}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        this.status = {
          isOnline: true,
          isWakingUp: false,
          lastCheck: Date.now(),
          responseTime,
        };
        console.log("✅ Server is online, response time:", responseTime + "ms");
      } else {
        this.status = {
          isOnline: false,
          isWakingUp: true,
          lastCheck: Date.now(),
          responseTime,
        };
        console.log("🔄 Server is waking up...");
      }
    } catch (error) {
      this.status = {
        isOnline: false,
        isWakingUp: true,
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
      };
      console.log("❌ Server is offline or waking up");
    }

    return this.status;
  }

  // Start periodic health checks
  startMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every 5 minutes
    this.checkInterval = setInterval(async () => {
      await this.checkHealth();
    }, 5 * 60 * 1000);

    // Initial check
    this.checkHealth();
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Get current status
  getStatus(): ServerHealthStatus {
    return { ...this.status };
  }

  // Pre-wake server before user action
  async preWakeServer(): Promise<void> {
    console.log("🔄 Pre-waking server...");
    try {
      await fetch(`${RENDER_SERVER_URL.replace("/api", "")}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000), // 10 second timeout for pre-wake
      });
      console.log("✅ Pre-wake successful");
    } catch (error) {
      console.log("⚠️ Pre-wake failed, server will wake up on first request");
    }
  }
}

// Create singleton instance
const serverHealthMonitor = new ServerHealthMonitor();

export default serverHealthMonitor;
