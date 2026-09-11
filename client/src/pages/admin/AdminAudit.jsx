import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import adminService from '../../services/adminService';

const AdminAudit = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    adminService.getAuditLogs().then((d) => setRows(d.data || []));
  }, []);

  return (
    <Layout>
      <div className="module-page">
        <h1>Admin audit log</h1>
        <p className="module-lead">Every category, event, report, verification, payout, and dispute decision is attributed and timestamped.</p>
        <div className="panel">
          <table className="admin-table">
            <thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th></tr></thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l._id}>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                  <td>{l.admin?.username}</td>
                  <td>{l.action}</td>
                  <td>{l.targetType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminAudit;
