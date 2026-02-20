import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, SHADOWS } from "../../../utils/theme";

interface SOSButtonProps {
  onPress: () => void;
  isActive: boolean;
}

const { width } = Dimensions.get("window");

export default function SOSButton({ onPress, isActive }: SOSButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ringAnim, {
              toValue: 1.5,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(ringAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
      ringAnim.setValue(1);
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {isActive && (
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale: ringAnim }],
              opacity: Animated.divide(2, ringAnim).interpolate({
                inputRange: [1.3, 2],
                outputRange: [0.5, 0],
              }),
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.outerCircle,
          {
            transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
          },
          isActive && styles.outerCircleActive,
        ]}
      >
        <TouchableOpacity
          style={[styles.innerCircle, isActive && styles.innerCircleActive]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={isActive ? "shield-checkmark" : "warning"}
              size={50}
              color="white"
            />
          </View>
          <Text style={styles.buttonText}>{isActive ? "STOP" : "SOS"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.6,
    height: width * 0.6,
  },
  ring: {
    position: "absolute",
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: (width * 0.45) / 2,
    borderWidth: 4,
    borderColor: COLORS.primary,
    opacity: 0.3,
  },
  outerCircle: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: (width * 0.45) / 2,
    backgroundColor: COLORS.primary + "20", // Transparent red
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.heavy,
  },
  outerCircleActive: {
    backgroundColor: COLORS.success + "20",
    shadowColor: COLORS.success,
  },
  innerCircle: {
    width: width * 0.38,
    height: width * 0.38,
    borderRadius: (width * 0.38) / 2,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.2)",
  },
  innerCircleActive: {
    backgroundColor: COLORS.success,
    borderColor: "rgba(255,255,255,0.3)",
  },
  iconContainer: {
    marginBottom: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
