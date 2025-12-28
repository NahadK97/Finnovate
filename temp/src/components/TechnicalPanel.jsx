
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