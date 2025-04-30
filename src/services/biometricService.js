import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance';

// Modify this to stop WebAuthn-related authentication
export const verifyBiometric = async (onCancel = () => {}) => {
  try {
    // Check if fingerprint is registered (this should still be part of your process)
    const { data } = await axiosInstance.get('/webauthn/check-registration', {
      withCredentials: true,
    });

    if (!data.isRegistered) {
      toast.error('Fingerprint not registered.');
      onCancel();
      return false;
    }

    // Here we skip the WebAuthn generation and verification (no longer needed)
    // If you're using a custom fingerprint authentication flow, handle it here directly

    // Custom logic for biometric authentication (using your fingerprint registration method)
    const biometricAuthResult = await customBiometricAuthFunction();

    if (biometricAuthResult) {
      toast.success('✅ Biometric authentication successful!');
      return true;
    } else {
      toast.error('❌ Biometric authentication failed!');
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