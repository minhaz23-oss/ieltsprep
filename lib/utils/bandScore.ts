/**
 * Calculate overall IELTS band score from section scores
 * Following official IELTS rounding rules:
 * - .25 rounds down to .0
 * - .75 rounds up to next whole band
 * - .5 stays as .5
 */
export function calculateOverallBandScore(scores: {
  listening?: number;
  reading?: number;
  writing?: number;
  speaking?: number;
}): number {
  const { listening, reading, writing, speaking } = scores;
  
  // Ensure all scores are present
  if (
    listening === undefined || 
    reading === undefined || 
    writing === undefined || 
    speaking === undefined
  ) {
    throw new Error('All section scores are required to calculate overall band score');
  }

  // Calculate average
  const average = (listening + reading + writing + speaking) / 4;

  // Apply IELTS rounding rules
  return roundToIELTSBand(average);
}

/**
 * Round a score to IELTS band scale (0.5 increments)
 * Following official IELTS rounding rules
 */
export function roundToIELTSBand(score: number): number {
  // Get the decimal part
  const decimal = score - Math.floor(score);

  // Apply IELTS rounding rules
  if (decimal < 0.25) {
    // Round down to whole number
    return Math.floor(score);
  } else if (decimal < 0.75) {
    // Round to .5
    return Math.floor(score) + 0.5;
  } else {
    // Round up to next whole number
    return Math.ceil(score);
  }
}

/**
 * Convert raw reading score (out of 40) to band score
 * Based on official IELTS reading score conversion table
 */
export function convertReadingScoreToBand(rawScore: number, isAcademic: boolean = true): number {
  if (rawScore < 0 || rawScore > 40) {
    throw new Error('Reading raw score must be between 0 and 40');
  }

  // Academic Reading conversion (approximate)
  const academicConversion: { [key: number]: number } = {
    40: 9.0, 39: 8.5, 38: 8.0, 37: 8.0, 36: 7.5, 35: 7.5,
    34: 7.0, 33: 7.0, 32: 6.5, 31: 6.5, 30: 6.5,
    29: 6.0, 28: 6.0, 27: 6.0, 26: 5.5, 25: 5.5,
    24: 5.5, 23: 5.0, 22: 5.0, 21: 5.0, 20: 5.0,
    19: 4.5, 18: 4.5, 17: 4.5, 16: 4.0, 15: 4.0,
    14: 4.0, 13: 3.5, 12: 3.5, 11: 3.5, 10: 3.0
  };

  // General Training conversion (slightly different)
  const generalConversion: { [key: number]: number } = {
    40: 9.0, 39: 8.5, 38: 8.5, 37: 8.0, 36: 8.0, 35: 7.5,
    34: 7.5, 33: 7.0, 32: 7.0, 31: 6.5, 30: 6.5,
    29: 6.0, 28: 6.0, 27: 6.0, 26: 5.5, 25: 5.5,
    24: 5.5, 23: 5.0, 22: 5.0, 21: 5.0, 20: 4.5,
    19: 4.5, 18: 4.0, 17: 4.0, 16: 4.0, 15: 3.5,
    14: 3.5, 13: 3.0, 12: 3.0, 11: 3.0, 10: 2.5
  };

  const conversion = isAcademic ? academicConversion : generalConversion;
  
  // Return converted score or lowest band if not in table
  return conversion[rawScore] || (rawScore < 10 ? 2.5 : 5.0);
}

/**
 * Convert raw listening score (out of 40) to band score
 * Based on official IELTS listening score conversion table
 */
export function convertListeningScoreToBand(rawScore: number): number {
  if (rawScore < 0 || rawScore > 40) {
    throw new Error('Listening raw score must be between 0 and 40');
  }

  // Listening conversion table (same for Academic and General Training)
  const conversion: { [key: number]: number } = {
    40: 9.0, 39: 8.5, 38: 8.5, 37: 8.0, 36: 8.0, 35: 7.5,
    34: 7.5, 33: 7.0, 32: 7.0, 31: 6.5, 30: 6.5,
    29: 6.5, 28: 6.0, 27: 6.0, 26: 6.0, 25: 5.5,
    24: 5.5, 23: 5.5, 22: 5.0, 21: 5.0, 20: 5.0,
    19: 4.5, 18: 4.5, 17: 4.5, 16: 4.0, 15: 4.0,
    14: 4.0, 13: 3.5, 12: 3.5, 11: 3.5, 10: 3.0
  };

  // Return converted score or lowest band if not in table
  return conversion[rawScore] || (rawScore < 10 ? 2.5 : 5.0);
}

/**
 * Get band score description
 */
export function getBandScoreDescription(band: number): string {
  const descriptions: { [key: number]: string } = {
    9.0: 'Expert User',
    8.5: 'Very Good User',
    8.0: 'Very Good User',
    7.5: 'Good User',
    7.0: 'Good User',
    6.5: 'Competent User',
    6.0: 'Competent User',
    5.5: 'Modest User',
    5.0: 'Modest User',
    4.5: 'Limited User',
    4.0: 'Limited User',
    3.5: 'Extremely Limited User',
    3.0: 'Extremely Limited User',
  };

  return descriptions[band] || 'Intermittent User';
}
