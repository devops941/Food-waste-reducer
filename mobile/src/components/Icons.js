import React from 'react';
import { View, Text } from 'react-native';
import {
  Ionicons as ExpoIonicons,
  Feather as ExpoFeather,
  MaterialCommunityIcons as ExpoMCI,
} from '@expo/vector-icons';

export const Feather = ({ name, size = 20, color = '#1E2922', style }) => {
  return <ExpoFeather name={name} size={size} color={color} style={style} />;
};

export const Ionicons = ({ name, size = 20, color = '#1E2922', style }) => {
  return <ExpoIonicons name={name} size={size} color={color} style={style} />;
};

export const MaterialCommunityIcons = ({ name, size = 20, color = '#1E2922', style }) => {
  return <ExpoMCI name={name} size={size} color={color} style={style} />;
};

export function Icon({ name, size = 20, color = '#1E2922', style }) {
  // Common Feather icons
  const featherNames = [
    'home',
    'camera',
    'box',
    'package',
    'book-open',
    'settings',
    'search',
    'image',
    'refresh-cw',
    'plus',
    'trash-2',
    'check',
    'x',
    'clock',
  ];

  if (featherNames.includes(name)) {
    return <ExpoFeather name={name} size={size} color={color} style={style} />;
  }

  // Handle aliases
  if (name === 'recipes') {
    return <ExpoFeather name="book-open" size={size} color={color} style={style} />;
  }

  // Fallback to Ionicons
  return <ExpoIonicons name={name} size={size} color={color} style={style} />;
}

export default Icon;
