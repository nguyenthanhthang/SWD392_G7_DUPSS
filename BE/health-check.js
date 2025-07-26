const axios = require("axios");

const BACKEND_URL = "https://swd392-g7-dupss.onrender.com/api";

async function checkBackendHealth() {
  console.log("🔍 Checking backend health...");

  try {
    // Test basic endpoint
    const response = await axios.get(`${BACKEND_URL.replace("/api", "")}`, {
      timeout: 10000,
    });
    console.log("✅ Backend is running");
    console.log("Response:", response.data);
  } catch (error) {
    console.log("❌ Backend is not responding");
    console.log("Error:", error.message);

    if (error.code === "ECONNABORTED") {
      console.log("💡 Server might be sleeping (Render.com free tier)");
    }
  }

  try {
    // Test auth endpoint
    const authResponse = await axios.get(`${BACKEND_URL}/auth`, {
      timeout: 10000,
    });
    console.log("✅ Auth routes are accessible");
  } catch (error) {
    console.log("❌ Auth routes are not accessible");
    console.log("Error:", error.message);
  }
}

checkBackendHealth();
