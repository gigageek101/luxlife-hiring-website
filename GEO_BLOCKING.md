# Geo-Blocking Configuration

## Overview

This website implements automatic geo-blocking to restrict access from specific countries. Visitors from blocked regions are automatically redirected to a YouTube video.

## Redirect URL

Blocked visitors are redirected to: **https://www.youtube.com/watch?v=xLhMgCfqays**

## Blocked Countries

### South Asia
- 🇮🇳 India (IN)
- 🇵🇰 Pakistan (PK)
- 🇧🇩 Bangladesh (BD)
- 🇳🇵 Nepal (NP)
- 🇱🇰 Sri Lanka (LK)
- 🇦🇫 Afghanistan (AF)

### Africa
- 🇳🇬 Nigeria (NG)
- 🇬🇭 Ghana (GH)
- 🇰🇪 Kenya (KE)
- 🇺🇬 Uganda (UG)
- 🇹🇿 Tanzania (TZ)
- 🇪🇹 Ethiopia (ET)
- 🇷🇼 Rwanda (RW)
- 🇿🇲 Zambia (ZM)
- 🇿🇼 Zimbabwe (ZW)
- 🇸🇩 Sudan (SD)
- 🇸🇴 Somalia (SO)
- 🇸🇸 South Sudan (SS)
- 🇦🇴 Angola (AO)
- 🇲🇿 Mozambique (MZ)
- 🇨🇲 Cameroon (CM)
- 🇨🇩 DR Congo (CD)
- 🇨🇮 Ivory Coast (CI)
- 🇸🇳 Senegal (SN)
- 🇧🇯 Benin (BJ)
- 🇹🇬 Togo (TG)
- 🇧🇫 Burkina Faso (BF)
- 🇲🇱 Mali (ML)
- 🇳🇪 Niger (NE)
- 🇱🇷 Liberia (LR)
- 🇸🇱 Sierra Leone (SL)

### Middle East / Central Asia
- 🇮🇶 Iraq (IQ)
- 🇮🇷 Iran (IR)
- 🇾🇪 Yemen (YE)
- 🇸🇾 Syria (SY)
- 🇵🇸 Palestine (PS)
- 🇺🇿 Uzbekistan (UZ)
- 🇹🇲 Turkmenistan (TM)
- 🇹🇯 Tajikistan (TJ)
- 🇰🇬 Kyrgyzstan (KG)

## How It Works

### On Vercel (Production)
1. Vercel automatically detects the visitor's country using their IP address
2. The country code is provided via `request.geo.country` or `x-vercel-ip-country` header
3. Middleware checks if the country is in the blocked list
4. If blocked, redirects to YouTube video
5. If not blocked, allows normal access

### On Local Development
- Geo-location headers are not available locally
- All traffic is allowed by default
- To test blocking, uncomment the test line in `middleware.ts`:
  ```typescript
  const country = 'IN'; // Uncomment to test blocking
  ```

## Technical Implementation

The geo-blocking is implemented in `/middleware.ts` using Next.js middleware. This runs before every request reaches your pages, making it very efficient.

### Key Features:
- ✅ Automatic IP-based detection (no external API needed)
- ✅ Runs on Edge (fast worldwide)
- ✅ No database or API calls required
- ✅ Works on all pages and routes
- ✅ Zero configuration needed when deployed on Vercel

## Modifying the Blocked Countries

To add or remove countries, edit `/middleware.ts`:

```typescript
const BLOCKED_COUNTRIES = [
  'IN', // India
  'PK', // Pakistan
  // Add more country codes here...
];
```

Use [ISO 3166-1 alpha-2 country codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) (2-letter codes).

## Changing the Redirect URL

To change where blocked visitors are sent, edit this line in `/middleware.ts`:

```typescript
const REDIRECT_URL = 'https://www.youtube.com/watch?v=xLhMgCfqays';
```

## Testing

### Test in Production
1. Deploy to Vercel
2. Use a VPN to connect from a blocked country
3. Visit your website - you should be redirected

### Test Locally
1. Open `middleware.ts`
2. Uncomment the test line:
   ```typescript
   const country = 'IN'; // Uncomment to test blocking
   ```
3. Run `npm run dev`
4. Visit `http://localhost:3000` - you should be redirected
5. Remember to comment out the test line before deploying!

## Bypassing (For Testing)

If you need to bypass geo-blocking for testing:
1. Temporarily comment out the middleware matcher in `middleware.ts`
2. Or temporarily remove your country code from `BLOCKED_COUNTRIES`
3. **Don't forget to restore it before pushing to production!**

## Important Notes

⚠️ **Privacy**: This feature only uses Vercel's built-in geo-location. No additional tracking or data collection is performed.

⚠️ **VPN Users**: Visitors using VPNs will be detected based on their VPN server location, not their actual location.

⚠️ **Accuracy**: Vercel's geo-location is generally 99%+ accurate at the country level.

## Deployment

No special configuration needed! Just deploy to Vercel as normal:

```bash
git add .
git commit -m "Add geo-blocking"
git push
```

Vercel will automatically enable geo-location detection.

## Support

If you need to modify the geo-blocking logic or have questions, edit `/middleware.ts`.

