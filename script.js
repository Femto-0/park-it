// References to DOM elements
const sortSelect = document.getElementById("sort-select");
const sortOptions = document.getElementById("sort-options");
const filterSelect = document.getElementById("filter-select");
const filterOptions = document.getElementById("filter-options");
const listContainer = document.querySelector(".list-container");
const lotLayout = document.querySelector(".lotLayout");
const resetSortButton = document.getElementById("reset-sort");
const resetFilterButton = document.getElementById("reset-filter");

// Function to fetch and return the number of cars for Test Lot
async function fetchCarCount() {
    try {
        const response = await fetch('park-it-master/record.json'); // Modify file path to match with how project is set up
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.number_of_cars || 'No data';
    } catch (error) {
        console.error('Error fetching car count:', error);
        return 'Error loading data';
    }
}

// Function to dynamically update the car count for Test Lot in lotLayout
async function updateCarCount() {
    const name = document.querySelector('.lotLayout h2')?.textContent;
    if (name === "Test Lot") { // Only update if Test Lot is selected
        const carCount = await fetchCarCount();
        lotLayout.innerHTML = `
            <h2>Test Lot</h2>
            <p>This is the Test Lot</p>
            <p>Availability: empty</p>
            <p>Type: test</p>
            <p>Number of Cars: ${carCount}</p>
        `;
    }
}

// Function to populate the initial list of parking lots
function populateInitialList() {
    const initialLots = [
        { name: "Gold Main Lot", description: "This is the Gold Main Lot", availability: "empty", type: "gold" },
        { name: "Gold Library Lot", description: "This is the Gold Library Lot", availability: "partially-full", type: "gold" },
        { name: "Silver Winona Street Lot", description: "This is the Silver Winona Street Lot", availability: "full", type: "silver" },
        { name: "Purple Belleview Lots", description: "This is the Purple Belleview Lots", availability: "partially-full", type: "purple" },
        { name: "Test Lot", description: "This is the Test Lot", availability: "empty", type: "test" } // Test Lot with dynamic car count
    ];

    listContainer.innerHTML = ""; // Clear existing items

    initialLots.forEach(lot => {
        const li = document.createElement('li');
        li.setAttribute('data-name', lot.name);
        li.setAttribute('data-description', lot.description);
        li.setAttribute('data-availability', lot.availability);
        li.setAttribute('data-type', lot.type);
        li.textContent = lot.name;

        // Assign color class based on availability
        if (lot.availability === "empty") {
            li.classList.add("empty");
        } else if (lot.availability === "partially-full") {
            li.classList.add("partially-full");
        } else if (lot.availability === "full") {
            li.classList.add("full");
        }

        // Add event listener to each lot item to display layout information
        li.addEventListener('click', async () => {
            const name = li.getAttribute('data-name');
            const description = li.getAttribute('data-description');
            const availability = li.getAttribute('data-availability');
            const type = li.getAttribute('data-type');
            
            // If Test Lot is selected, fetch and display car count
            if (name === "Test Lot") {
                const carCount = await fetchCarCount();
                displayLotLayout(name, description, availability, type, carCount);
            } else {
                displayLotLayout(name, description, availability, type);
            }
        });

        listContainer.appendChild(li);
    });
}

// Function to display layout information based on the selected lot
function displayLotLayout(name, description, availability, type, carCount = null) {
    lotLayout.innerHTML = `
        <h2>${name}</h2>
        <p>${description}</p>
        <p>Availability: ${availability}</p>
        <p>Type: ${type}</p>
        ${carCount !== null ? `<p>Number of Cars: ${carCount}</p>` : ""}
    `;
}

// Sorting logic
function sortTasks(method) {
    const lots = Array.from(listContainer.children);
    const availabilityOrder = {
        "empty": 0,
        "partially-full": 1,
        "full": 2,
    };

    const sortedLots = lots.sort((a, b) => {
        const availabilityA = a.getAttribute('data-availability');
        const availabilityB = b.getAttribute('data-availability');

        if (method === "space") {
            return (availabilityA === "empty" || availabilityA === "partially-full") ? -1 : 1;
        } else if (availabilityA === method && availabilityB !== method) {
            return -1;
        } else if (availabilityA !== method && availabilityB === method) {
            return 1;
        } else {
            return availabilityOrder[availabilityA] - availabilityOrder[availabilityB];
        }
    });

    listContainer.innerHTML = ""; // Clear current list
    sortedLots.forEach(lot => listContainer.appendChild(lot));
}

// Filtering logic
function filterTasks(method) {
    const lots = listContainer.querySelectorAll('li');
    lots.forEach(lot => {
        const type = lot.getAttribute('data-type');
        lot.style.display = (method === "all" || type === method) ? 'block' : 'none'; 
    });
}


// Function to toggle dropdown visibility
function toggleDropdown(options) {
    closeDropdowns();
    options.classList.toggle("show");
}

// Function to close dropdowns
function closeDropdowns() {
    sortOptions.classList.remove("show");
    filterOptions.classList.remove("show");
}

// Event listeners for sort and filter options
sortSelect.addEventListener("click", (e) => {
    e.stopPropagation(); 
    toggleDropdown(sortOptions);
});

sortOptions.addEventListener("click", (e) => {
    if (e.target.tagName === "DIV" && e.target.dataset.value) {
        sortSelect.textContent = e.target.textContent; // Set selected option
        resetSortButton.style.display = "inline"; // Show clear button
        sortOptions.classList.remove("show"); 
        const method = e.target.dataset.value;
        sortTasks(method); // Call sorting function
    }
});

filterSelect.addEventListener("click", (e) => {
    e.stopPropagation(); 
    toggleDropdown(filterOptions);
});

filterOptions.addEventListener("click", (e) => {
    if (e.target.tagName === "DIV" && e.target.dataset.value) {
        filterSelect.textContent = e.target.textContent; // Set selected option
        resetFilterButton.style.display = "inline"; // Show clear button
        filterOptions.classList.remove("show");
        const method = e.target.dataset.value;
        filterTasks(method); // Call filtering function
    }
});

// Clear button logic for sort and filter
resetSortButton.addEventListener("click", (e) => {
    e.stopPropagation(); 
    sortSelect.textContent = "Select sorting method"; 
    resetSortButton.style.display = "none"; 
    populateInitialList();
});

resetFilterButton.addEventListener("click", (e) => {
    e.stopPropagation(); 
    filterSelect.textContent = "Select filter method"; 
    resetFilterButton.style.display = "none";
    filterTasks(""); // Reset all filters
});

// Add a global click event listener to close dropdowns when clicking outside
document.addEventListener("click", (e) => {
    const target = e.target;
    if (!sortOptions.contains(target) && !sortSelect.contains(target)) {
        sortOptions.classList.remove("show");
    }
    if (!filterOptions.contains(target) && !filterSelect.contains(target)) {
        filterOptions.classList.remove("show");
    }
});

// Initialize the list on page load
populateInitialList();
updateCarCount(); // Initial load of car count
setInterval(updateCarCount, 5000); // Update car count every 5 seconds
