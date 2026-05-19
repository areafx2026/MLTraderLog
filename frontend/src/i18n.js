export const LANG_KEY = 'fxlog:lang';
export const DEFAULT_LANG = 'en';

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  // Add more languages here, e.g.:
  // { id: 'de', label: 'Deutsch' },
  // { id: 'es', label: 'Español' },
];

const en = {
  // Auth screen
  'auth.email': 'E-mail',
  'auth.password': 'Password',
  'auth.password_repeat': 'Repeat password',
  'auth.sign_in': 'Sign in',
  'auth.create_account': 'Create account',
  'auth.tagline.login': 'Welcome back.',
  'auth.tagline.register': 'Start your journal.',
  'auth.no_account': 'No account yet?',
  'auth.sign_up': 'Sign up',
  'auth.already_registered': 'Already registered?',
  'auth.error.invalid_email': 'Please enter a valid email address',
  'auth.error.password_min': 'At least 8 characters required',
  'auth.error.password_mismatch': 'Passwords do not match',
  'auth.error.connection': 'Connection failed',
  // Confirms
  'confirm.delete_trade': 'Delete this trade?',
  // Settings
  'settings.language': 'Language',
  'settings.language.sub': 'Choose the interface language.',
};

// Template for adding a new language — copy this block and translate all values.
// const de = {
//   'auth.email': 'E-Mail',
//   'auth.password': 'Passwort',
//   ...
// };

const TRANSLATIONS = { en };

export function createT(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
  return (key) => dict[key] ?? TRANSLATIONS[DEFAULT_LANG][key] ?? key;
}
