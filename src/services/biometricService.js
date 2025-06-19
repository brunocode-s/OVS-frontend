// biometricService.js
import { startAuthentication } from '@simplewebauthn/browser';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

/**
 * Requires:
 * - Logged-in user info with at least the `email` field
 */
export const verifyBiometric = async (onCancel = () => {}, userEmail) => {
  try {
    if (!userEmail) {
      toast.error('User email is required for biometric verification.');
      onCancel();
      return false;
    }

    // 1. Check if user has a registered fingerprint
    const { data: check } = await axiosInstance.get('/webauthn/check-registration', {
      withCredentials: true,
    });

    if (!check.isRegistered) {
      toast.error('Fingerprint not registered.');
      onCancel();
      return false;
    }

    // 2. Request WebAuthn authentication options (✅ includes email in request body)
    const { data: options } = await axiosInstance.post(
      '/webauthn/generate-authentication-options',
      { email: userEmail },
      { withCredentials: true }
    );

    // 3. Start fingerprint scan via WebAuthn browser prompt
    const authResp = await startAuthentication(options);

    // 4. Send response back to backend for verification
    const { data: verificationResult } = await axiosInstance.post(
      '/webauthn/verify-authentication',
      authResp,
      { withCredentials: true }
    );

    if (verificationResult.verified || verificationResult.success) {
      toast.success('✅ Fingerprint verified!');
      return true;
    } else {
      toast.error('❌ Fingerprint verification failed!');
      onCancel();
      return false;
    }
  } catch (error) {
    console.error('Biometric verification error:', error.response?.data || error.message);
    toast.error('Biometric verification failed.');
    onCancel();
    return false;
  }
};
