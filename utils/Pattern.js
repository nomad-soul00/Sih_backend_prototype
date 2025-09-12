

function getYears(data) {
    const years = data
      .map(item => item.Year)
      .filter(year => year); // filters out null, undefined, 0, '', false
      
    return [...new Set(years)];
}

function getLocations(data) {
    const locationMap = new Map();

    data.forEach(item => {
        if (!locationMap.has(item.Location)) {
            locationMap.set(item.Location, {
                latitude: item.Latitude,
                longitude: item.Longitude
            });
        }
    });

    return Array.from(locationMap.entries()).map(([location, coords]) => ({
        [location]: coords
    }));
}


const detectPattern = (results) => {
    if (!Array.isArray(results) || results.length === 0) {
        const obj = {
            status: 404,
            message: 'No data found'
        };
        return obj; 
    }


    const years = getYears(results);
    const locations = getLocations(results);


    if (years.length === 0 || locations.length === 0) {
        return 'NO_DATA';
    }
        
    if (locations.length === 1 && (years.length > 1)) {
        return 'SINGLE_LOC_MULTI_YEAR';
    }
    if (locations.length > 1 && years.length === 1) {
        return 'MULTI_LOC_SINGLE_YEAR';
    }
    if (locations.length > 1 && years.length > 1) {
        return 'MULTI_LOC_MULTI_YEAR';
    }
    return 'SINGLE_LOC_SINGLE_YEAR';
}

export default detectPattern;