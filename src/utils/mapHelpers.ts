export const getGoogleMapImageUrl = (
	lat: number,
	lng: number,
	zoom: number = 17,
	width: number = 640,
	height: number = 640
) => {
	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
	return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${apiKey}`;
};
