import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { identityService } from '../../services/platformService';
import { useAuth } from '../../context/AuthContext';
import { apiErrorMessage } from '../../utils/helpers';

const VerificationPage = () => {
  const { user } = useAuth();
  const [info, setInfo] = useState(null);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('nid');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setError('');
      const data = await identityService.me();
      setInfo(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load verification status'));
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Choose a document photo or PDF first');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const data = await identityService.submit(file, documentType);
      setMessage(data.message || 'Submitted for review');
      setInfo(data.identityVerification);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not submit document'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="module-page">
        <h1>Identity verification</h1>
        <p className="module-lead">
          Providers must upload a NID, passport, or trade license before accepting bookings.
          The activity badge is separate — this is the safety gate.
        </p>
        {error && <div className="panel" style={{ color: 'var(--color-error)' }}>{error}</div>}
        <div className="panel">
          <p>Status: <span className={`status-chip ${info?.status || 'unsubmitted'}`}>{info?.status || 'unsubmitted'}</span></p>
          {info?.rejectionReason && <p>Rejected: {info.rejectionReason}</p>}
          {user?.bookingSuspended && <p>Booking intake is suspended pending admin review of no-shows.</p>}
        </div>
        <form className="panel stack-form" onSubmit={submit}>
          <label>
            Document type
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
              <option value="nid">National ID</option>
              <option value="passport">Passport</option>
              <option value="trade_license">Trade license</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            File (JPEG, PNG, or PDF, max 5MB)
            <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setFile(e.target.files[0])} />
          </label>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for review'}
          </button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </Layout>
  );
};

export default VerificationPage;
