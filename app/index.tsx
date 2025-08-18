import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Keyboard,
  Dimensions,
} from "react-native"
import { router } from "expo-router"
import { useMutation } from "@tanstack/react-query"
import CountryPicker from "../components/CountryPicker"
import { sendVerificationCode } from "../src/services/authService"
import { validateByCountry, formatByCountry } from "../src/utils/phoneValidation"

const { height: screenHeight } = Dimensions.get("window")

export default function PhoneEntryScreen() {
  const [countryCode, setCountryCode] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const sendCodeMutation = useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: (data: any) => {
      setIsLoading(false)
      router.push({
        pathname: "/otp",
        params: {
          phoneNumber: countryCode + phoneNumber,
          verificationId: data.verificationId,
        },
      })
    },
    onError: (error: any) => {
      setIsLoading(false)
      Alert.alert("Error", error?.message || "Sending OTP failed")
    },
  })

  const handleContinue = () => {
    if (!validateByCountry(phoneNumber, countryCode)) {
      Alert.alert("Error", "Please enter a valid phone number")
      return
    }
    setIsLoading(true)
    Keyboard.dismiss()
    setTimeout(() => {
      sendCodeMutation.mutate({ phoneNumber: countryCode + phoneNumber })
    }, 1000)
  }

  const handlePhoneChange = (text: string) => setPhoneNumber(formatByCountry(text, countryCode))
  const isValidPhone = validateByCountry(phoneNumber, countryCode)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top spacer for status bar area */}
      <View style={styles.topSpacer} />

      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.brandText}>whattodos</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Enter your mobile number</Text>

          <View style={styles.phoneInputContainer} pointerEvents={isLoading ? "none" : "auto"}>
            <CountryPicker countryCode={countryCode} onSelect={setCountryCode} />
            <TextInput
              style={styles.phoneInput}
              placeholder="Mobile Number"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={14}
              editable={!isLoading}
              textContentType="telephoneNumber"
              autoComplete="tel"
            />
          </View>

          <TouchableOpacity
            style={[styles.continueButton, (!isValidPhone || isLoading) && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!isValidPhone || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.altButton}>
            <View style={styles.altButtonContent}>
              <View style={styles.iconPlaceholder} />
              <Text style={styles.altButtonText}>Label</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.altButton}>
            <View style={styles.altButtonContent}>
              <View style={styles.iconPlaceholder} />
              <Text style={styles.altButtonText}>Label</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.termsText}>
            By entering your mobile number you are giving{"\n"}
            toLorem ipsum dolor sit amet, consectetur{"\n"}
            adipiscing elit, sed do eiusmod tempor{"\n"}
            incididunt ut labore et dolore magna.
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  topSpacer: {
    height: 50, // Space for status bar and some padding
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  brandText: {
    fontSize: 42,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    letterSpacing: -1,
  },
  formSection: {
    flex: 1,
    paddingTop: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 20,
    fontWeight: "500",
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "center",
  },
  phoneInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginLeft: 12,
    backgroundColor: "#f8f9fa",
    color: "#000",
  },
  continueButton: {
    backgroundColor: "#000000",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: "#cccccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e5e5",
  },
  orText: {
    marginHorizontal: 20,
    color: "#999999",
    fontSize: 14,
    fontWeight: "400",
  },
  altButton: {
    height: 56,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  altButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    backgroundColor: "#e5e5e5",
    borderRadius: 4,
    marginRight: 12,
  },
  altButtonText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  footerSection: {
    paddingBottom: 40,
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
    fontWeight: "400",
  },
})
