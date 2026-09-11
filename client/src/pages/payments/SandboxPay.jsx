import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { paymentService } from '../../services/platformService';

const SandboxPay = () => {
  const { paymentID } = useParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await paymentService.execute(paymentID);
      navigate(`/payments/result?status=${result.success ? 'success' : 'failed'}&paymentID=${paymentID}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setBusy(false);
    }
  };

  return (
    <div className="bkash-box">
      <p>bKash Checkout · Sandbox</p>
      <h1>Confirm payment</h1>
      <p>This is the sandbox stand-in for the bKash app. No live money moves.</p>
      {error && <p>{error}</p>}
      <button onClick={pay} disabled={busy}>{busy ? 'Processing…' : 'Pay with bKash'}</button>
    </div>
  );
};

export default SandboxPay;
