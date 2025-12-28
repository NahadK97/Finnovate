import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext'; // Import Toast hook
import { analyzeRisk } from '../services/api';
import CardVisual from './CardVisual';
import RiskGauge from './RiskGauge';
import TechnicalPanel from './TechnicalPanel';

const MerchantDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast(); // Get toast function
  const [currentStep, setCurrentStep] = useState(1); 
  const [amount, setAmount] = useState('');
  
  const initialV = {};
  for(let i=1; i<=28; i++) initialV[`V${i}`] = '';
  const [vFeatures, setVFeatures] = useState(initialV);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const getThemeClass = () => {
    if (!result) return ""; 
    const prob = result.fraud_probability;
    if (prob > 0.5) return "theme-danger";
    if (prob >= 0.1) return "theme-warning";
    return "theme-safe";
  };

  const safeParseFloat = (val) => {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0.0 : parsed;
  }

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // addToast("Sending transaction vectors for analysis...", "info"); // (Optional: sending toast)

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

      // 1. Wait for the result visual (2.5s) then show Alert
      setTimeout(() => {
          if(data.risk_label === 'high') {
              addToast(`Alert: High risk detected! ID: ${data.transaction_id}`, "error");
          } else {
              addToast(`Analysis complete. ID: ${data.transaction_id}`, "success");
          }

          // 2. Wait a brief moment (2s) after the alert to let user read it, 
          // then reset everything back to "Enter Amount"
          setTimeout(() => {
              setAmount('');          // Clear amount
              setVFeatures(initialV); // Clear vector inputs
              setResult(null);        // Remove the Red/Green theme
              setCurrentStep(1);      // Go back to Step 1
          }, 2000);

      }, 2500);

    } catch (err) {
      addToast("Error connecting to analysis engine.", "error");
      setResult(null);
      
      // On error, wait 2 seconds then reset to step 1
      setTimeout(() => {
          setCurrentStep(1);
      }, 5000);
      
    } finally {
      setLoading(false);
    }
  };

  const themeClass = getThemeClass();

  return (
    <div className={`dashboard-form-container ${themeClass}`}>
      {/* LEFT PANEL (Visuals) */}
      <div className="visual-panel">
        <CardVisual />
        <div style={{textAlign:'center', color: 'var(--text-light)', marginTop:'2rem', fontSize:'0.9rem'}}>
          <p style={{fontWeight:'800', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'1px'}}>New Transaction</p>
          <p>Step {currentStep} of 2</p>
        </div>
        
        {result && (
            <div style={{textAlign:'center', marginTop:'1.5rem', marginBottom:'1rem', padding:'10px', background:'rgba(255,255,255,0.6)', borderRadius:'12px', border:'1px solid var(--theme-border)'}}>
                <small style={{display:'block', color:'var(--text-light)', fontWeight:600}}>Reference ID</small>
                <code style={{fontWeight:'bold', fontSize:'1.1rem', color:'var(--text-dark)'}}>{result.transaction_id}</code>
            </div>
        )}

        {result && <RiskGauge result={result} />}
      </div>


      {/* RIGHT PANEL (Carousel Form) */}
      <div className="form-panel">
        <form onSubmit={handleSubmit}>
            <h2 style={{fontSize:'1.5rem'}}>{currentStep === 1 ? "Enter Amount" : "Risk Parameters"}</h2>
            
            <div 
              className="carousel-track" 
              style={{ transform: currentStep === 1 ? 'translateX(0%)' : 'translateX(-50%)' }}
            >
                {/* SLIDE 1: Amount */}
                <div className="carousel-slide" style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
                    <div style={{marginBottom:'2rem', textAlign:'center'}}>
                        <input 
                            type="number" 
                            className="amount-input"
                            placeholder="$0.00"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required={currentStep === 1}
                        />
                    </div>
                    <button 
                        type="button" 
                        className="btn-primary" 
                        disabled={!amount || parseFloat(amount) <= 0} 
                        onClick={() => setCurrentStep(2)}
                    >
                        Continue to Risk Factors →
                    </button>
                </div>

                {/* SLIDE 2: Technical V-Features */}
                <div className="carousel-slide">
                     <TechnicalPanel vFeatures={vFeatures} setVFeatures={setVFeatures} />
                     
                     <div style={{display:'flex', gap:'1rem', marginTop:'2rem'}}>
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
                            style={{flex: 2, fontSize:'1.1rem'}}
                        >
                            {loading ? 'Analyzing...' : 'RUN ANALYSIS'}
                        </button>
                     </div>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantDashboard;