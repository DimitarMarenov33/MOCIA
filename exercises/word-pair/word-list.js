/**
 * WORD PAIR ASSOCIATION - REAL-WORLD CONTEXTS
 * Three pair types for practical memory training:
 * 1. Name - City (Dutch names + Dutch cities)
 * 2. Building - Time (appointment-style)
 * 3. Activity - Day (schedule-style)
 */

const PAIR_DATA = {
  // Dutch first names
  names: [
    'Jan', 'Piet', 'Klaas', 'Willem', 'Henk', 'Johan', 'Peter', 'Dirk',
    'Bas', 'Tom', 'Jeroen', 'Mark', 'Erik', 'Frank', 'Martijn', 'Ruben',
    'Anna', 'Maria', 'Sophie', 'Emma', 'Lisa', 'Linda', 'Sandra', 'Marieke',
    'Ingrid', 'Els', 'Joke', 'Anja', 'Monique', 'Petra', 'Esther', 'Renate',
    'Cor', 'Kees', 'Wim', 'Gerard', 'Hans', 'Rob', 'Paul', 'Bert'
  ],

  // Dutch cities
  cities: [
    'Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Tilburg',
    'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Enschede', 'Haarlem',
    'Arnhem', 'Zaanstad', 'Amersfoort', 'Apeldoorn', 'Hoofddorp', 'Maastricht',
    'Leiden', 'Dordrecht', 'Zoetermeer', 'Zwolle', 'Deventer', 'Delft',
    'Alkmaar', 'Heerlen', 'Venlo', 'Leeuwarden', 'Hilversum', 'Assen'
  ],

  // Buildings/locations for appointments
  buildings: [
    'Apotheek', 'Huisarts', 'Tandarts', 'Ziekenhuis', 'Kapper', 'Bibliotheek',
    'Gemeentehuis', 'Bank', 'Postkantoor', 'Supermarkt', 'Bakker', 'Slager',
    'Opticien', 'Fysiotherapeut', 'Sportschool', 'Zwembad', 'Kerk', 'School',
    'Station', 'Garage', 'Dierenarts', 'Notaris', 'Accountant', 'Bloemenwinkel'
  ],

  // Activities
  activities: [
    'Fysiotherapie', 'Zwemmen', 'Yoga', 'Wandelen', 'Fietsen', 'Boodschappen',
    'Doktersafspraak', 'Koffie', 'Lunch', 'Vergadering', 'Bridgen', 'Biljarten',
    'Schilderen', 'Tuinieren', 'Koken', 'Lezen', 'Kaarten', 'Handwerken',
    'Vrijwilligerswerk', 'Oppassen', 'Bezoek', 'Uitje', 'Concert', 'Theater'
  ],

  // Days of the week
  days: [
    'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'
  ]
};

/**
 * Generate a random time in HH:MM format
 * Times are typically between 8:00 and 18:00 for appointments
 * @returns {string} Time string like "9:30" or "14:00"
 */
function generateRandomTime() {
  const hours = Math.floor(Math.random() * 11) + 8; // 8-18
  const minutes = Math.random() < 0.5 ? '00' : '30'; // Half hours only for simplicity
  return `${hours}:${minutes}`;
}

/**
 * Get a random item from an array, excluding specified items
 * @param {Array} array - Array to choose from
 * @param {Array} exclude - Items to exclude
 * @returns {string} Random item
 */
function getRandomItem(array, exclude = []) {
  const available = array.filter(item => !exclude.includes(item));
  if (available.length === 0) {
    return array[Math.floor(Math.random() * array.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get the current content mode (generic or personalized)
 * @returns {string} 'generic' or 'personalized'
 */
function getContentMode() {
  return window.PersonalizationCounter?.getContentMode() || 'generic';
}

/**
 * Generate word pairs with 3 specific types:
 * 1. Name - City
 * 2. Building - Time
 * 3. Activity - Day
 *
 * The numPairs parameter determines how many of EACH type to generate.
 * So numPairs=3 means 3 name-city + 3 building-time + 3 activity-day = 9 total pairs
 *
 * When in personalized mode, uses user's personal data where available,
 * falling back to generic data when personal data is insufficient.
 *
 * @param {number} numPairs - Number of pairs PER TYPE (total = numPairs * 3)
 * @returns {Object} { pairs: Array, contentMode: string }
 */
function generateWordPairs(numPairs) {
  const contentMode = getContentMode();
  const pairs = [];
  const usedNames = [];
  const usedCities = [];
  const usedBuildings = [];
  const usedActivities = [];
  const usedDays = [];

  // Get personalized data if available and in personalized mode
  let personalData = null;
  if (contentMode === 'personalized' && window.PersonalizationService) {
    personalData = {
      familyMembers: window.PersonalizationService.getFamilyMembers() || [],
      weeklyActivities: window.PersonalizationService.getWeeklyActivities() || [],
      regularAppointments: window.PersonalizationService.getRegularAppointments() || []
    };
  }

  // Generate pairs for each type
  for (let i = 0; i < numPairs; i++) {
    // 1. Name - City pair
    let nameCityPair = null;
    if (personalData && personalData.familyMembers.length > i) {
      const member = personalData.familyMembers[i];
      if (member.name && member.city) {
        nameCityPair = {
          id: pairs.length + 1,
          word1: member.name,
          word2: member.city,
          type: 'name-city',
          label: 'Naam - Stad',
          contentMode: 'personalized'
        };
      }
    }

    if (!nameCityPair) {
      // Fall back to generic data
      const name = getRandomItem(PAIR_DATA.names, usedNames);
      usedNames.push(name);
      const city = getRandomItem(PAIR_DATA.cities, usedCities);
      usedCities.push(city);

      nameCityPair = {
        id: pairs.length + 1,
        word1: name,
        word2: city,
        type: 'name-city',
        label: 'Naam - Stad',
        contentMode: 'generic'
      };
    }
    pairs.push(nameCityPair);

    // 2. Building - Time pair
    let buildingTimePair = null;
    if (personalData && personalData.regularAppointments.length > i) {
      const appointment = personalData.regularAppointments[i];
      if (appointment.location && appointment.time) {
        buildingTimePair = {
          id: pairs.length + 1,
          word1: appointment.location,
          word2: appointment.time,
          type: 'building-time',
          label: 'Gebouw - Tijd',
          contentMode: 'personalized'
        };
      }
    }

    if (!buildingTimePair) {
      // Fall back to generic data
      const building = getRandomItem(PAIR_DATA.buildings, usedBuildings);
      usedBuildings.push(building);
      const time = generateRandomTime();

      buildingTimePair = {
        id: pairs.length + 1,
        word1: building,
        word2: time,
        type: 'building-time',
        label: 'Gebouw - Tijd',
        contentMode: 'generic'
      };
    }
    pairs.push(buildingTimePair);

    // 3. Activity - Day pair
    let activityDayPair = null;
    if (personalData && personalData.weeklyActivities.length > i) {
      const weeklyActivity = personalData.weeklyActivities[i];
      if (weeklyActivity.activity && weeklyActivity.day) {
        activityDayPair = {
          id: pairs.length + 1,
          word1: weeklyActivity.activity,
          word2: weeklyActivity.day,
          type: 'activity-day',
          label: 'Activiteit - Dag',
          contentMode: 'personalized'
        };
      }
    }

    if (!activityDayPair) {
      // Fall back to generic data
      const activity = getRandomItem(PAIR_DATA.activities, usedActivities);
      usedActivities.push(activity);
      const day = getRandomItem(PAIR_DATA.days, usedDays);
      usedDays.push(day);

      activityDayPair = {
        id: pairs.length + 1,
        word1: activity,
        word2: day,
        type: 'activity-day',
        label: 'Activiteit - Dag',
        contentMode: 'generic'
      };
    }
    pairs.push(activityDayPair);
  }

  // Shuffle the pairs so they're not always in the same type order
  const shuffledPairs = shuffleArray(pairs);

  // Return both pairs and the overall content mode
  return {
    pairs: shuffledPairs,
    contentMode: contentMode
  };
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.PAIR_DATA = PAIR_DATA;
  window.generateWordPairs = generateWordPairs;
  window.generateRandomTime = generateRandomTime;
}
