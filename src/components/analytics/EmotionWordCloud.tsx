import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Text } from 'react-native-svg';
import { EmotionWord } from '../../services/semanticAnalysis/types';
import { theme } from '../../theme/theme';
import { Typography } from '../common';

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
  // Handle empty state
  if (!words || words.length === 0) {
    return (
      <View style={styles.container}>
        <Typography variant="h3">Emotion Word Cloud</Typography>
        <View style={styles.emptyState}>
          <Typography variant="body2" color="disabled" centered>
            No emotion words detected in your entries
          </Typography>
        </View>
      </View>
    );
  }

  // Process and deduplicate words for larger datasets
  const processWords = () => {
    const wordMap = new Map<string, EmotionWord>();
    
    // Aggregate duplicate words by combining their intensities
    words.forEach(word => {
      const existing = wordMap.get(word.word);
      if (existing) {
        // Average the intensity and keep the stronger emotion category
        wordMap.set(word.word, {
          ...existing,
          intensity: Math.max(existing.intensity, word.intensity),
          category: word.intensity > existing.intensity ? word.category : existing.category,
        });
      } else {
        wordMap.set(word.word, word);
      }
    });

    // Convert back to array and sort by intensity (strongest first)
    return Array.from(wordMap.values())
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 20); // Limit to top 20 words for better visualization
  };

  // Enhanced layout algorithm for better word cloud distribution
  const layoutWords = () => {
    const processedWords = processWords();
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 3;
    
    return processedWords.map((word, index) => {
      // Use spiral layout for better distribution
      const spiralFactor = index * 0.5;
      const angle = spiralFactor * 0.3;
      const distance = Math.min(maxRadius * (word.intensity * 0.8 + 0.2), maxRadius * 0.9);
      
      // Add some randomness to avoid perfect circles
      const jitter = (Math.random() - 0.5) * 20;
      
      return {
        ...word,
        x: centerX + Math.cos(angle) * distance + jitter,
        y: centerY + Math.sin(angle) * distance + jitter,
        fontSize: Math.max(10, Math.min(24, 12 + (word.intensity * 14))), // Constrained font size
      };
    });
  };

  const layoutedWords = layoutWords();

  return (
    <View style={styles.container}>
      <Typography variant="h3">Emotion Word Cloud</Typography>
      <View style={[styles.cloudContainer, { width, height }]}>
        <Svg width={width} height={height}>
          {layoutedWords.map((word, index) => {
            // Safety checks for coordinates
            if (!isFinite(word.x) || !isFinite(word.y) || !isFinite(word.fontSize)) {
              return null;
            }

            return (
              <Text
                key={`${word.word}-${index}`}
                x={word.x}
                y={word.y}
                fontSize={word.fontSize}
                fill={theme.colors[word.category] || theme.colors.text}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontWeight="500"
              >
                {word.word}
              </Text>
            );
          })}
        </Svg>
      </View>
      <Typography variant="caption" color="disabled" centered style={styles.subtitle}>
        Top {layoutedWords.length} emotion words from your journal entries
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  cloudContainer: {
    alignSelf: 'center',
    marginVertical: theme.spacing.sm,
  },
  emptyState: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: theme.spacing.sm,
  },
});
