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
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import FormTextInput from "../components/FormTextInput";
import { signUpUser } from "../../redux/slices/authSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhoneNumber,
} from "../../utils/validations";

export default function SignupScreen() {
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  type SignupFormData = {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };

  const {
    control,
    handleSubmit,
    watch,
  } = useForm<SignupFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const passwordValue = watch("password");

  const handleSignup = async (data: SignupFormData) => {
    try {
      const user = await dispatch(
        signUpUser({
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          password: data.password,
        }),
      ).unwrap();
      const { isAdminUser } = await import("../../services/authService");
      if (isAdminUser(user.email)) {
        router.replace("/(tabs)/admin" as any);
      } else {
        router.replace("/(tabs)/home" as any);
      }
    } catch (err) {
      Alert.alert("Signup Failed", error || "An error occurred");
    }
  };

  const navigateToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={navigateToLogin}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Join SOS Guard</Text>
            <Text style={styles.subtitle}>Your Safety Journey Starts Here</Text>
          </View>

          <View style={styles.form}>
            <FormTextInput
              control={control}
              name="name"
              placeholder="Full Name"
              isLoading={isLoading}
              leftIconName="person-outline"
              rules={{
                validate: (value) =>
                  validateName(value).isValid ||
                  validateName(value).error ||
                  "Invalid name",
              }}
              inputProps={{ autoCapitalize: "words" }}
            />

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
              name="phone"
              placeholder="Phone Number"
              isLoading={isLoading}
              leftIconName="call-outline"
              rules={{
                validate: (value) =>
                  validatePhoneNumber(value).isValid ||
                  validatePhoneNumber(value).error ||
                  "Invalid phone number",
              }}
              inputProps={{ keyboardType: "phone-pad" }}
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

            <FormTextInput
              control={control}
              name="confirmPassword"
              placeholder="Confirm Password"
              isLoading={isLoading}
              leftIconName="lock-closed-outline"
              rules={{
                validate: (value) =>
                  validateConfirmPassword(passwordValue, value).isValid ||
                  validateConfirmPassword(passwordValue, value).error ||
                  "Passwords do not match",
              }}
              inputProps={{
                secureTextEntry: !showPassword,
                autoCapitalize: "none",
              }}
            />

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(handleSignup)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    ...SHADOWS.light,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    marginTop: 5,
  },
  form: {
    width: "100%",
  },
  termsContainer: {
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  termsText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "600",
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
