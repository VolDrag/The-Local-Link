import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

const PaymentResult = () => {
  const [params] = useSearchParams();
  const ok = params.get('status') === 'success';

  return (
    <Layout>
      <div className="module-page">
        <div className="panel">
          <h1>{ok ? 'Payment held' : 'Payment not completed'}</h1>
          <p className="module-lead">
            {ok
              ? 'Your bKash payment was captured and is held until the booking is completed. The provider is paid only after the job is done.'
              : 'The payment did not go through. You can retry from the booking page.'}
          </p>
          <Link className="btn-primary" to="/bookings/history">Back to bookings</Link>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResult;
