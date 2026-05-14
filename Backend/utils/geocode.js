const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "SmartQueue/1.0 (smartqueue-allinoneadmin4002@gmail.com)";

// A robust geocoding function that tries multiple strategies to get lat/lng from address components
const safeFetch = async (url) => {
    const response = await fetch(url, {
        headers: {
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Accept-Language": "en",
        },
    });

    // Always read as text first — never assume JSON
    const rawText = await response.text();

    // If we get a non-200 response, log the body for debugging (often contains HTML from firewall blocks)
    if (!response.ok) {
        console.warn(`[geocode] HTTP ${response.status} from Nominatim. Body: "${rawText.slice(0, 200)}"`);
        return null;
    }

    // Nominatim sometimes returns 200 with an HTML block (firewall block page) instead of JSON — detect and handle that
    const trimmed = rawText.trim();

    // If body doesn't start with [ or { it's not JSON — likely a firewall block page
    if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
        console.warn(
            `[geocode] Nominatim returned non-JSON (likely blocked by hosting firewall).\n` +
            `Raw body: "${trimmed.slice(0, 300)}"\n` +
            `FIX: whitelist outbound HTTPS to nominatim.openstreetmap.org in your hosting/VPS panel.`
        );
        return null;
    }

    try {
        return JSON.parse(rawText);
    } catch (e) {
        console.warn(`[geocode] JSON parse error. Raw: "${rawText.slice(0, 200)}"`);
        return null;
    }
};

// Main geocoding function with multiple fallback strategies
export const geocodeAddress = async ({ address, area, city, state, pincode, country = "India" }) => {
    try {
        // Attempt 1: full structured query
        const p1 = new URLSearchParams({
            street: [address, area].filter(Boolean).join(", "),
            city, state,
            postalcode: pincode,
            country,
            format: "json",
            limit: 1,
        });

        console.log(`[geocode] Attempt 1 — full address`);
        
        // Try the first attempt
        const d1 = await safeFetch(`${NOMINATIM_URL}?${p1}`);
        
        // If we got a valid response with at least one result, return the lat/lng
        if (d1?.length > 0) {
            const r = { lat: parseFloat(d1[0].lat), lng: parseFloat(d1[0].lon) };
            console.log(`[geocode] ✓ Attempt 1 success:`, r);
            return r;
        }

        // Attempt 2: city + state + pincode only
        const p2 = new URLSearchParams({ city, state, postalcode: pincode, country, format: "json", limit: 1 });
        console.log(`[geocode] Attempt 2 — city+state+pincode`);
        
        const d2 = await safeFetch(`${NOMINATIM_URL}?${p2}`);
        
        // If we got a valid response with at least one result, return the lat/lng
        if (d2?.length > 0) {
            const r = { lat: parseFloat(d2[0].lat), lng: parseFloat(d2[0].lon) };
            console.log(`[geocode] ✓ Attempt 2 success:`, r);
            return r;
        }

        // Attempt 3: free-form city+state+country
        const p3 = new URLSearchParams({ q: `${city}, ${state}, ${country}`, format: "json", limit: 1 });
        console.log(`[geocode] Attempt 3 — city+state free-form`);
        
        // Try the third attempt
        const d3 = await safeFetch(`${NOMINATIM_URL}?${p3}`);
        
        // If we got a valid response with at least one result, return the lat/lng
        if (d3?.length > 0) {
            const r = { lat: parseFloat(d3[0].lat), lng: parseFloat(d3[0].lon) };
            console.log(`[geocode] ✓ Attempt 3 success:`, r);
            return r;
        }

        console.warn(`[geocode] All attempts failed for: { city: "${city}", state: "${state}", pincode: "${pincode}" }`);
        return { lat: null, lng: null };

    } catch (error) {
        // ENOTFOUND / ECONNREFUSED = server cannot reach Nominatim at all (firewall)
        console.error(
            `[geocode] Network error: ${error.message}\n` +
            `If this is ENOTFOUND or ECONNREFUSED your server cannot reach external URLs.\n` +
            `Check your hosting firewall and whitelist nominatim.openstreetmap.org outbound.`
        );
        return { lat: null, lng: null };
    }
};