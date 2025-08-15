import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { verifyCode, resendVerificationCode } from '../src/services/authService';

type Params = { phoneNumber?: string; verificationId?: string };

export default function OTPScreen() {
  const { phoneNumber: phoneParam, verificationId: verIdParam } =
    useLocalSearchParams<Params>();
  const phoneNumber = Array.isArray(phoneParam) ? phoneParam[0] : (phoneParam ?? '');
  const verificationId = Array.isArray(verIdParam) ? verIdParam[0] : (verIdParam ?? '');

  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  const setRef = (index: number) => (el: RNTextInput | null) => {
    inputRefs.current[index] = el;
  };

  const verifyMutation = useMutation({
    mutationFn: verifyCode,
    onSuccess: () => {
      Alert.alert('Success', 'Authenticated！', [{ text: 'Yes', onPress: () => router.push('/(tabs)') }]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Authentication failed');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendVerificationCode,
    onSuccess: () => Alert.alert('Success', 'OTP is already sent'),
    onError: (error: any) => Alert.alert('Error', error?.message || 'Resending failed'),
  });

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) return;
    const next = [...code];
    next[index] = text;
    setCode(next);
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = () => {
    const full = code.join('');
    if (full.length !== 6) {
      Alert.alert('Error', 'OTP is 6 digits');
      return;
    }
    verifyMutation.mutate({ verificationId, code: full });
  };

  const isCodeComplete = code.every((d) => d !== '');
  const isLoading = verifyMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.main}>
          <Text style={styles.title}>Enter the code we sent</Text>

          <View style={styles.codeBox}>
            <View style={styles.codeRow}>
              {code.map((digit, index) => (
                <RNTextInput
                  key={index}
                  ref={setRef(index)}
                  style={[styles.codeInput, !!digit && styles.codeInputFilled]}
                  value={digit}
                  onChangeText={(t) => handleCodeChange(t, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0}
                  editable={!isLoading}
                  returnKeyType="done"
                />
              ))}
            </View>
          </View>

          <Text style={styles.errorText}>Please check the code you entered is valid</Text>

          <Text style={styles.resendText}>
            Didn't get the code?{' '}
            <Text style={styles.resendLink} onPress={() => resendMutation.mutate({ phoneNumber })}>
              Send again
            </Text>
          </Text>

          <Text style={styles.moreOptionsText}>More options</Text>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, (!isCodeComplete || isLoading) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!isCodeComplete || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text
              style={[
                styles.continueButtonText,
                (!isCodeComplete || isLoading) && styles.continueButtonTextDisabled,
              ]}
            >
              Continue
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 20, justifyContent: 'space-between' },
  main: { paddingTop: 8 },

  title: { fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 20 },

  codeBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between' },

  codeInput: {
    width: 36,
    height: 40,
    borderBottomWidth: 2,
    borderColor: '#ddd',
    fontSize: 20,
    padding: 0,
    backgroundColor: 'transparent',
  },
  codeInputFilled: { borderColor: '#000' },

  errorText: { color: '#cc3b3b', fontSize: 12, marginTop: 6, marginBottom: 12 },
  resendText: { color: '#666', fontSize: 14, marginBottom: 6 },
  resendLink: { color: '#000', textDecorationLine: 'underline' },
  moreOptionsText: { color: '#666', textDecorationLine: 'underline', fontSize: 14, marginBottom: 8 },

  continueButton: {
    backgroundColor: '#000',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  continueButtonDisabled: { backgroundColor: '#ccc' },
  continueButtonText: { color: 'white', fontSize: 16, fontWeight: '500' },
  continueButtonTextDisabled: { color: '#666' },
});
