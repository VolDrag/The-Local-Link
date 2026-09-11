import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import adminService from '../../services/adminService';

const AdminVerification = () => {
  const [rows, setRows] = useState([]);
  const [reason, setReason] = useState('');

  const load = async () => {
    const data = await adminService.getPendingProviders();
    setRows(data.data || []);
  };
  useEffect(() => { load(); }, []);

  const review = async (id, status) => {
    await adminService.reviewIdentity(id, { status, reason });
    setReason('');
    await load();
  };

  return (
    <Layout>
      <div className="module-page">
        <h1>Provider verification queue</h1>
        <p className="module-lead">Approve identity documents before a provider can accept bookings.</p>
        <div className="panel">
          <label>Rejection reason (required when rejecting)
            <input value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          <table className="admin-table">
            <thead><tr><th>Provider</th><th>Document</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u._id}>
                  <td>{u.username}<br /><span className="muted">{u.email}</span></td>
                  <td>
                    {u.identityVerification?.documentUrl ? (
                      <a href={u.identityVerification.documentUrl} target="_blank" rel="noreferrer">View file</a>
                    ) : '—'}
                  </td>
                  <td><span className={`status-chip ${u.identityVerification?.status}`}>{u.identityVerification?.status}</span></td>
                  <td className="action-row">
                    <button className="btn-primary" onClick={() => review(u._id, 'approved')}>Approve</button>
                    <button className="btn-outline" onClick={() => review(u._id, 'rejected')}>Reject</button>
                    {u.bookingSuspended && <button className="btn-secondary" onClick={() => adminService.unsuspendProvider(u._id).then(load)}>Unsuspend</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminVerification;
