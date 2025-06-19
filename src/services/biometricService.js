// biometricService.js
import { startAuthentication } from '@simplewebauthn/browser';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

export const verifyBiometric = async (onCancel = () => {}) => {
  try {
    // 1. Check if user has a registered fingerprint
    const { data: check } = await axiosInstance.get('/webauthn/check-registration', {
      withCredentials: true,
    });

    if (!check.isRegistered) {
      toast.error('Fingerprint not registered.');
      onCancel();
      return false;
    }

    // 2. Get options from server to start authentication (✅ fixed)
    const { data: options } = await axiosInstance.post(
      '/webauthn/generate-authentication-options',
      {}, // empty body
      { withCredentials: true } // config
    );

    // 3. Prompt user for fingerprint scan
    const authResp = await startAuthentication(options);

    // 4. Verify the response with the server
    const { data: verificationResult } = await axiosInstance.post(
      '/webauthn/verify-authentication',
      authResp,
      { withCredentials: true }
    );

    if (verificationResult.verified) {
      toast.success('✅ Fingerprint verified!');
      return true;
    } else {
      toast.error('❌ Fingerprint verification failed!');
      onCancel();
      return false;
    }
  } catch (error) {
    console.error('Biometric verification error:', error);
    toast.error('Biometric verification failed.');
    onCancel();
    return false;
  }
};
