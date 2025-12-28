import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAllTransactions } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, high: 0, moderate: 0, low: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getAllTransactions();
    // Calculate Stats
    const counts = data.reduce((acc, curr) => {
        acc[curr.risk_label]++;
        return acc;
    }, { high: 0, moderate: 0, low: 0 });
    setStats({ total: data.length, ...counts });

    setChartData([
        { name: 'Safe', value: counts.low, color: '#10b981' },
        { name: 'Warning', value: counts.moderate, color: '#f59e0b' },
        { name: 'High Risk', value: counts.high, color: '#ef4444' },
      ]);
  };

  return (
    <div>
      <div className="page-header">
        <h1>System Overview</h1>
      </div>
      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Scanned</h3><div className="stat-value">{stats.total}</div></div>
        <div className="stat-card"><h3>Safe</h3><div className="stat-value" style={{color:'#10b981'}}>{stats.low}</div></div>
        <div className="stat-card"><h3>Warnings</h3><div className="stat-value" style={{color:'#f59e0b'}}>{stats.moderate}</div></div>
        <div className="stat-card"><h3>Blocked</h3><div className="stat-value" style={{color:'#ef4444'}}>{stats.high}</div></div>
      </div>

      {/* CHARTS SECTION */}
      <div className="chart-grid">
          <div className="widget-container">
              <div className="widget-header"><h3>Risk Distribution</h3></div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4} dataKey="value">
                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip wrapperStyle={{border:'none', borderRadius:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/>
                </PieChart>
              </ResponsiveContainer>
          </div>
          <div className="widget-container">
               <div className="widget-header"><h3>Volume by Category</h3></div>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#64748b', fontWeight:600}}/>
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill:'#64748b'}}/>
                    <Tooltip cursor={{fill: '#f1f5f9'}} wrapperStyle={{border:'none', borderRadius:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/>
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} >
                        {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;