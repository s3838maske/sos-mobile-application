/**
 * Geocoding Utility
 * Converts coordinates to human-readable addresses using OpenStreetMap Nominatim API
 */

/**
 * Convert latitude and longitude to a human-readable address
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise<string> - Human-readable address or coordinates as fallback
 */
export const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
): Promise<string> => {
    const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'SOS-Safety-App/1.0'
                },
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
                return data.display_name;
            }
        }

        // If response not ok, return fallback
        console.warn('Geocoding API returned non-OK response, using coordinates');
        return fallbackAddress;
    } catch (error: any) {
        console.warn('Geocoding failed, using coordinates:', error.message);
        return fallbackAddress;
    }
};

/**
 * Get a short address (city, state, country) from coordinates
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise<string> - Short address or coordinates as fallback
 */
export const getShortAddress = async (
    latitude: number,
    longitude: number
): Promise<string> => {
    const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'SOS-Safety-App/1.0'
                },
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.address) {
                const { city, state, country } = data.address;
                const parts = [city, state, country].filter(Boolean);
                if (parts.length > 0) {
                    return parts.join(', ');
                }
            }
            if (data.display_name) {
                return data.display_name;
            }
        }

        return fallbackAddress;
    } catch (error: any) {
        console.warn('Short address geocoding failed:', error.message);
        return fallbackAddress;
    }
};
