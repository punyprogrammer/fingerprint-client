import React, { useEffect, useState } from "react";
// import SimpleFingerprint from "@amardeepganguly/simple-fingerprint";
class SimpleFingerprint {
  constructor() {
    // Initialize fingerprint and location objects
    this.fingerprint = {};
    this.location = {};
  }

  // Collect basic browser information from the Navigator API
  getBrowserInfo() {
    const ua = navigator.userAgent;

    // Very simple detection (you can improve this with a library if needed)
    let browserName = "Unknown";
    if (ua.includes("Firefox")) browserName = "Firefox";
    else if (ua.includes("Edg")) browserName = "Edge";
    else if (ua.includes("Chrome") && !ua.includes("Chromium"))
      browserName = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome"))
      browserName = "Safari";

    return {
      browser: browserName,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
    };
  }

  // Collect screen-related information
  getScreenInfo() {
    return {
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: screen.colorDepth,
      viewportWidth: window.innerWidth, // actual usable width of the window
      viewportHeight: window.innerHeight, // actual usable height
      devicePixelRatio: window.devicePixelRatio,
    };
  }

  // Collect timezone details
  getTimezoneInfo() {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
    };
  }

  // Generate an audio-based fingerprint by analyzing the output of an oscillator
  async getAudioFingerprint() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const compressor = ctx.createDynamicsCompressor();

    oscillator.type = "triangle";
    oscillator.frequency.value = 10000;

    oscillator.connect(compressor);
    compressor.connect(ctx.destination);

    oscillator.start(0);
    const fingerprint = new Promise((resolve) => {
      setTimeout(() => {
        const fingerprint = ctx.createAnalyser().frequencyBinCount.toString();
        resolve(fingerprint);
        oscillator.stop();
        ctx.close();
      }, 100);
    });

    return fingerprint;
  }

  // Generate a fingerprint by rendering text and shapes on a canvas and encoding the result
  getCanvasFingerprint() {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Fingerprint test", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Fingerprint test", 4, 17);
      return canvas.toDataURL(); // Encoded image data
    } catch {
      return "canvas_error";
    }
  }

  // Collect WebGL-related information to identify the GPU rendering details
  getWebGLInfo() {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "webgl_not_supported";
      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
      };
    } catch {
      return "webgl_error";
    }
  }

  // Gather low-level hardware information from the Navigator API
  getHardwareInfo() {
    return {
      hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
      deviceMemory: navigator.deviceMemory || "unknown",
      maxTouchPoints: navigator.maxTouchPoints || 0,
    };
  }

  // Collect extended Navigator data, including plugin counts and platform details
  getAdvancedNavigatorInfo() {
    const nav = navigator;

    const info = {
      deviceMemory: nav.deviceMemory || "unknown",
      hardwareConcurrency: nav.hardwareConcurrency || "unknown",
      maxTouchPoints: nav.maxTouchPoints || 0,
      webdriver: nav.webdriver || false,
      languages: nav.languages || [],
    };

    // Use userAgentData if available (modern replacement for UA parsing)
    if (nav.userAgentData) {
      info.uaBrands = nav.userAgentData.brands || [];
      info.uaMobile = nav.userAgentData.mobile || false;
      info.uaPlatform = nav.userAgentData.platform || "unknown";
    }

    return info;
  }

  // Detect which fonts are available on the user's system using width comparison
  detectFonts(baseFonts, testFonts) {
    const detected = [];
    const testString = "mmmmmmmmmmlli";
    const testSize = "72px";

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const getWidth = (font) => {
      context.font = `${testSize} '${font}', monospace`;
      return context.measureText(testString).width;
    };

    const defaultWidths = {};
    baseFonts?.forEach((font) => {
      defaultWidths[font] = getWidth(font);
    });

    testFonts.forEach((font) => {
      const width = getWidth(font);
      const matched = baseFonts.some(
        (baseFont) => width !== defaultWidths[baseFont]
      );
      if (matched) {
        detected.push(font);
      }
    });

    return detected;
  }

  // Get list of detectable fonts using `detectFonts` helper
  getFontDetection() {
    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testFonts = [
      "Arial",
      "Verdana",
      "Times New Roman",
      "Courier New",
      "Georgia",
      "Palatino",
      "Garamond",
      "Bookman",
      "Comic Sans MS",
      "Candara",
      "Trebuchet MS",
      "Arial Black",
      "Impact",
    ];

    try {
      const availableFonts = this.detectFonts(baseFonts, testFonts);
      return availableFonts;
    } catch (e) {
      console.log(e, "error");
      return ["font_detection_error"];
    }
  }

  // Fetch IP-based location information from ipapi.co
  async getLocationInfo() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("Failed to fetch location");
      const location = await res.json();
      return {
        city: location.city,
        country: location.country_name,
      };
    } catch {
      return { city: "unknown", country: "unknown" };
    }
  }

  // Orchestrate collection of all fingerprint components
  async generate() {
    this.fingerprint = {
      browser: this.getBrowserInfo(),
      screen: this.getScreenInfo(),
      timezone: this.getTimezoneInfo(),
      canvas: this.getCanvasFingerprint(),
      webgl: this.getWebGLInfo(),
      audio: await this.getAudioFingerprint(),
      navigator: this.getAdvancedNavigatorInfo(),
      fonts: JSON.stringify(this.getFontDetection()),
    };

    this.location = await this.getLocationInfo();
    return { ...this.fingerprint, ...this.location };
  }

  // Send generated fingerprint to the backend API, caching the hash for the session
  async sendToServer(apiUrl) {
    const dataToSend = await this.generate();

    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const res = await resp.json();
      const hash = res?.hash;

      if (hash) {
        return hash;
      } else {
        throw new Error("No hash returned from backend");
      }
    } catch (e) {
      console.error("Failed to send fingerprint to server:", e);
      return "error_generating_hash";
    }
  }
}
function App() {
  const [userHash, setUserHash] = useState("Generating...");

  useEffect(() => {
    const run = async () => {
      const fingerprint = new SimpleFingerprint();
      const hash = await fingerprint.sendToServer(
        "http://localhost:4000/api/fingerprint"
      );
      setUserHash(hash);
    };

    run();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>User Fingerprint Hash:</h2>
      <p>{userHash}</p>
    </div>
  );
}

export default App;
