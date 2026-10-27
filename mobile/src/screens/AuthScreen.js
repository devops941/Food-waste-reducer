import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '../components/Icons';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';

export default function AuthScreen() {
  const { login, register, demoLogin } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter both email and password.');
      return;
    }
    if (isRegister && !name.trim()) {
      Alert.alert('Required Fields', 'Please enter your name.');
      return;
    }

    setIsLoading(true);
    let res;
    if (isRegister) {
      res = await register(name.trim(), email.trim(), password);
    } else {
      res = await login(email.trim(), password);
    }
    setIsLoading(false);

    if (!res.success) {
      Alert.alert('Authentication', res.message || 'Please check your credentials or tap 1-Click Demo.');
    }
  };

  const handleFillDemo = async () => {
    setEmail('demo@pantryfresh.app');
    setPassword('password123');
    setIsLoading(true);
    await demoLogin();
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* App Icon Badge */}
        <View style={styles.appIconBadge}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.appIconImage}
            resizeMode="cover"
          />
        </View>

        {/* Serif Heading */}
        <Text style={styles.title}>{isRegister ? 'Create an account' : 'Welcome back'}</Text>
        <Text style={styles.subtitle}>
          {isRegister
            ? 'Join Pantry Fresh to stop waste and cook delicious meals.'
            : 'Sign in to manage your kitchen pantry and rescue food.'}
        </Text>

        {/* Card */}
        <View style={styles.card}>
          {isRegister && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={19} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Emma Green"
                  placeholderTextColor={COLORS.textSubtle}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email Address <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={19} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textSubtle}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={19} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textSubtle}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Primary Submit Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isRegister ? 'Create Account →' : 'Sign In →'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* 1-Click Demo Button */}
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleFillDemo}
            activeOpacity={0.88}
          >
            <Ionicons name="sparkles" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.demoBtnText}>Auto-fill Demo Credentials (1-Click)</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Toggle */}
        <TouchableOpacity
          style={styles.footerLinkContainer}
          onPress={() => setIsRegister(!isRegister)}
        >
          <Text style={styles.footerText}>
            {isRegister ? 'Already have an account? ' : "Don't have an account yet? "}
            <Text style={styles.footerLink}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 65,
    paddingBottom: 40,
    alignItems: 'center',
  },
  appIconBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#E4572E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  appIconImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 21,
    marginBottom: 28,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  required: {
    color: COLORS.rust,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: COLORS.textDark,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 18,
  },
  demoBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoBtnText: {
    color: COLORS.mintText,
    fontSize: 13.5,
    fontWeight: '700',
  },
  footerLinkContainer: {
    marginTop: 26,
  },
  footerText: {
    fontSize: 13.5,
    color: COLORS.textMuted,
  },
  footerLink: {
    color: COLORS.textDark,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
