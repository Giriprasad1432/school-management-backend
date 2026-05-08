const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const schoolRoutes = require('./routes/schoolRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', schoolRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'School Management API is running' });
});

async function init() {
    try {
        await db.getConnection();
        console.log('Database connected...');

        app.listen(PORT, () => {
            console.log('Server is live on port ' + PORT);
        });
    } catch (err) {
        console.error('Database connection error:', err.message);
        if (process.env.NODE_ENV !== 'production') process.exit(1);
    }
}

init();

module.exports = app;
