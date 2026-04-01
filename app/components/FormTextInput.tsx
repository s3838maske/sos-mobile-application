import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { COLORS, SHADOWS, SIZES } from "../../utils/theme";

type FormTextInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  placeholder: string;
  isLoading?: boolean;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  inputProps?: TextInputProps;
};

export default function FormTextInput<T extends FieldValues>({
  control,
  name,
  rules,
  placeholder,
  isLoading = false,
  leftIconName,
  rightElement,
  inputProps,
}: FormTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View>
          <View style={[styles.inputContainer, error && styles.inputContainerError]}>
            {leftIconName && (
              <Ionicons
                name={leftIconName}
                size={20}
                color={COLORS.textLight}
                style={styles.inputIcon}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={COLORS.textLight}
              value={String(value ?? "")}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isLoading}
              {...inputProps}
            />
            {rightElement}
          </View>
          {error?.message && <Text style={styles.errorText}>{String(error.message)}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    ...SHADOWS.light,
  },
  inputContainerError: {
    borderColor: COLORS.danger,
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
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.small,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 5,
  },
});
