/**
 * FUZZY MATCH UTILITY
 * Provides typo-tolerant matching for typed user input.
 * Uses Levenshtein distance with length-scaled thresholds.
 *
 * Used by: Word Pair exercise (episodic memory recall)
 * NOT used by: Digit Span (exact sequence recall by design)
 */

const FuzzyMatch = {
  /**
   * Compute Levenshtein distance between two strings.
   * Uses optimized single-row DP — O(n*m) time, O(min(n,m)) space.
   */
  levenshteinDistance(str1, str2) {
    // Ensure str1 is the shorter string for space optimization
    if (str1.length > str2.length) {
      [str1, str2] = [str2, str1];
    }

    const m = str1.length;
    const n = str2.length;

    // Previous row of distances
    let prev = new Array(m + 1);
    for (let j = 0; j <= m; j++) {
      prev[j] = j;
    }

    for (let i = 1; i <= n; i++) {
      const curr = new Array(m + 1);
      curr[0] = i;

      for (let j = 1; j <= m; j++) {
        if (str2[i - 1] === str1[j - 1]) {
          curr[j] = prev[j - 1];
        } else {
          curr[j] = 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
        }
      }

      prev = curr;
    }

    return prev[m];
  },

  /**
   * Normalize time format: "9.30" → "9:30"
   * Only matches digit.digit patterns (not decimals in other contexts)
   */
  normalizeTimeFormat(str) {
    return str.replace(CONSTANTS.FUZZY_MATCH.TIME_FORMAT_REGEX, '$1:$2');
  },

  /**
   * Strip leading/trailing punctuation that doesn't affect word identity
   */
  stripPunctuation(str) {
    return str.replace(CONSTANTS.FUZZY_MATCH.STRIP_PUNCTUATION_REGEX, '');
  },

  /**
   * Normalize common diacritics to base letters.
   * Handles Dutch/European characters that users might omit accents for.
   */
  normalizeDiacritics(str) {
    // Use Unicode normalization NFD to decompose, then strip combining marks
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Full normalization pipeline for user input before comparison.
   * Order matters: trim → lowercase → strip punctuation → time format → diacritics → collapse spaces
   */
  normalizeInput(str) {
    let result = str.trim().toLowerCase();
    result = this.stripPunctuation(result);
    result = this.normalizeTimeFormat(result);
    result = this.normalizeDiacritics(result);
    result = result.replace(/\s+/g, ' '); // collapse multiple spaces
    return result;
  },

  /**
   * Get maximum allowed Levenshtein distance for a word of given length.
   * Uses conservative thresholds from CONSTANTS.FUZZY_MATCH.THRESHOLDS.
   */
  getMaxAllowedDistance(wordLength) {
    const thresholds = CONSTANTS.FUZZY_MATCH.THRESHOLDS;

    for (const threshold of thresholds) {
      if (wordLength <= threshold.maxLength) {
        return threshold.maxDistance;
      }
    }

    // Fallback (shouldn't reach here if thresholds include Infinity)
    return 0;
  },

  /**
   * Compare a single user word against a correct word.
   * @returns {{ isMatch: boolean, matchType: 'exact'|'fuzzy'|'none', distance: number }}
   */
  compareWords(userWord, correctWord) {
    const normalizedUser = this.normalizeInput(userWord);
    const normalizedCorrect = this.normalizeInput(correctWord);

    // Exact match after normalization
    if (normalizedUser === normalizedCorrect) {
      return { isMatch: true, matchType: 'exact', distance: 0 };
    }

    // Compute Levenshtein distance
    const distance = this.levenshteinDistance(normalizedUser, normalizedCorrect);
    const maxDistance = this.getMaxAllowedDistance(normalizedCorrect.length);

    if (distance <= maxDistance) {
      return { isMatch: true, matchType: 'fuzzy', distance };
    }

    return { isMatch: false, matchType: 'none', distance };
  },

  /**
   * Match a user-entered word pair against a correct pair.
   * Tries both orderings (word1↔word2 and word2↔word1).
   * @returns {{ isMatch: boolean, matchType: 'exact'|'fuzzy'|'none', word1Result: object, word2Result: object, totalDistance: number }}
   */
  matchWordPair(userPair, correctPair) {
    // Try forward match: user.word1→correct.word1, user.word2→correct.word2
    const fwd1 = this.compareWords(userPair.word1, correctPair.word1);
    const fwd2 = this.compareWords(userPair.word2, correctPair.word2);
    const fwdMatch = fwd1.isMatch && fwd2.isMatch;
    const fwdDistance = fwd1.distance + fwd2.distance;

    // Try reverse match: user.word1→correct.word2, user.word2→correct.word1
    const rev1 = this.compareWords(userPair.word1, correctPair.word2);
    const rev2 = this.compareWords(userPair.word2, correctPair.word1);
    const revMatch = rev1.isMatch && rev2.isMatch;
    const revDistance = rev1.distance + rev2.distance;

    // Pick the best match (prefer forward if tied)
    let bestIsMatch, bestWord1Result, bestWord2Result, bestDistance;

    if (fwdMatch && revMatch) {
      // Both match — pick lower total distance
      if (fwdDistance <= revDistance) {
        bestIsMatch = true;
        bestWord1Result = fwd1;
        bestWord2Result = fwd2;
        bestDistance = fwdDistance;
      } else {
        bestIsMatch = true;
        bestWord1Result = rev1;
        bestWord2Result = rev2;
        bestDistance = revDistance;
      }
    } else if (fwdMatch) {
      bestIsMatch = true;
      bestWord1Result = fwd1;
      bestWord2Result = fwd2;
      bestDistance = fwdDistance;
    } else if (revMatch) {
      bestIsMatch = true;
      bestWord1Result = rev1;
      bestWord2Result = rev2;
      bestDistance = revDistance;
    } else {
      bestIsMatch = false;
      // Report forward attempt for diagnostics
      bestWord1Result = fwd1;
      bestWord2Result = fwd2;
      bestDistance = fwdDistance;
    }

    // Determine overall match type
    let matchType = 'none';
    if (bestIsMatch) {
      matchType = (bestWord1Result.matchType === 'exact' && bestWord2Result.matchType === 'exact')
        ? 'exact'
        : 'fuzzy';
    }

    return {
      isMatch: bestIsMatch,
      matchType,
      word1Result: bestWord1Result,
      word2Result: bestWord2Result,
      totalDistance: bestDistance,
    };
  },
};

window.FuzzyMatch = FuzzyMatch;
