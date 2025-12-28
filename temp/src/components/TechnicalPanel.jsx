
const TechnicalPanel = ({ vFeatures, setVFeatures }) => {
  
  const handleChange = (key, val) => {
    // Allow empty string for typing, convert to float on submit if needed
    setVFeatures(prev => ({ ...prev, [key]: val }));
  };

  const randomize = () => {
    const newFeatures = {};
    for (let i = 1; i <= 28; i++) {
      // Generate random values between -3 and 3
      newFeatures[`V${i}`] = (Math.random() * 6 - 3).toFixed(4);
    }
    setVFeatures(newFeatures);
  };

  const clear = () => {
      const initialV = {};
      for(let i=1; i<=28; i++) initialV[`V${i}`] = '';
      setVFeatures(initialV);
  }

  const fillRisky = () => {
    const riskyValues = {
      "V1": -1.3598,
      "V2": 2.0833,
      "V3": -3.2104,
      "V4": 4.1205,
      "V5": -2.3560,
      "V6": -1.5000,
      "V7": -4.2001,
      "V8": 0.5210,
      "V9": -2.1000,
      "V10": -5.3000,
      "V11": 3.8000,
      "V12": -6.5000,
      "V13": -0.1000,
      "V14": -7.2000,
      "V15": 0.5000,
      "V16": -4.1000,
      "V17": -8.9000,
      "V18": -3.2000,
      "V19": 1.2000,
      "V20": 0.4000,
      "V21": 0.8500,
      "V22": -0.2000,
      "V23": -0.1500,
      "V24": -0.4000,
      "V25": 0.1000,
      "V26": 0.2500,
      "V27": 1.1000,
      "V28": 0.3500
    };
    setVFeatures(riskyValues);
  };

  return (
    <div>
      <div className="tech-header">
        <label style={{marginBottom:0}}>Kaggle Vectors (V1-V28)</label>
        <div style={{display:'flex', gap:'10px'}}>
            <button type="button" onClick={clear} style={{fontSize:'0.8rem', cursor:'pointer', padding:'4px 8px', background:'none', border:'none', color:'var(--text-light)'}}>
            Clear
            </button>
            <button type="button" onClick={randomize} style={{fontSize:'0.8rem', cursor:'pointer', padding:'4px 8px', background:'#e2e8f0', border:'none', borderRadius:'4px', fontWeight:'600', color:'var(--text-dark)'}}>
            🎲 Randomize
            </button>
            <button type="button" onClick={fillRisky} style={{fontSize:'0.8rem', cursor:'pointer', padding:'4px 8px', background:'#fee2e2', border:'none', borderRadius:'4px', fontWeight:'600', color:'#991b1b'}}>
            ⚠️ Fill Risky
            </button>
        </div>
      </div>

      <div className="tech-grid">
        {Object.keys(vFeatures).map((key) => (
          <input
            key={key}
            type="number"
            placeholder={key}
            value={vFeatures[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            title={key}
            step="any" // Allow decimals
          />
        ))}
      </div>
      <p style={{fontSize:'0.75rem', color:'var(--text-light)', marginTop:'8px'}}>
        Enter the 28 PCA components derived from the transaction data.
      </p>
    </div>
  );
};

export default TechnicalPanel;