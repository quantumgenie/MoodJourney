import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Text } from 'react-native-svg';
import { EmotionWord } from '../../services/semanticAnalysis/types';
import { theme } from '../../theme/theme';

interface EmotionWordCloudProps {
  words: EmotionWord[];
  width?: number;
  height?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const EmotionWordCloud: React.FC<EmotionWordCloudProps> = ({
  words,
  width = screenWidth - theme.spacing.md * 2,
  height = 200,
}) => {
  // Simple layout algorithm for demonstration
  // In a production app, you'd want a more sophisticated layout algorithm
  const layoutWords = () => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    return words.map((word, index) => {
      const angle = (index / words.length) * 2 * Math.PI;
      const distance = radius * word.intensity;
      
      return {
        ...word,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        fontSize: 12 + (word.intensity * 16), // Size based on intensity
      };
    });
  };

  const layoutedWords = layoutWords();

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {layoutedWords.map((word, index) => (
          <Text
            key={`${word.word}-${index}`}
            x={word.x}
            y={word.y}
            fontSize={word.fontSize}
            fill={theme.colors[word.category]}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {word.word}
          </Text>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
});
