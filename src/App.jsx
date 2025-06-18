import React, { useEffect, useState } from "react";
import SimpleFingerprint from "@amardeepganguly/simple-fingerprint";

function App() {
  const [userHash, setUserHash] = useState("Generating...");

  useEffect(() => {
    const run = async () => {
      const fingerprint = new SimpleFingerprint();
      const hash = await fingerprint.sendToServer(
        "https://fingerprint-server-niuu.onrender.com/api/fingerprint"
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
