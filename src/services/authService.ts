export const sendVerificationCode = async ({ phoneNumber }: { phoneNumber: string }) => {
    return new Promise<{ verificationId: string; message: string }>((resolve, reject) => {
      setTimeout(() => {
        console.log('Sending coded to:', phoneNumber);
        if (Math.random() > 0.1) {
          resolve({
            verificationId: 'mock-verification-id-' + Date.now(),
            message: 'Verification code sent successfully'
          });
        } else {
          reject(new Error('Failed to send verification code'));
        }
      }, 1000);
    });
  };
  
  export const verifyCode = async ({ verificationId, code }: { verificationId: string; code: string }) => {
    return new Promise<{ success: boolean; token: string }>((resolve, reject) => {
      setTimeout(() => {
        console.log('OTP:', code, 'VerificationID:', verificationId);
        if (code === '123456') {
          resolve({
            success: true,
            token: 'mock-auth-token'
          });
        } else {
          reject(new Error('Invalid verification code. Try 123456'));
        }
      }, 1000);
    });
  };
  
  export const resendVerificationCode = async ({ phoneNumber }: { phoneNumber: string }) => {
    return new Promise<{ message: string }>((resolve) => {
      setTimeout(() => {
        console.log('Resending code to:', phoneNumber);
        resolve({ message: 'Code resent successfully' });
      }, 1000);
    });
  };
  