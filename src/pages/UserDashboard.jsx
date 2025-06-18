import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import API from '../services/api';
import { toast } from 'react-toastify';
import FingerprintRegister from '../components/FingerprintAuth';
import { format } from 'date-fns';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasFingerprint, setHasFingerprint] = useState(false);
  const [checkingFingerprint, setCheckingFingerprint] = useState(true);

  // Function to check fingerprint registration status from backend
  const checkFingerprintStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/auth/has-fingerprint', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHasFingerprint(res.data.hasFingerprint);
    } catch (err) {
      console.error('Error checking fingerprint:', err);
      toast.error('Unable to check fingerprint status.');
    } finally {
      setCheckingFingerprint(false);
    }
  };

  // Check fingerprint on mount
  useEffect(() => {
    checkFingerprintStatus();
  }, []);

  // Fetch elections
  useEffect(() => {
    if (user) {
      setLoading(true);
      API.get('/elections')
        .then(res => {
          setElections(res.data);
        })
        .catch(err => {
          console.error('Error fetching elections:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format date safely
  const safeFormatDateTime = (date) => {
    const validDate = new Date(date);
    return isNaN(validDate) ? 'No date available' : format(validDate, 'PPP p');
  };

  // Sort elections by start date ascending
  const sortedElections = [...elections].sort(
    (a, b) => new Date(a.start_date) - new Date(b.start_date)
  );

  if (!user) return <div className="text-center py-20 text-lg">Loading dashboard...</div>;

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto p-8">

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-center border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-0">
            Welcome, {user.lastName}!
          </h1>
          <div className="flex flex-row items-center space-x-6">
            <Link
              to="/elections"
              className="text-lg mr-2 font-medium text-gray-600 hover:text-gray-800 dark:text-gray-300 hover:dark:text-white relative group"
            >
              Elections
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-600 transform scale-x-0 group-hover:scale-x-100 transition-all duration-300 ease-out" />
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4">Your Profile</h2>
          <div className="space-y-2 mb-4">
            <p><strong>Name:</strong> {user.lastName} {user.firstName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>

          {/* Fingerprint status UI */}
          {checkingFingerprint ? (
            <div className="text-gray-500 dark:text-gray-300">Checking fingerprint...</div>
          ) : hasFingerprint ? (
            <div className="flex items-center text-green-600 font-medium mt-4">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Your fingerprint is registered!
            </div>
          ) : (
            <div className="mt-4">
              <FingerprintRegister
                onSuccess={() => {
                  // toast.success('Fingerprint registered successfully!');
                  checkFingerprintStatus();
                }}
              />
            </div>
          )}
        </section>

        {/* Elections Section */}
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-6">Upcoming Elections</h2>
          {loading ? (
            <div className="flex justify-center items-center text-gray-500 dark:text-gray-300">Loading elections...</div>
          ) : sortedElections.length === 0 ? (
            <p className="text-gray-500 text-center dark:text-gray-300">🗳️ No elections available at the moment.</p>
          ) : (
            <ul className="space-y-6">
              {sortedElections.map((election) => (
                <li
                  key={election.id}
                  className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg mb-4 transition-all duration-300 ease-in-out"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{election.title}</h3>
                      <div className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                        <p><strong>Starts:</strong> {safeFormatDateTime(election.start_date)}</p>
                        <p><strong>Ends:</strong> {safeFormatDateTime(election.end_date)}</p>
                      </div>
                      <p className="text-gray-600 dark:text-gray-200 mt-3">{election.description}</p>
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 dark:text-white">Candidates:</h4>
                        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-200">
                          {election.candidates?.length > 0 ? (
                            election.candidates.map((candidate, index) => (
                              <li key={index}>{candidate.name}</li>
                            ))
                          ) : (
                            <li>No candidates available</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6 sm:mt-0 sm:ml-6">
                      <Link
                        to={`/elections/${election.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                      >
                        View Election
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
