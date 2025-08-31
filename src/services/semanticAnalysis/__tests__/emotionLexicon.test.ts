import { emotionLexicon, activityTags, emotionActivityCorrelations } from '../emotionLexicon';
import { EmotionCategory } from '../types';
import { ACTIVITY_TAGS } from '../../../types/mood';

describe('EmotionLexicon', () => {
  describe('emotionLexicon structure', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(emotionLexicon)).toBe(true);
      expect(emotionLexicon.length).toBeGreaterThan(0);
    });

    it('should have all required emotion categories represented', () => {
      const expectedCategories: EmotionCategory[] = [
        'joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'neutral'
      ];

      expectedCategories.forEach(category => {
        const wordsInCategory = emotionLexicon.filter(word => word.category === category);
        expect(wordsInCategory.length).toBeGreaterThan(0);
      });
    });

    it('should have words as objects with word, category, and intensity properties', () => {
      emotionLexicon.forEach(wordObj => {
        expect(wordObj).toHaveProperty('word');
        expect(wordObj).toHaveProperty('category');
        expect(wordObj).toHaveProperty('intensity');
        expect(typeof wordObj.word).toBe('string');
        expect(typeof wordObj.intensity).toBe('number');
        expect(wordObj.word.trim().length).toBeGreaterThan(0);
        expect(wordObj.intensity).toBeGreaterThanOrEqual(0);
        expect(wordObj.intensity).toBeLessThanOrEqual(1);
      });
    });

    it('should not have duplicate words within categories', () => {
      const expectedCategories: EmotionCategory[] = [
        'joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'neutral'
      ];

      expectedCategories.forEach(category => {
        const wordsInCategory = emotionLexicon.filter(word => word.category === category);
        const wordStrings = wordsInCategory.map(w => w.word.toLowerCase());
        const uniqueWords = [...new Set(wordStrings)];
        expect(wordStrings.length).toBe(uniqueWords.length);
      });
    });

    it('should have reasonable distribution of words across categories', () => {
      const expectedCategories: EmotionCategory[] = [
        'joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'neutral'
      ];

      const categoryCounts = expectedCategories.map(category => ({
        category,
        count: emotionLexicon.filter(word => word.category === category).length
      }));

      // Each category should have at least 5 words
      categoryCounts.forEach(({ category, count }) => {
        expect(count).toBeGreaterThanOrEqual(5);
      });

      // Total should be reasonable (expecting around 100 words)
      expect(emotionLexicon.length).toBeGreaterThan(50);
      expect(emotionLexicon.length).toBeLessThan(200);
    });
  });

  describe('activityTags structure', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(activityTags)).toBe(true);
      expect(activityTags.length).toBeGreaterThan(0);
    });

    it('should contain valid activity tag strings', () => {
      activityTags.forEach(tag => {
        expect(typeof tag).toBe('string');
        expect(tag.trim().length).toBeGreaterThan(0);
        // Should be capitalized
        expect(tag[0]).toBe(tag[0].toUpperCase());
      });
    });

    it('should not have duplicate tags', () => {
      const uniqueTags = [...new Set(activityTags)];
      expect(activityTags.length).toBe(uniqueTags.length);
    });

    it('should have reasonable number of activity tags', () => {
      // Expecting around 15-25 activity tags
      expect(activityTags.length).toBeGreaterThan(10);
      expect(activityTags.length).toBeLessThan(30);
    });

    it('should match ACTIVITY_TAGS from mood types', () => {
      // The activityTags should match the ACTIVITY_TAGS from the mood types
      expect([...activityTags].sort()).toEqual([...ACTIVITY_TAGS].sort());
    });
  });

  describe('emotionActivityCorrelations structure', () => {
    it('should have correlations for all emotion categories', () => {
      const emotionCategories: EmotionCategory[] = [
        'joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'neutral'
      ];

      emotionCategories.forEach(emotion => {
        expect(emotionActivityCorrelations).toHaveProperty(emotion);
        expect(Array.isArray(emotionActivityCorrelations[emotion])).toBe(true);
      });
    });

    it('should contain valid activity tags in correlations', () => {
      Object.values(emotionActivityCorrelations).forEach(activities => {
        activities.forEach(activity => {
          expect(typeof activity).toBe('string');
          expect(activityTags.includes(activity as any)).toBe(true);
        });
      });
    });

    it('should have reasonable number of correlations per emotion', () => {
      Object.entries(emotionActivityCorrelations).forEach(([emotion, activities]) => {
        // Each emotion should have at least 2 correlated activities
        expect(activities.length).toBeGreaterThan(1);
        // But not too many (should be selective)
        expect(activities.length).toBeLessThan(10);
      });
    });

    it('should not have duplicate activities within emotion correlations', () => {
      Object.entries(emotionActivityCorrelations).forEach(([emotion, activities]) => {
        const uniqueActivities = [...new Set(activities)];
        expect(activities.length).toBe(uniqueActivities.length);
      });
    });
  });

  describe('data consistency', () => {
    it('should have consistent emotion categories across all structures', () => {
      const lexiconCategories = [...new Set(emotionLexicon.map(word => word.category))];
      const correlationCategories = Object.keys(emotionActivityCorrelations);

      expect(lexiconCategories.sort()).toEqual(correlationCategories.sort());
    });

    it('should have meaningful word intensities', () => {
      // Check that high-intensity words are actually strong emotion words
      const expectedCategories: EmotionCategory[] = [
        'joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'neutral'
      ];

      expectedCategories.forEach(category => {
        const wordsInCategory = emotionLexicon.filter(word => word.category === category);
        const highIntensityWords = wordsInCategory.filter(w => w.intensity > 0.8);
        
        // Some categories like 'neutral' might not have high intensity words, which is expected
        if (category === 'joy' || category === 'sadness' || category === 'anger' || category === 'fear') {
          expect(highIntensityWords.length).toBeGreaterThan(0);
        }

        // Spot check some high intensity words for joy
        if (category === 'joy' && highIntensityWords.length > 0) {
          const joyWords = highIntensityWords.map(w => w.word.toLowerCase());
          expect(joyWords.some(word => ['ecstatic', 'elated', 'thrilled'].includes(word))).toBe(true);
        }
      });
    });

    it('should have appropriate activity correlations', () => {
      // Joy should correlate with positive activities
      expect(emotionActivityCorrelations.joy).toContain('Exercise');
      expect(emotionActivityCorrelations.joy).toContain('Social');

      // Sadness might correlate with introspective activities
      expect(emotionActivityCorrelations.sadness.length).toBeGreaterThan(0);

      // Calm should correlate with peaceful activities
      expect(emotionActivityCorrelations.calm).toContain('Meditation');
      expect(emotionActivityCorrelations.calm).toContain('Reading');
    });
  });

  describe('word quality', () => {
    it('should not contain inappropriate or offensive words', () => {
      const inappropriateWords = ['hate', 'kill', 'die', 'stupid', 'idiot'];
      
      emotionLexicon.forEach(wordObj => {
        const word = wordObj.word.toLowerCase();
        inappropriateWords.forEach(inappropriate => {
          expect(word).not.toContain(inappropriate);
        });
      });
    });

    it('should contain common emotion words', () => {
      // Check for presence of basic emotion words
      const joyWords = emotionLexicon.filter(w => w.category === 'joy').map(w => w.word.toLowerCase());
      expect(joyWords).toContain('happy');
      expect(joyWords).toContain('joyful');

      const sadnessWords = emotionLexicon.filter(w => w.category === 'sadness').map(w => w.word.toLowerCase());
      expect(sadnessWords).toContain('sad');

      const angerWords = emotionLexicon.filter(w => w.category === 'anger').map(w => w.word.toLowerCase());
      expect(angerWords).toContain('angry');

      const fearWords = emotionLexicon.filter(w => w.category === 'fear').map(w => w.word.toLowerCase());
      expect(fearWords).toContain('scared');

      const calmWords = emotionLexicon.filter(w => w.category === 'calm').map(w => w.word.toLowerCase());
      expect(calmWords).toContain('peaceful');
    });

    it('should have words that are actually related to their categories', () => {
      // This is a basic sanity check - in a real scenario you might use
      // more sophisticated NLP techniques to validate semantic similarity
      
      // Joy words should generally be positive
      const joyWords = emotionLexicon.filter(w => w.category === 'joy').map(w => w.word.toLowerCase());
      const negativeWords = ['sad', 'angry', 'scared', 'worried'];
      joyWords.forEach(word => {
        negativeWords.forEach(negative => {
          expect(word).not.toBe(negative);
        });
      });
    });
  });
});