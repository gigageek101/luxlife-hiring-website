import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Blocked countries - visitors from these countries will be redirected
const BLOCKED_COUNTRIES = [
  // South Asia
  'IN', // India
  'PK', // Pakistan
  'BD', // Bangladesh
  'NP', // Nepal
  'LK', // Sri Lanka
  'AF', // Afghanistan
  
  // Africa
  'NG', // Nigeria
  'GH', // Ghana
  'KE', // Kenya
  'UG', // Uganda
  'TZ', // Tanzania
  'ET', // Ethiopia
  'RW', // Rwanda
  'ZM', // Zambia
  'ZW', // Zimbabwe
  'SD', // Sudan
  'SO', // Somalia
  'SS', // South Sudan
  'AO', // Angola
  'MZ', // Mozambique
  'CM', // Cameroon
  'CD', // DR Congo
  'CI', // Ivory Coast
  'SN', // Senegal
  'BJ', // Benin
  'TG', // Togo
  'BF', // Burkina Faso
  'ML', // Mali
  'NE', // Niger
  'LR', // Liberia
  'SL', // Sierra Leone
  'ZA', // South Africa
  'EG', // Egypt
  'MA', // Morocco
  'DZ', // Algeria
  'TN', // Tunisia
  'LY', // Libya
  
  // Middle East / Central Asia
  'IQ', // Iraq
  'IR', // Iran
  'YE', // Yemen
  'SY', // Syria
  'PS', // Palestine
  'UZ', // Uzbekistan
  'TM', // Turkmenistan
  'TJ', // Tajikistan
  'KG', // Kyrgyzstan
];

// YouTube redirect URL
const REDIRECT_URL = 'https://www.youtube.com/watch?v=xLhMgCfqays';

export function middleware(request: NextRequest) {
  // Get country code from Vercel's geo-location headers
  // Vercel automatically provides this header when deployed
  const country = request.geo?.country || request.headers.get('x-vercel-ip-country');
  
  // For local development testing, you can uncomment this and set a test country:
  // const country = 'IN'; // Uncomment to test blocking
  
  // Check if the visitor is from a blocked country
  if (country && BLOCKED_COUNTRIES.includes(country)) {
    // Redirect to YouTube video
    return NextResponse.redirect(REDIRECT_URL);
  }
  
  // Allow access for all other countries
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes that need to be accessible (optional)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

