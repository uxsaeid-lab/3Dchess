export interface BoardTheme {
  id: string;
  name: string;
  description: string;
  isCathedral?: boolean;

  // Board squares
  lightSquare: string;
  darkSquare: string;
  lightSquareRoughness: number;
  lightSquareMetalness: number;
  darkSquareRoughness: number;
  darkSquareMetalness: number;

  // Pieces
  lightPiece: string;
  lightPieceSpecular: string;
  lightPieceRoughness: number;
  lightPieceMetalness: number;
  lightPieceClearcoat: number;

  darkPiece: string;
  darkPieceSpecular: string;
  darkPieceRoughness: number;
  darkPieceMetalness: number;
  darkPieceClearcoat: number;

  // Frame and accents
  boardFrame: string;
  boardBevel: string;
  boardTrim: string;
  tableColor: string;
  accentColor: string;
  legalMoveColor: string;
  captureMoveColor: string;
  selectedColor: string;
  checkColor: string;

  // Lighting environment
  envPreset: 'studio' | 'city' | 'night' | 'sunset' | 'dawn' | 'apartment';
  ambientIntensity: number;
  keyLightIntensity: number;
  rimLightIntensity: number;
  keyLightColor: string;
  rimLightColor: string;
}

export const BOARD_THEMES: Record<string, BoardTheme> = {
  wizards_sanctuary: {
    id: 'wizards_sanctuary',
    name: "Wizard's Sanctuary",
    description: "Cathedral sanctuary with procedural veined marble, volcanic obsidian, high clearcoat reflections, and brazier flames.",
    isCathedral: true,

    lightSquare: '#f1f5f9',
    darkSquare: '#0f172a',
    lightSquareRoughness: 0.16,
    lightSquareMetalness: 0.1,
    darkSquareRoughness: 0.18,
    darkSquareMetalness: 0.35,

    lightPiece: '#f8fafc',
    lightPieceSpecular: '#ffffff',
    lightPieceRoughness: 0.15,
    lightPieceMetalness: 0.12,
    lightPieceClearcoat: 0.92,

    darkPiece: '#0c1017',
    darkPieceSpecular: '#38bdf8',
    darkPieceRoughness: 0.15,
    darkPieceMetalness: 0.65,
    darkPieceClearcoat: 0.95,

    boardFrame: '#080c14',
    boardBevel: '#131b2c',
    boardTrim: '#f59e0b',
    tableColor: '#05070c',
    accentColor: '#f59e0b',
    legalMoveColor: '#38bdf8',
    captureMoveColor: '#ef4444',
    selectedColor: '#fbbf24',
    checkColor: '#f43f5e',

    envPreset: 'night',
    ambientIntensity: 0.42,
    keyLightIntensity: 2.2,
    rimLightIntensity: 1.5,
    keyLightColor: '#93c5fd',
    rimLightColor: '#f59e0b',
  },

  obsidian_gold: {
    id: 'obsidian_gold',
    name: 'Obsidian & Gold',
    description: 'Deep onyx charcoal board with brushed 24k gold accents and rich contrasts.',
    isCathedral: false,

    lightSquare: '#2a303c',
    darkSquare: '#12151c',
    lightSquareRoughness: 0.28,
    lightSquareMetalness: 0.15,
    darkSquareRoughness: 0.35,
    darkSquareMetalness: 0.2,

    lightPiece: '#f59e0b',
    lightPieceSpecular: '#fde68a',
    lightPieceRoughness: 0.22,
    lightPieceMetalness: 0.85,
    lightPieceClearcoat: 0.7,

    darkPiece: '#1e222d',
    darkPieceSpecular: '#475569',
    darkPieceRoughness: 0.25,
    darkPieceMetalness: 0.65,
    darkPieceClearcoat: 0.8,

    boardFrame: '#0d1117',
    boardBevel: '#1b2230',
    boardTrim: '#d97706',
    tableColor: '#07090e',
    accentColor: '#f59e0b',
    legalMoveColor: '#38bdf8',
    captureMoveColor: '#ef4444',
    selectedColor: '#fbbf24',
    checkColor: '#f43f5e',

    envPreset: 'studio',
    ambientIntensity: 0.45,
    keyLightIntensity: 1.8,
    rimLightIntensity: 1.2,
    keyLightColor: '#fffbeb',
    rimLightColor: '#38bdf8',
  },

  midnight_studio: {
    id: 'midnight_studio',
    name: 'Midnight Studio',
    description: 'Sleek matte titanium and satin pearl pieces in a minimalist Apple-style studio.',
    isCathedral: false,

    lightSquare: '#e2e8f0',
    darkSquare: '#334155',
    lightSquareRoughness: 0.4,
    lightSquareMetalness: 0.05,
    darkSquareRoughness: 0.45,
    darkSquareMetalness: 0.05,

    lightPiece: '#f8fafc',
    lightPieceSpecular: '#ffffff',
    lightPieceRoughness: 0.25,
    lightPieceMetalness: 0.15,
    lightPieceClearcoat: 0.5,

    darkPiece: '#181e29',
    darkPieceSpecular: '#64748b',
    darkPieceRoughness: 0.3,
    darkPieceMetalness: 0.3,
    darkPieceClearcoat: 0.4,

    boardFrame: '#0f172a',
    boardBevel: '#1e293b',
    boardTrim: '#38bdf8',
    tableColor: '#090d16',
    accentColor: '#38bdf8',
    legalMoveColor: '#10b981',
    captureMoveColor: '#f43f5e',
    selectedColor: '#0ea5e9',
    checkColor: '#ef4444',

    envPreset: 'city',
    ambientIntensity: 0.55,
    keyLightIntensity: 1.9,
    rimLightIntensity: 1.4,
    keyLightColor: '#f8fafc',
    rimLightColor: '#60a5fa',
  },

  classic_wood: {
    id: 'classic_wood',
    name: 'Grandmaster Wood',
    description: 'Traditional handcrafted polished maple and rich walnut tournament aesthetics.',
    isCathedral: false,

    lightSquare: '#f3d9b1',
    darkSquare: '#8b5a2b',
    lightSquareRoughness: 0.45,
    lightSquareMetalness: 0.02,
    darkSquareRoughness: 0.5,
    darkSquareMetalness: 0.02,

    lightPiece: '#faeed6',
    lightPieceSpecular: '#ffffff',
    lightPieceRoughness: 0.35,
    lightPieceMetalness: 0.05,
    lightPieceClearcoat: 0.4,

    darkPiece: '#3e2723',
    darkPieceSpecular: '#8d6e63',
    darkPieceRoughness: 0.38,
    darkPieceMetalness: 0.05,
    darkPieceClearcoat: 0.4,

    boardFrame: '#24140e',
    boardBevel: '#4e2a14',
    boardTrim: '#d4af37',
    tableColor: '#120a06',
    accentColor: '#d97706',
    legalMoveColor: '#22c55e',
    captureMoveColor: '#dc2626',
    selectedColor: '#eab308',
    checkColor: '#e11d48',

    envPreset: 'sunset',
    ambientIntensity: 0.5,
    keyLightIntensity: 1.7,
    rimLightIntensity: 0.9,
    keyLightColor: '#fff7ed',
    rimLightColor: '#fdba74',
  },

  cyber_neon: {
    id: 'cyber_neon',
    name: 'Cyberpunk Neon',
    description: 'Sci-fi holographic board with emissive cyan and electric magenta accents.',
    isCathedral: false,

    lightSquare: '#162032',
    darkSquare: '#080d1a',
    lightSquareRoughness: 0.15,
    lightSquareMetalness: 0.8,
    darkSquareRoughness: 0.2,
    darkSquareMetalness: 0.9,

    lightPiece: '#06b6d4',
    lightPieceSpecular: '#67e8f9',
    lightPieceRoughness: 0.18,
    lightPieceMetalness: 0.75,
    lightPieceClearcoat: 0.9,

    darkPiece: '#d946ef',
    darkPieceSpecular: '#f0abfc',
    darkPieceRoughness: 0.18,
    darkPieceMetalness: 0.75,
    darkPieceClearcoat: 0.9,

    boardFrame: '#030712',
    boardBevel: '#0f172a',
    boardTrim: '#06b6d4',
    tableColor: '#02040a',
    accentColor: '#06b6d4',
    legalMoveColor: '#22d3ee',
    captureMoveColor: '#f43f5e',
    selectedColor: '#a855f7',
    checkColor: '#ff0055',

    envPreset: 'night',
    ambientIntensity: 0.4,
    keyLightIntensity: 2.0,
    rimLightIntensity: 1.8,
    keyLightColor: '#a5f3fc',
    rimLightColor: '#f472b6',
  },
};
