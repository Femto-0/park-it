document.addEventListener("DOMContentLoaded", () => {
    const totalSpaces = 120; 
    document.getElementById("totalSpaces").textContent = totalSpaces;
    
    document.getElementById("lotImage").src = "captured_frame_1.jpg";

    document.getElementById("availableSpace").textContent = totalSpaces;
});

// Function to dynamically update the total number of cars in the lot and image
document.addEventListener("DOMContentLoaded", () => {
    const totalSpaces = 120; 
    document.getElementById("totalSpaces").textContent = totalSpaces;

    // Function to read the JSON file
    const updateParkingData = () => {
        fetch("record.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const numberOfCars = data.number_of_cars;
                const pictureCount = data.picture_count;
                const spotsAvailable = totalSpaces - numberOfCars;

                // Update number of parked cars
                document.getElementById("carsParked").textContent = numberOfCars;

                document.getElementById("availableSpace").textContent = spotsAvailable;

                // Construct the new image path
                const newImagePath = `captured_frame_${pictureCount}.jpg`;

                // Update the image source dynamically
                document.getElementById("lotImage").src = newImagePath;
            })
            .catch(error => {
                console.error("Error fetching the JSON file:", error);
                document.getElementById("carsParked").textContent = "Error loading data";
                document.getElementById("availableSpace").textContent = "Error loading data";
            });
    };

    // Initial fetch on page load
    updateParkingData();

    // Refresh interval (5 seconds for now)
    setInterval(updateParkingData, 5000);
});
