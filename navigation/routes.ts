export const ROUTES = {
  // Auth Routes
  LOGIN: 'auth/login',
  SIGNUP: 'auth/signup',
  
  // Main Routes
  HOME: 'home',
  EMERGENCY: 'emergency',
  PROFILE: 'profile',
  TRACKING: 'tracking',
  ADMIN: 'admin',
  
  // Emergency Routes
  FAKE_CALL: 'emergency/fakeCall',
  CALL_HELPLINE: 'emergency/callHelpline',
} as const;

export type RouteNames = typeof ROUTES[keyof typeof ROUTES];
