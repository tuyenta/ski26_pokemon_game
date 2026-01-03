/**
 * Translation system for internationalization
 */

export const TRANSLATIONS = {
  en: {
    'title': 'POKÉDEX SCANNER',
    'subtitle': 'Face Scanner for Kids - 1025 Pokemon',
    'loading': 'Preparing data...',
    'start_btn': 'START GAME',
    'ready': 'Ready!',
    'choose_age': 'Choose Age:',
    'age_4_6': '🐣 Ages 4-6',
    'age_7_10': '⚡ Ages 7-10',
    'age_mixed': '🌈 Mixed Play',
    'ready_scan': 'READY TO SCAN',
    'scanning': 'SCANNING...',
    'get_ready': 'GET READY:',
    'pokemon_found': 'POKEMON FOUND!',
    'no_face': 'No face detected!',
    'ability': 'ABILITY',
    'physical': 'PHYSICAL',
    'height': 'Height:',
    'weight': 'Weight:',
    'stats': 'STATS',
    'scan_again': 'SCAN AGAIN',
    'mask_mode': 'MASK MODE',
    'mask_on': 'ON',
    'mask_off': 'OFF',
    'face_detection_loading': 'Loading face detection models...',
    'camera_permission': 'Please allow camera access!',
    'network_error': 'Network error, please try again!',
    'view_collection': '📖 VIEW COLLECTION',
    'my_collection': 'MY POKÉDEX COLLECTION',
    'new_pokemon': '✨ NEW POKEMON!',
    'already_caught': 'Already in collection',
    'first_catch': 'First Catch',
    'novice_trainer': 'Novice Trainer',
    'expert_trainer': 'Expert Trainer',
    'master_trainer': 'Master Trainer',
    'type_master': 'Type Master',
    'multi_face': 'Multi-Face Scanner',
    'speed_scanner': 'Speed Scanner',
    'streak_master': 'Streak Master'
  }
};

export class LanguageManager {
  private currentLang: string;
  private translations: typeof TRANSLATIONS;

  constructor() {
    this.currentLang = 'en';
    this.translations = TRANSLATIONS;
  }

  t(key: string, params: Record<string, any> = {}): string {
    let text = (this.translations[this.currentLang as keyof typeof TRANSLATIONS] as any)[key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  }

  setLanguage(lang: string): void {
    if (!this.translations[lang as keyof typeof TRANSLATIONS]) return;
    this.currentLang = lang;
    localStorage.setItem('pokemon_language', lang);
    this.updateAllText();
  }

  updateAllText(): void {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const text = this.t(key);
      if (el.tagName === 'A-TEXT') {
        el.setAttribute('value', text);
      } else {
        (el as HTMLElement).textContent = text;
      }
    });
  }
}
