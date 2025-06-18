import React, { useEffect, useState } from "react";
import SimpleFingerprint from "@amardeepganguly/simple-fingerprint";

function App() {
  const [userHash, setUserHash] = useState("Generating...");

  useEffect(() => {
    const getFingerprint = async () => {
      const fingerprint = new SimpleFingerprint();
      const hash = await fingerprint.getHash();
      setUserHash(hash);
    };

    getFingerprint();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>User Fingerprint Hash:</h2>
      <p>{userHash}</p>
    </div>
  );
}

export default App;
