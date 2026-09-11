import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import adminService from '../../services/adminService';

const AdminPayouts = () => {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const data = await adminService.getAllPayouts();
    setRows(data.data || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <div className="module-page">
        <h1>Payout requests</h1>
        <p className="module-lead">Approve to debit the provider balance and log a manual send (bKash/Nagad rail is a stretch goal).</p>
        <div className="panel">
          <table className="admin-table">
            <thead><tr><th>Provider</th><th>Amount</th><th>Account</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id}>
                  <td>{p.provider?.username}</td>
                  <td>৳{p.amount}</td>
                  <td>{p.method} {p.accountNumber}</td>
                  <td><span className={`status-chip ${p.status}`}>{p.status}</span></td>
                  <td>
                    {p.status === 'requested' && (
                      <div className="action-row">
                        <button className="btn-primary" onClick={() => adminService.reviewPayout(p._id, { status: 'paid' }).then(load)}>Mark paid</button>
                        <button className="btn-outline" onClick={() => adminService.reviewPayout(p._id, { status: 'rejected', adminNote: 'Rejected' }).then(load)}>Reject</button>
                      </div>
                    )}
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

export default AdminPayouts;
