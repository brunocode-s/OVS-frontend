// biometricService.js
import { startAuthentication } from '@simplewebauthn/browser';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

/**
 * Requires:
 * - Logged-in user info with at least the `email` field
 */
export const verifyBiometric = async (onCancel = () => {}, userEmail, loginFn) => {
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

    // 2. Get options
    const { data: options } = await axiosInstance.post(
      '/webauthn/generate-authentication-options',
      { email: userEmail },
      { withCredentials: true }
    );

    // 3. Prompt fingerprint scan
    const authResp = await startAuthentication(options);

    // 4. Verify
    const { data: verificationResult } = await axiosInstance.post(
      '/webauthn/verify-authentication',
      authResp,
      { withCredentials: true }
    );

    if (verificationResult.success && verificationResult.token && verificationResult.user) {
      toast.success('✅ Fingerprint verified!');

      if (typeof loginFn === 'function') {
        loginFn(
          verificationResult.token,
          verificationResult.user.role,
          verificationResult.user
        );
      }

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

