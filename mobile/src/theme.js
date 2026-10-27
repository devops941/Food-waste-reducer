import { Platform } from 'react-native';

export const COLORS = {
  // Backgrounds
  background: '#FAF7F2',
  cardBg: '#FFFFFF',
  
  // Primary Greens
  primary: '#467243',
  primaryDark: '#355733',
  primaryLight: '#EBF2EA',
  primaryBorder: '#D0E2CF',
  
  // Viewfinder
  viewfinderBg: '#25432D',
  viewfinderIconBg: '#3E6147',
  
  // Pastels & Accent Badges
  mintBg: '#EDF5EC',
  mintBorder: '#D4E6D2',
  mintText: '#2E6238',
  
  butterBg: '#FBF0CB',
  butterBorder: '#F4E2A8',
  butterText: '#856404',
  
  peachBg: '#FDF1EC',
  peachBorder: '#F8DDD2',
  peachText: '#BD5338',
  
  rust: '#BD5338',
  rustLight: '#FDF1EC',
  
  // Neutrals & Text
  textDark: '#1E2922',
  textMuted: '#68776B',
  textSubtle: '#94A398',
  inputBorder: '#E5E0D5',
  cardBorder: '#E8E4DA',
  divider: '#EFEBE3',
};

export const FONTS = {
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
};
