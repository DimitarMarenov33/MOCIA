/**
 * SHARED CONSTANTS
 * Global configuration values used across all exercises
 */

const CONSTANTS = {
  // Application metadata
  APP_VERSION: '1.0.0',
  APP_NAME: 'MOCIA Cognitive Training',

  // Storage keys
  STORAGE_KEYS: {
    USER_DATA: 'mocia_user_data',
    APP_SETTINGS: 'mocia_settings',
    SESSION_DATA: 'mocia_session_',
  },

  // Cognitive domains
  COGNITIVE_DOMAINS: {
    WORKING_MEMORY: 'working_memory',
    PROCESSING_SPEED: 'processing_speed',
    ATTENTION: 'attention',
    EXECUTIVE_FUNCTION: 'executive_function',
    EPISODIC_MEMORY: 'episodic_memory',
  },

  // Exercise types
  EXERCISE_TYPES: {
    // Working Memory
    DIGIT_SPAN: 'digit_span',
    DUAL_N_BACK: 'dual_n_back',

    // Processing Speed
    UFOV_BASIC: 'ufov_basic',
    UFOV_COMPLEX: 'ufov_complex',

    // Attention
    VISUAL_SEARCH: 'visual_search',
    COMPLEX_DUAL_TASK: 'complex_dual_task',

    // Executive Function
    STROOP: 'stroop',
    TASK_SWITCHING: 'task_switching',

    // Episodic Memory
    WORD_PAIR: 'word_pair',
  },

  // Exercise difficulty levels
  DIFFICULTY: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
  },

  // Performance thresholds for adaptive difficulty
  PERFORMANCE: {
    EXCELLENT: 0.90,      // 90% accuracy or higher
    GOOD: 0.75,           // 75-90% accuracy
    NEEDS_IMPROVEMENT: 0.60, // 60-75% accuracy
    POOR: 0.60,           // Below 60% accuracy

    // Target performance range
    TARGET_MIN: 0.75,
    TARGET_MAX: 0.85,
  },

  // Adaptive difficulty parameters
  ADAPTIVE: {
    CONSECUTIVE_CORRECT_TO_INCREASE: 2,  // Correct answers needed to increase difficulty
    CONSECUTIVE_INCORRECT_TO_DECREASE: 2, // Incorrect answers needed to decrease difficulty
  },

  // Timing constants (in milliseconds)
  TIMING: {
    COUNTDOWN_INTERVAL: 1000,   // 1 second between countdown numbers
    FEEDBACK_DISPLAY: 2000,     // 2 seconds to show feedback
    READY_DELAY: 1000,          // 1 second "Ready" message
    INTER_TRIAL_INTERVAL: 500,  // 0.5 seconds between trials
    STIMULUS_DEFAULT: 1000,     // 1 second default stimulus display
  },

  // Audio settings
  AUDIO: {
    SPEECH_RATE: 0.9,           // Slightly slower speech for seniors
    SPEECH_PITCH: 1.0,          // Normal pitch
    SPEECH_VOLUME: 1.0,         // Full volume
    ENABLED_BY_DEFAULT: true,
  },

  // Session configuration
  SESSION: {
    DEFAULT_TRIAL_COUNT: 10,
    MIN_TRIAL_COUNT: 5,
    MAX_TRIAL_COUNT: 30,
  },

  // Digit Span specific
  DIGIT_SPAN: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 9,
    START_LENGTH: 2,
    DIGIT_DISPLAY_TIME: 1000,     // 1 second per digit
    INTER_DIGIT_INTERVAL: 800,     // 800ms between digits
    DEFAULT_TRIALS: 10,
  },

  // Dual N-Back specific
  DUAL_N_BACK: {
    MIN_N: 2,
    MAX_N: 5,
    START_N: 2,
    TRIALS_PER_BLOCK: 25,
    BLOCKS_PER_SESSION: 15,
    STIMULUS_DURATION: 500,        // 500ms stimulus display
    INTER_STIMULUS_INTERVAL: 2000, // 2 seconds between stimuli
    GRID_SIZE: 3,                  // 3x3 grid
    LETTERS: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  },

  // UFOV specific
  UFOV: {
    BASIC: {
      START_DURATION: 500,        // 500ms starting duration
      MIN_DURATION: 100,          // 100ms minimum
      MAX_DURATION: 500,          // 500ms maximum
      STEP_SIZE: 50,              // 50ms adjustment steps
      NUM_DISTRACTORS: 4,
    },
    COMPLEX: {
      START_DURATION: 100,        // 100ms starting duration
      MIN_DURATION: 16,           // 16ms minimum (1 frame at 60fps)
      MAX_DURATION: 500,          // 500ms maximum
      STEP_SIZE: 50,              // 50ms adjustment steps
      NUM_DISTRACTORS: 12,
    },
    FIXATION_TIME: 1000,          // 1 second fixation cross
    DEFAULT_TRIALS: 15,
    TARGETS: ['car', 'truck'],
    PERIPHERAL_POSITIONS: 8,       // Number of positions around perimeter
  },

  // Feedback messages
  MESSAGES: {
    CORRECT: [
      'Correct!',
      'Well done!',
      'Excellent!',
      'Great job!',
      'Perfect!',
    ],
    INCORRECT: [
      'Not quite',
      'Keep trying!',
      'Almost there!',
      'Try again!',
    ],
    ENCOURAGEMENT: [
      'You\'re doing great!',
      'Keep up the good work!',
      'Nice effort!',
      'You\'re improving!',
    ],
  },

  // Icons (emoji representations - can be replaced with SVG)
  ICONS: {
    SUCCESS: '✓',
    ERROR: '✗',
    INFO: 'ℹ',
    WARNING: '⚠',
    STAR: '★',
    ARROW_UP: '↑',
    ARROW_DOWN: '↓',
    ARROW_RIGHT: '→',
  },

  // Accessibility
  ACCESSIBILITY: {
    MIN_CONTRAST_RATIO: 7,        // WCAG AAA
    MIN_TOUCH_TARGET: 48,         // 48px minimum
    FOCUS_OUTLINE_WIDTH: 3,       // 3px focus outline
  },

  // Data retention
  DATA: {
    MAX_SESSIONS_STORED: 100,     // Maximum sessions per exercise
    MAX_STORAGE_SIZE: 5242880,    // 5MB in bytes
  },
};

// Make constants immutable
Object.freeze(CONSTANTS);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONSTANTS;
}
