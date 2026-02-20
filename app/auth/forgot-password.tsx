import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../../redux/slices/authSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      await dispatch(resetPassword(email)).unwrap();
      Alert.alert(
        "Success",
        "A password reset link has been sent to your email address.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send reset email");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="lock-open-outline"
                size={60}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    ...SHADOWS.light,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    ...SHADOWS.light,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: SIZES.radius,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.medium,
  },
  buttonDisabled: {
    backgroundColor: COLORS.grey,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.h3,
    fontWeight: "bold",
  },
});
