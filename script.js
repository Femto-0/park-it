document.addEventListener("DOMContentLoaded", () => {
    const totalSpaces = 120; // Set the total number of spaces here

    // Set the initial values for total spaces and image
    document.getElementById("totalSpaces").textContent = totalSpaces;
    document.getElementById("lotImage").src = "captured_frame_1.jpg";
    document.getElementById("availableSpace").textContent = totalSpaces;

    // Function to read the JSON file and update parking data
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
                const newImagePath = `captured_frame_${pictureCount}.jpg`;

                // Update number of parked cars
                document.getElementById("carsParked").textContent = numberOfCars;

                // Update number of available spaces
                document.getElementById("availableSpace").textContent = spotsAvailable;

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
