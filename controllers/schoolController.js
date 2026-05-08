const db = require('../db');

function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

exports.addSchool = async (req, res) => {
    console.log('Adding school:', req.body.name);
    
    try {
        const { name, address, latitude, longitude } = req.body;

        if (!name || !address || latitude == null || longitude == null) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || lat < -90 || lat > 90) {
            return res.status(400).json({ error: 'Invalid latitude' });
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
            return res.status(400).json({ error: 'Invalid longitude' });
        }

        const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(sql, [name.trim(), address.trim(), lat, lng]);

        res.status(201).json({
            message: 'School added successfully',
            schoolId: result.insertId
        });

    } catch (err) {
        console.error('AddSchool Error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.listSchools = async (req, res) => {
    const { latitude, longitude } = req.query;
    console.log('Listing schools near:', latitude, longitude);

    try {
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const userLat = parseFloat(latitude);
        const userLng = parseFloat(longitude);

        if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }

        const [schools] = await db.execute('SELECT * FROM schools');

        const sorted = schools.map(school => ({
            id: school.id,
            name: school.name,
            address: school.address,
            latitude: school.latitude,
            longitude: school.longitude,
            distance: parseFloat(calculateDistance(userLat, userLng, school.latitude, school.longitude).toFixed(2))
        })).sort((a, b) => a.distance - b.distance);

        res.json(sorted);

    } catch (err) {
        console.error('ListSchools Error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
