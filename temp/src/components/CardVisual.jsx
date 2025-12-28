
const CardVisual = () => {
  return (
    <div className="credit-card">
      <div className="chip"></div>
      {/* Static, obfuscated data representing a "tokenized" card transaction */}
      <div className="card-number-static">
        **** **** **** XXXX
      </div>
      <div style={{display:'flex', justifyContent:'space-between', opacity:0.8, fontSize:'0.8rem'}}>

      </div>
      <div style={{position:'absolute', bottom:'25px', right:'25px', fontWeight:'bold', fontStyle:'italic'}}>
        KAGGLE PAY
      </div>
    </div>
  );
};

export default CardVisual;