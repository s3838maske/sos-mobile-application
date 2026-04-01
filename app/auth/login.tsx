import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import FormTextInput from "../components/FormTextInput";
import { signInUser } from "../../redux/slices/authSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import { validateEmail, validatePassword } from "../../utils/validations";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  type LoginFormData = {
    email: string;
    password: string;
  };

  const {
    control,
    handleSubmit,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const user = await dispatch(
        signInUser({ email: data.email.trim(), password: data.password }),
      ).unwrap();
      const { isAdminUser } = await import("../../services/authService");
      if (isAdminUser(user.email)) {
        router.replace("/(tabs)/admin" as any);
      } else {
        router.replace("/(tabs)/home" as any);
      }
    } catch (err) {
      Alert.alert("Login Failed", error || "An error occurred");
    }
  };

  const navigateToSignup = () => {
    router.push("/auth/signup");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="shield-checkmark"
                size={60}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.title}>SOS Guard</Text>
            <Text style={styles.subtitle}>Secure Access to Your Safety</Text>
          </View>

          <View style={styles.form}>
            <FormTextInput
              control={control}
              name="email"
              placeholder="Email Address"
              isLoading={isLoading}
              leftIconName="mail-outline"
              rules={{
                validate: (value) =>
                  validateEmail(value).isValid ||
                  validateEmail(value).error ||
                  "Invalid email",
              }}
              inputProps={{
                keyboardType: "email-address",
                autoCapitalize: "none",
                autoCorrect: false,
              }}
            />

            <FormTextInput
              control={control}
              name="password"
              placeholder="Password"
              isLoading={isLoading}
              leftIconName="lock-closed-outline"
              rules={{
                validate: (value) =>
                  validatePassword(value).isValid ||
                  validatePassword(value).error ||
                  "Invalid password",
              }}
              inputProps={{
                secureTextEntry: !showPassword,
                autoCapitalize: "none",
              }}
              rightElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/auth/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(handleLogin)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToSignup}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
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
    marginTop: 5,
  },
  form: {
    width: "100%",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: SIZES.small,
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: SIZES.body,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: "bold",
  },
});
