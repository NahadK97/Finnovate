import { useEffect, useState } from 'react';

const RiskGauge = ({ result }) => {
  const targetPercentage = result.fraud_probability * 100;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(0);
    const timer = setTimeout(() => {
      setWidth(targetPercentage);
    }, 100); 
    return () => clearTimeout(timer);
  }, [result, targetPercentage]);

  const getColor = () => {
      if (result.risk_label === 'high') return '#ef4444'; 
      if (result.risk_label === 'moderate') return '#f59e0b'; 
      return '#10b981'; 
  };

  return (
    <div className="risk-gauge-container">
        <div style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '8px', 
            fontWeight: 700, 
            fontSize: '0.9rem', 
            color: 'var(--text-light)'
        }}>
            <span>Fraud Probability</span>
            <span style={{ color: getColor() }}>{targetPercentage.toFixed(2)}%</span>
        </div>
        
        <div className="progress-track">
            <div 
                className="progress-fill" 
                style={{
                    width: `${width}%`, 
                    backgroundColor: getColor(),
                    // CHANGED: This curve starts very fast and decelerates smoothly
                    transition: 'width 1.5s cubic-bezier(0.23, 1, 0.32, 1)' 
                }}
            ></div>
        </div>

        <p style={{
            textAlign: 'center', 
            marginTop: '15px', 
            fontSize: '0.85rem', 
            color: 'var(--text-dark)', 
            fontWeight: 600,
            opacity: width > 0 ? 1 : 0, 
            transition: 'opacity 1s ease'
        }}>
            {result.explanation}
        </p>
    </div>
  );
};

export default RiskGauge;