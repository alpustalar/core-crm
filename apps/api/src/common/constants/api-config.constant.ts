export const API_CONFIG = {
  PREFIX: 'api',
  VERSION_PREFIX: 'v',
  CURRENT_VERSION: '1',
};

// Yardımcı bir fonksiyon ile tam prefix'i alabilirsin
export const getGlobalPrefix = () =>
  `${API_CONFIG.PREFIX}/${API_CONFIG.VERSION_PREFIX}${API_CONFIG.CURRENT_VERSION}`;
