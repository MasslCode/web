import dotenv from 'dotenv'; 
import { cache } from 'react';

dotenv.config();
const TIDAL_TOKEN_URL = 'https://auth.tidal.com/v1/oauth2/token';

const TIDAL_CLIENT_ID = process.env.TIDAL_CLIENT_ID;
const TIDAL_CLIENT_SECRET = process.env.TIDAL_CLIENT_SECRET;

const EXPIRY_BUFFER_SECONDS = 60;

let cachedToken = {
    accessToken: null,
    expiresAt: 0,
}

let pendingTokenRequest = null;

async function fetchNewTidalToken() {
    const credentials = Buffer.from(`${TIDAL_CLIENT_ID}:${TIDAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(TIDAL_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',                
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
        }),
    });
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Tidal token request failed — HTTP ${response.status}: ${errorData}`);
    }

    const { access_token, expires_in } = await response.json();

    cachedToken = {
        accessToken: access_token,
        expiresAt: Date.now() + (expires_in - EXPIRY_BUFFER_SECONDS) * 1000,
    };

    console.log(
    `[TidalAuth] New token acquired. Valid for ~${expires_in}s ` +
    `(refreshes in ~${expires_in - EXPIRY_BUFFER_SECONDS}s).`
  );

  return cachedToken.accessToken;
}

export async function getTidalToken() {
    const isValid = cachedToken.accessToken && Date.now() < cachedToken.expiresAt;
    if (isValid) return cachedToken.accessToken;

    if (pendingTokenRequest) return pendingTokenRequest;

    pendingTokenRequest = fetchNewTidalToken().finally(() => {
        pendingTokenRequest = null;
    });

    return pendingTokenRequest;
}

export async function tidalFetch(url, options ={}) {
    const token = await getTidalToken();
    const authOptions = {
        ...options,
        headers: {
            'accept': 'application/vnd.tidal.v1+json',
            'Content-Type': 'application/vnd.tidal.v1+json',
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        },
    };

    const response = await fetch(url, authOptions);
    if (response.status === 401) {
        console.warn('[TidalAuth] Received 401. Invalidating token and retrying...');
        cachedToken = {
            accessToken: null,
            expiresAt: 0,
        };
        const freshToken = await getTidalToken();
        authOptions.headers['Authorization'] = `Bearer ${freshToken}`;
        return fetch(url, authOptions);
    }
    return response;
}

export function startTokenRefreshDaemon(checkIntervalMs = 60_000) {
    console.log('[TidalAuth] Starting token refresh daemon...');
    return setInterval(async () => {
        const timeToExpiry = cachedToken.expiresAt - Date.now();
        const shouldRefresh = !cachedToken.accessToken || timeToExpiry < checkIntervalMs * 2;

        if (shouldRefresh) {
            try {
                await getTidalToken();
            } catch (error) {
                console.error('[TidalAuth] Background token refresh failed:', error.message);
            }
        }
    }, checkIntervalMs);
}