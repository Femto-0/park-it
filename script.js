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
        // Adding a unique timestamp to the request URL to bypass the cache
        const response = await fetch(`park-it-master/record.json?t=${new Date().getTime()}`, { cache: 'no-cache' });
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

// Update the car count every 5 seconds
setInterval(updateCarCount, 5000);      // Can change to however long, I just have it set up as 5 seconds

// Function to populate the initial list of parking lots
function populateInitialList() {
    const initialLots = [
        { name: "Gold Main Lot", description: "This is the Gold Main Lot", availability: "empty", type: "gold", hasHandicappedSpots: true },
        { name: "Gold Library Lot", description: "This is the Gold Library Lot", availability: "partially-full", type: "gold", hasHandicappedSpots: false },
        { name: "Silver Winona Street Lot", description: "This is the Silver Winona Street Lot", availability: "full", type: "silver", hasHandicappedSpots: true },
        { name: "Purple Belleview Lots", description: "This is the Purple Belleview Lots", availability: "partially-full", type: "purple", hasHandicappedSpots: false },
        { name: "Test Lot", description: "This is the Test Lot", availability: "empty", type: "test", hasHandicappedSpots: true }
    ];

    listContainer.innerHTML = ""; // Clear existing items

    initialLots.forEach(lot => {
        const li = document.createElement('li');
        li.setAttribute('data-name', lot.name);
        li.setAttribute('data-description', lot.description);
        li.setAttribute('data-availability', lot.availability);
        li.setAttribute('data-type', lot.type);
        li.setAttribute('data-handicapped', lot.hasHandicappedSpots);
        li.textContent = lot.name;

        if (lot.availability === "empty") {
            li.classList.add("empty");
        } else if (lot.availability === "partially-full") {
            li.classList.add("partially-full");
        } else if (lot.availability === "full") {
            li.classList.add("full");
        }

        li.addEventListener('click', async () => {
            const name = li.getAttribute('data-name');
            const description = li.getAttribute('data-description');
            const availability = li.getAttribute('data-availability');
            const type = li.getAttribute('data-type');
            const handicapped = li.getAttribute('data-handicapped') === 'true';

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

// Function to filter lots based on handicapped spots
function filterHandicappedLots() {
    const isChecked = document.getElementById('handicapped-filter').checked;
    const lots = listContainer.querySelectorAll('li');

    lots.forEach(lot => {
        const hasHandicappedSpots = lot.getAttribute('data-handicapped') === 'true';
        lot.style.display = (isChecked && !hasHandicappedSpots) ? 'none' : 'block';
    });
}

// Event listener for the handicapped filter checkbox
document.getElementById('handicapped-filter').addEventListener('change', filterHandicappedLots);

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
    const availabilityOrder = { "empty": 0, "partially-full": 1, "full": 2 };

    const sortedLots = lots.sort((a, b) => {
        const availabilityA = a.getAttribute('data-availability');
        const availabilityB = b.getAttribute('data-availability');
        return availabilityOrder[availabilityA] - availabilityOrder[availabilityB];
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

// Dropdown handling functions
function toggleDropdown(options) {
    closeDropdowns();
    options.classList.toggle("show");
}

function closeDropdowns() {
    sortOptions.classList.remove("show");
    filterOptions.classList.remove("show");
}

// Event listeners for sort and filter dropdowns
sortSelect.addEventListener("click", (e) => {
    e.stopPropagation(); 
    toggleDropdown(sortOptions);
});

sortOptions.addEventListener("click", (e) => {
    if (e.target.tagName === "DIV" && e.target.dataset.value) {
        sortSelect.textContent = e.target.textContent;
        resetSortButton.style.display = "inline"; 
        sortOptions.classList.remove("show"); 
        sortTasks(e.target.dataset.value);
    }
});

filterSelect.addEventListener("click", (e) => {
    e.stopPropagation(); 
    toggleDropdown(filterOptions);
});

filterOptions.addEventListener("click", (e) => {
    if (e.target.tagName === "DIV" && e.target.dataset.value) {
        filterSelect.textContent = e.target.textContent;
        resetFilterButton.style.display = "inline";
        filterOptions.classList.remove("show");
        filterTasks(e.target.dataset.value);
    }
});

// Clear button logic for sort and filter
resetSortButton.addEventListener("click", () => {
    sortSelect.textContent = "Select sorting method";
    resetSortButton.style.display = "none";
    populateInitialList();
});

resetFilterButton.addEventListener("click", () => {
    filterSelect.textContent = "Select filter method";
    resetFilterButton.style.display = "none";
    filterTasks("all");
});

// Close dropdowns on outside click
document.addEventListener("click", (e) => {
    if (!sortOptions.contains(e.target) && !sortSelect.contains(e.target)) {
        sortOptions.classList.remove("show");
    }
    if (!filterOptions.contains(e.target) && !filterSelect.contains(e.target)) {
        filterOptions.classList.remove("show");
    }
});

// Initial population of the parking lot list
populateInitialList();
