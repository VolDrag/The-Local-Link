import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import { paymentService, disputeService } from '../../services/platformService';
import Layout from '../../components/layout/Layout';
import Loader from '../../components/common/Loader';
import BookingThread from '../../components/booking/BookingThread';
import './BookingDetails.css';

const BookingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [dispute, setDispute] = useState({ reason: '', details: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookingDetails();
  }, [id, user, navigate]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getBookingById(id);
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const run = async (fn) => {
    try {
      setUpdating(true);
      await fn();
      await fetchBookingDetails();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (error || !booking) {
    return (
      <Layout>
        <div className="module-page">
          <div className="panel">{error || 'Booking not found'}</div>
        </div>
      </Layout>
    );
  }

  const isProvider = user._id === booking.provider._id;
  const isSeeker = user._id === booking.seeker._id;
  const pay = booking.payment;

  return (
    <Layout>
      <div className="booking-details-container module-page">
        <div className="details-header">
          <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
          <h1>Booking</h1>
          <span className={`status-chip ${booking.status}`}>{booking.status}</span>
        </div>
        {error && <div className="panel">{error}</div>}

        <section className="panel">
          <h2>{booking.service?.title}</h2>
          <p>Scheduled {new Date(booking.scheduledTime).toLocaleString()} · {booking.durationMinutes || 60} min</p>
          <p><strong>৳{booking.amount || 0}</strong> · hold {booking.paymentStatus || 'none'} · commission ৳{booking.commissionAmount || 0}</p>
          {booking.enRouteAt && <p className="muted">Provider marked en route at {new Date(booking.enRouteAt).toLocaleTimeString()}</p>}
          {booking.userNotes && <p>Notes: {booking.userNotes}</p>}
        </section>

        {isSeeker && booking.status === 'confirmed' && booking.paymentStatus !== 'held' && (
          <section className="panel">
            <h2>Pay to hold this booking</h2>
            <p className="muted">Funds stay held until the job is completed. Cancelled jobs are refunded minus any late-cancel fee.</p>
            <button
              className="btn-primary"
              disabled={updating}
              onClick={() => run(async () => {
                const started = await paymentService.start(booking._id);
                if (started.redirectUrl) window.location.href = started.redirectUrl;
              })}
            >
              Pay ৳{booking.amount} with bKash
            </button>
          </section>
        )}

        {pay && (
          <section className="panel">
            <h2>Payment</h2>
            <p>Status: <span className={`status-chip ${pay.status}`}>{pay.status}</span> · hold {pay.holdStatus}</p>
            {pay.bkashTrxId && <p className="muted">Trx {pay.bkashTrxId}</p>}
          </section>
        )}

        <section className="panel">
          <h2>Actions</h2>
          <div className="action-row">
            {isProvider && booking.status === 'pending' && (
              <>
                <button className="btn-primary" disabled={updating} onClick={() => run(() => bookingService.updateBookingStatus(id, 'confirmed'))}>Confirm</button>
                <button className="btn-outline" disabled={updating} onClick={() => run(() => bookingService.cancelBooking(id, cancelReason || 'Cancelled by provider'))}>Decline</button>
              </>
            )}
            {isProvider && booking.status === 'confirmed' && (
              <>
                <button className="btn-secondary" disabled={updating} onClick={() => run(() => bookingService.markEnRoute(id))}>I'm on the way</button>
                <button className="btn-primary" disabled={updating} onClick={() => run(() => bookingService.updateBookingStatus(id, 'completed'))}>Mark completed</button>
              </>
            )}
            {['pending', 'confirmed'].includes(booking.status) && (
              <>
                <input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Cancel reason" />
                <button className="btn-outline" disabled={updating} onClick={() => run(() => bookingService.cancelBooking(id, cancelReason || 'Cancelled'))}>Cancel</button>
                <button className="btn-outline" disabled={updating} onClick={() => run(() => bookingService.flagNoShow(id))}>Flag no-show</button>
              </>
            )}
            {isSeeker && booking.status === 'completed' && (
              <button className="btn-primary" onClick={() => navigate(`/services/${booking.service._id}/reviews`)}>Leave a review</button>
            )}
          </div>
        </section>

        {['pending', 'confirmed'].includes(booking.status) && (
          <section className="panel">
            <h2>Reschedule</h2>
            {booking.rescheduleProposal?.status === 'pending' && (
              <p>
                Proposed {new Date(booking.rescheduleProposal.proposedTime).toLocaleString()}
                {String(booking.rescheduleProposal.proposedBy) !== String(user._id) && (
                  <span className="action-row">
                    <button className="btn-primary" onClick={() => run(() => bookingService.respondReschedule(id, true))}>Accept</button>
                    <button className="btn-outline" onClick={() => run(() => bookingService.respondReschedule(id, false))}>Decline</button>
                  </span>
                )}
              </p>
            )}
            <div className="action-row">
              <input type="datetime-local" value={proposedTime} onChange={(e) => setProposedTime(e.target.value)} />
              <button className="btn-secondary" disabled={!proposedTime || updating} onClick={() => run(() => bookingService.proposeReschedule(id, new Date(proposedTime).toISOString()))}>Propose new time</button>
            </div>
          </section>
        )}

        <section className="panel">
          <h2>Booking chat</h2>
          <BookingThread bookingId={id} />
        </section>

        {['confirmed', 'completed', 'cancelled'].includes(booking.status) && (
          <section className="panel">
            <h2>Open a dispute</h2>
            <form className="stack-form" onSubmit={(e) => {
              e.preventDefault();
              run(() => disputeService.create({ bookingId: id, ...dispute }));
            }}>
              <label>Reason<input value={dispute.reason} onChange={(e) => setDispute({ ...dispute, reason: e.target.value })} required /></label>
              <label>Details<textarea value={dispute.details} onChange={(e) => setDispute({ ...dispute, details: e.target.value })} required rows={3} /></label>
              <button className="btn-outline" type="submit">Submit dispute</button>
            </form>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default BookingDetails;
