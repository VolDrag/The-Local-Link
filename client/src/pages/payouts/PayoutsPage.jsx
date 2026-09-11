import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { payoutService } from '../../services/platformService';

const PayoutsPage = () => {
  const [data, setData] = useState({ payouts: [], payoutBalance: 0 });
  const [form, setForm] = useState({ amount: '', method: 'bkash', accountNumber: '' });
  const [error, setError] = useState('');

  const load = async () => setData(await payoutService.mine());
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await payoutService.request({ ...form, amount: Number(form.amount) });
      setForm({ ...form, amount: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <Layout>
      <div className="module-page">
        <h1>Payouts</h1>
        <p className="module-lead">Completed jobs release funds here after the 10% platform commission. Admins approve withdrawals manually.</p>
        <div className="panel">
          <h2>Available balance</h2>
          <p style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>৳{data.payoutBalance || 0}</p>
        </div>
        <form className="panel stack-form" onSubmit={submit}>
          <h2>Request payout</h2>
          {error && <p className="muted">{error}</p>}
          <label>Amount (BDT)<input type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></label>
          <label>Method
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="manual">Manual</option>
            </select>
          </label>
          <label>Account number<input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} required /></label>
          <button className="btn-primary" type="submit">Submit request</button>
        </form>
        <div className="panel">
          <h2>History</h2>
          <table className="admin-table">
            <thead><tr><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {(data.payouts || []).map((p) => (
                <tr key={p._id}>
                  <td>৳{p.amount}</td>
                  <td>{p.method}</td>
                  <td><span className={`status-chip ${p.status}`}>{p.status}</span></td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default PayoutsPage;
