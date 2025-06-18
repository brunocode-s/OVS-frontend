import { useState, useEffect } from 'react';
import { startRegistration, browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { toast } from 'react-toastify';
import { bufferToBase64URLString } from '@simplewebauthn/browser';
import API from '../services/api';

const FingerprintRegister = ({ onSuccess }) => {
  const [isFingerprintRegistered, setIsFingerprintRegistered] = useState(false);
  const [checking, setChecking] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const result = await API.get('/webauthn/check-registration', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setIsFingerprintRegistered(result.data.isRegistered);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
        if (error.response?.data?.message === 'Session expired. Please login again'){
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          toast.error('Failed to check fingerprint status.');
        }       
      } finally {
        setChecking(false);
      }
    };

    checkRegistrationStatus();

    return () => {
      setChecking(false);
    };
  }, []);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
  
      // Fetch registration options
      const { data: options } = await API.post(
        '/webauthn/generate-registration-options',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
  
      if (!options.challenge) {
        throw new Error('Challenge missing in registration options');
      }
  
      // Start registration process
      const attResp = await startRegistration({ optionsJSON: options });
      console.log('Raw WebAuthn response:', attResp);
  
      // Send attResp directly, no transformation
      const verifyRes = await API.post(
        '/webauthn/verify-registration',
        attResp,
        {
          headers: { Authorization: `Bearer ${token}` }, // reuse the token from earlier
          withCredentials: true,
        }
      );
  
      console.log('WebAuthn Registration Verification Response:', verifyRes);
  
      if (verifyRes.data.success) {
        setIsFingerprintRegistered(true);
        // toast.success('🎉 Fingerprint registered successfully!');
        if (onSuccess) onSuccess(verifyRes.data.fingerprintId);
      } else {
        toast.error('❌ Fingerprint registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
  
      // Log additional error information for debugging
      if (err.response && err.response.data) {
        console.error('Error Details:', err.response.data);
      }
  
      toast.error(
        `❌ ${err?.response?.data?.message || err.message || 'Error verifying registration'} || Fingerprint registration failed. Please try again.`
      );
    } finally {
      setRegistering(false);
    }
  };  
  
  
  return (
    <div>
      {checking ? (
        <div className="flex justify-center items-center">
          <div className="spinner-border animate-spin text-gray-500" />
          <p className="ml-2 text-gray-500">Checking fingerprint status...</p>
        </div>
      ) : isFingerprintRegistered ? (
        <div className="flex items-center text-green-600 font-medium">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Your fingerprint is registered!
        </div>
      ) : (
        <button
          onClick={handleRegister}
          disabled={registering}
          className={`px-4 py-2 rounded flex items-center justify-center text-white transition ${
            registering ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {registering ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Registering...
            </>
          ) : (
            'Register Fingerprint'
          )}
        </button>
      )}
    </div>
  );
};

export default FingerprintRegister;
