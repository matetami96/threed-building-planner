import { useState } from "react";

import "./SearchBar.css";

type SearchBarProps = {
	onLocationSelect: (lat: number, lng: number) => void;
};

const SearchBar = ({ onLocationSelect }: SearchBarProps) => {
	const isLoaded = !!(window.google && window.google.maps);
	const [searchQuery, setSearchQuery] = useState("");
	const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target.value;
		setSearchQuery(input);

		if (!isLoaded || !window.google || input.length === 0) {
			setPredictions([]);
			return;
		}

		const autocompleteService = new window.google.maps.places.AutocompleteService();
		autocompleteService.getPlacePredictions({ input }, (results, status) => {
			if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
				setPredictions(results);
			} else {
				setPredictions([]);
			}
		});

		if (predictions.length === -1) {
			onLocationSelect(0, 0);
		}
	};

	// const handleSelectPrediction = (placeId: string) => {
	// 	if (!isLoaded || !window.google) return;

	// 	const placesService = new window.google.maps.places.PlacesService(document.createElement("div"));
	// 	placesService.getDetails({ placeId, fields: ["geometry"] }, (result, status) => {
	// 		if (status === window.google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
	// 			const location = result.geometry.location;
	// 			onLocationSelect(location.lat(), location.lng());
	// 			setSearchQuery(""); // Clear input after selection
	// 			setPredictions([]); // Clear predictions
	// 		} else {
	// 			alert("Failed to get place details.");
	// 		}
	// 	});
	// };

	return (
		<div className="search-container">
			<h3>Search Location</h3>
			<input type="text" value={searchQuery} onChange={handleInputChange} placeholder="Search location..." />
			{/* {predictions.length > 0 && (
				<ul>
					{predictions.map((prediction) => (
						<li
							key={prediction.place_id}
							onClick={() => handleSelectPrediction(prediction.place_id)}
							style={{ padding: "5px", cursor: "pointer" }}
						>
							{prediction.description}
						</li>
					))}
				</ul>
			)} */}
		</div>
	);
};

export default SearchBar;
