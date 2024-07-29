let currentPage = 1;
let resultsPerPage = 5;
let totalPages = 1;

document.addEventListener('DOMContentLoaded', () => {
    const searchFilter = document.getElementById('searchFilter');
    const tableBody = document.querySelector('#filteredTable tbody');
    const loader = document.getElementById('loader');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const resultsPerPageSelect = document.getElementById('resultsPerPage');
    const searchBegins = document.getElementById('searchBegins');

    async function fetchData(name, page = 1, limit = 5) {
        try {
            console.log(name);
            loader.style.display = 'block';
            tableBody.innerHTML = '';
            // data fetch 
            const response = await fetch(`${config.API_URL}?namePrefix=${name}&limit=${limit}&offset=${(page - 1) * limit}`, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': config.API_KEY,
                    'x-rapidapi-host': config.API_HOST
                }
            });

            const data = await response.json();
            loader.style.display = 'none';
            totalPages = Math.ceil(data.metadata.totalCount / limit);
            if (data && data.data && data.data.length > 0) {
                data.data.forEach((item, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                                <td>${(page - 1) * limit + index + 1}</td>
                                <td>${item.name}</td>
                                <td>
                                    ${item.countryCode ? `<img src="https://flagsapi.com/${item.countryCode}/shiny/24.png" alt="${item.country}" title="${item.country}"> ${item.country}` : 'No flag'}
                                </td>
                            `;
                    tableBody.appendChild(row);
                });

                searchBegins.style.display = 'none';
            } else {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="3" class="text-center">No result found</td>';
                tableBody.appendChild(row);
            }
            prevPageButton.disabled = (page === 1);
            nextPageButton.disabled = (page === totalPages);
        } catch (error) {
            console.error(error);
            loader.style.display = 'none';
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3">Error fetching data</td>';
            tableBody.appendChild(row);
        }
    }
    function handleSearch() {
        const name = searchFilter.value.trim();
        if (name) {
            fetchData(name, currentPage, resultsPerPage);
        } else {
            tableBody.innerHTML = '<tr id="searchBegins"><td colspan="3" class="text-center">Start searching</td></tr>';
            prevPageButton.disabled = true;
            nextPageButton.disabled = true;
        }
    }
    resultsPerPageSelect.addEventListener('change', (event) => {
        resultsPerPage = parseInt(event.target.value, 10);
        handleSearch();
    });
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            handleSearch();
        }
    });
    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            handleSearch();
        }
    });

    searchFilter.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            currentPage = 1;
            handleSearch();
        }
    });

    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            searchFilter.focus();
        }
    });
    handleSearch();
});