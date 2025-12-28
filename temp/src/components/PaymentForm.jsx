import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeRisk } from '../services/api';
import CardVisual from './CardVisual';
import RiskGauge from './RiskGauge';
import TechnicalPanel from './TechnicalPanel';

const PaymentForm = () => {
  const { user } = useAuth();
  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(1); // 1 = Amount, 2 = Vectors
  const [amount, setAmount] = useState('');
  
  // Initialize V1-V28 with empty strings so inputs aren't filled with "0" initially
  const initialV = {};
  for(let i=1; i<=28; i++) initialV[`V${i}`] = '';
  const [vFeatures, setVFeatures] = useState(initialV);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);



  // --- HELPERS ---
  const getThemeClass = () => {
    if (!result) return ""; 
    const prob = result.fraud_probability;
    if (prob > 0.5) return "theme-danger";
    if (prob >= 0.1) return "theme-warning";
    return "theme-safe";
  };

  // Helper to safely parse inputs that might be empty strings
  const safeParseFloat = (val) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0.0 : parsed;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare payload, ensuring all Vs are numbers (default to 0 if empty)
    const finalVFeatures = {};
    Object.keys(vFeatures).forEach(key => {
        finalVFeatures[key] = safeParseFloat(vFeatures[key]);
    });

    const payload = {
      Time: Math.floor(Date.now() / 1000), 
      Amount: safeParseFloat(amount),
      ...finalVFeatures
    };

    try {
      const data = await analyzeRisk(payload, user);
      setResult(data);
      // Optional: Auto-navigate back to step 1 to show result clearly alongside amount
      // setCurrentStep(1); 
    } catch (err) {
      alert("API Connection Error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const themeClass = getThemeClass();

  return (
    <div className={`dashboard ${themeClass}`}>
      
      {/* LEFT PANEL (Static Visuals) */}
      <div className="visual-panel">
        <CardVisual />
        <div style={{textAlign:'center', color: 'var(--text-light)', marginTop:'2rem', fontSize:'0.9rem'}}>
          <p style={{fontWeight:'700', marginBottom:'5px'}}>Step {currentStep} of 2</p>
          <p>{currentStep === 1 ? "Enter Transaction Value" : "Configure Risk Vectors"}</p>
        </div>
        {/* 4. Show Transaction ID if result exists */}
        {result && (
            <div style={{textAlign:'center', marginBottom:'1rem', padding:'8px', background:'rgba(255,255,255,0.5)', borderRadius:'8px'}}>
                <small style={{display:'block', color:'var(--text-light)'}}>Transaction ID</small>
                <code style={{fontWeight:'bold'}}>{result.transaction_id}</code>
            </div>
        )}
        {/* Show Gauge only if we have a result */}
        {result && <RiskGauge result={result} />}
      </div>


      {/* RIGHT PANEL (Carousel Form) */}
      <div className="form-panel">
        <form onSubmit={handleSubmit}>
            <h2>{currentStep === 1 ? "Transaction Details" : "Risk Parameters"}</h2>
            
            {/* CAROUSEL TRACK: Shifts based on current step */}
            <div 
              className="carousel-track" 
              style={{ transform: currentStep === 1 ? 'translateX(0%)' : 'translateX(-50%)' }}
            >
                
                {/* --- SLIDE 1: Amount --- */}
                <div className="carousel-slide">
                    <div className="input-group" style={{marginTop:'2rem'}}>
                        <label style={{fontSize:'1rem'}}>Transaction Amount ($)</label>
                        <input 
                            type="number" 
                            className="amount-input"
                            placeholder="0.00"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            // Only required if we are on step 1 and trying to submit (which isn't possible via the Next button, but good practice)
                            required={currentStep === 1}
                        />
                    </div>
                    {/* Navigation Button */}
                    <button 
                        type="button" 
                        className="btn-primary" 
                        disabled={!amount} 
                        onClick={() => setCurrentStep(2)}
                    >
                        Next: Configure Vectors →
                    </button>
                </div>

                {/* --- SLIDE 2: Technical V-Features --- */}
                <div className="carousel-slide">
                     <TechnicalPanel vFeatures={vFeatures} setVFeatures={setVFeatures} />
                     
                     <div style={{display:'flex', gap:'1rem', marginTop:'1.5rem'}}>
                        <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={() => setCurrentStep(1)}
                            disabled={loading}
                            style={{flex: 1}}
                        >
                            ← Back
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={loading}
                            style={{flex: 2}}
                        >
                            {loading ? 'Evaluating...' : 'RUN PREDICTION'}
                        </button>
                     </div>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;