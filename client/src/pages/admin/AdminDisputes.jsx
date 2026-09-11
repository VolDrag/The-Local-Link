import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import adminService from '../../services/adminService';

const AdminDisputes = () => {
  const [rows, setRows] = useState([]);
  const [note, setNote] = useState('');

  const load = async () => {
    const data = await adminService.getDisputes();
    setRows(data.data || []);
  };
  useEffect(() => { load(); }, []);

  const resolve = async (id, resolution) => {
    await adminService.resolveDispute(id, { resolution, adminNote: note });
    setNote('');
    await load();
  };

  return (
    <Layout>
      <div className="module-page">
        <h1>Booking disputes</h1>
        <p className="module-lead">Refund, release the payout, or take no action. This is separate from user/service reports.</p>
        <div className="panel">
          <label>Admin note<input value={note} onChange={(e) => setNote(e.target.value)} /></label>
          {rows.map((d) => (
            <div key={d._id} className="panel">
              <p><strong>{d.reason}</strong> · <span className={`status-chip ${d.status}`}>{d.status}</span></p>
              <p>{d.details}</p>
              <p className="muted">Raised by {d.raisedBy?.username} against {d.against?.username}</p>
              {d.status !== 'resolved' && (
                <div className="action-row">
                  <button className="btn-outline" onClick={() => resolve(d._id, 'refund')}>Refund seeker</button>
                  <button className="btn-primary" onClick={() => resolve(d._id, 'release_payout')}>Release payout</button>
                  <button className="btn-secondary" onClick={() => resolve(d._id, 'no_action')}>No action</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDisputes;
