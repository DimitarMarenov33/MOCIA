/**
 * DUTCH WORD LIST
 * Comprehensive list of common Dutch nouns for word pair association
 * Categories ensure semantic variety to avoid confusion
 */

const WORD_LIST = {
  // Animals (Dieren)
  animals: [
    'hond', 'kat', 'paard', 'koe', 'schaap', 'geit', 'varken', 'kip',
    'eend', 'gans', 'konijn', 'muis', 'rat', 'hamster', 'vogel', 'vis',
    'olifant', 'leeuw', 'tijger', 'beer', 'wolf', 'vos', 'hert', 'ree',
    'aap', 'zebra', 'giraffe', 'krokodil', 'slang', 'schildpad'
  ],

  // Nature (Natuur)
  nature: [
    'boom', 'bloem', 'gras', 'blad', 'tak', 'wortel', 'zaad', 'plant',
    'roos', 'tulp', 'zon', 'maan', 'ster', 'wolk', 'regen', 'sneeuw',
    'wind', 'bliksem', 'regenboog', 'rivier', 'meer', 'zee', 'oceaan',
    'berg', 'heuvel', 'dal', 'bos', 'strand', 'woestijn', 'eiland'
  ],

  // Food (Eten)
  food: [
    'brood', 'kaas', 'melk', 'boter', 'ei', 'vlees', 'vis', 'kip',
    'appel', 'peer', 'banaan', 'sinaasappel', 'druif', 'aardbei', 'kers',
    'aardappel', 'wortel', 'ui', 'tomaat', 'komkommer', 'sla', 'kool',
    'rijst', 'pasta', 'soep', 'brood', 'koek', 'taart', 'snoep', 'chocola'
  ],

  // Household (Huishouden)
  household: [
    'tafel', 'stoel', 'bed', 'kast', 'lamp', 'klok', 'spiegel', 'deur',
    'raam', 'muur', 'vloer', 'plafond', 'trap', 'gordijn', 'tapijt',
    'bord', 'kopje', 'glas', 'vork', 'mes', 'lepel', 'pan', 'kom',
    'kussen', 'deken', 'laken', 'handdoek', 'zeep', 'borstel', 'kam'
  ],

  // Clothing (Kleding)
  clothing: [
    'jas', 'broek', 'rok', 'jurk', 'shirt', 'trui', 'vest', 'hoed',
    'pet', 'sjaal', 'handschoen', 'sok', 'schoen', 'laars', 'sandaal',
    'riem', 'das', 'muts', 'jas', 'regenjas', 'badpak', 'pyjama'
  ],

  // Transportation (Vervoer)
  transport: [
    'auto', 'fiets', 'motor', 'bus', 'tram', 'trein', 'metro', 'taxi',
    'boot', 'schip', 'vliegtuig', 'helikopter', 'vrachtwagen', 'ambulance',
    'brandweerauto', 'politieauto', 'scooter', 'skateboard', 'step'
  ],

  // Body parts (Lichaam)
  body: [
    'hoofd', 'haar', 'oog', 'oor', 'neus', 'mond', 'tand', 'tong',
    'nek', 'schouder', 'arm', 'elleboog', 'hand', 'vinger', 'duim',
    'borst', 'buik', 'rug', 'been', 'knie', 'voet', 'teen', 'hart'
  ],

  // Tools & Objects (Gereedschap)
  tools: [
    'hamer', 'zaag', 'schaar', 'mes', 'schroef', 'spijker', 'tang',
    'boor', 'ladder', 'emmer', 'bezem', 'dweil', 'pen', 'potlood',
    'papier', 'boek', 'krant', 'brief', 'telefoon', 'computer', 'tv'
  ],

  // Places (Plaatsen)
  places: [
    'huis', 'school', 'kerk', 'winkel', 'ziekenhuis', 'park', 'station',
    'vliegveld', 'haven', 'brug', 'toren', 'kasteel', 'museum', 'theater',
    'restaurant', 'cafe', 'hotel', 'bibliotheek', 'bank', 'postkantoor'
  ],

  // Time (Tijd)
  time: [
    'dag', 'nacht', 'morgen', 'middag', 'avond', 'week', 'maand', 'jaar',
    'seconde', 'minuut', 'uur', 'seizoen', 'lente', 'zomer', 'herfst', 'winter'
  ],

  // Weather (Weer)
  weather: [
    'zon', 'regen', 'wind', 'sneeuw', 'hagel', 'mist', 'vorst', 'donder',
    'bliksem', 'storm', 'orkaan', 'tornado', 'wolk', 'regenboog'
  ]
};

/**
 * Get a random word from the word list, avoiding recently used words
 * @param {Array} excludeWords - Words to exclude from selection
 * @returns {string} Random word
 */
function getRandomWord(excludeWords = []) {
  // Flatten all categories into one array
  const allWords = Object.values(WORD_LIST).flat();

  // Filter out excluded words
  const availableWords = allWords.filter(word => !excludeWords.includes(word));

  if (availableWords.length === 0) {
    // If all words are excluded, use the full list
    return allWords[Math.floor(Math.random() * allWords.length)];
  }

  return availableWords[Math.floor(Math.random() * availableWords.length)];
}

/**
 * Generate N unique word pairs
 * @param {number} numPairs - Number of pairs to generate
 * @param {Array} excludeWords - Words to exclude from selection
 * @returns {Array} Array of word pair objects {word1, word2}
 */
function generateWordPairs(numPairs, excludeWords = []) {
  const pairs = [];
  const usedWords = [...excludeWords];

  for (let i = 0; i < numPairs; i++) {
    const word1 = getRandomWord(usedWords);
    usedWords.push(word1);

    const word2 = getRandomWord(usedWords);
    usedWords.push(word2);

    pairs.push({
      id: i + 1,
      word1: word1,
      word2: word2
    });
  }

  return pairs;
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.WORD_LIST = WORD_LIST;
  window.getRandomWord = getRandomWord;
  window.generateWordPairs = generateWordPairs;
}
