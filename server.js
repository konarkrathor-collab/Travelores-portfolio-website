// --------------------- IMPORTS ---------------------

const express = require('express');

const app = express();

const cors = require('cors');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const mysql = require('mysql2/promise');

const path = require('path');
 
// --------------------- DATABASE CONNECTION ---------------------

const pool = mysql.createPool({

  host: 'localhost',          // MySQL host

  user: 'root',               // Your MySQL username

  password: 'password123',   // Your MySQL password

  database: 'travelores_db',     // Your database name

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0

});
 
(async () => {

  try {

    const conn = await pool.getConnection();

    console.log('✅ Connected to MySQL Database');

    conn.release();

  } catch (err) {

    console.error('❌ Database Connection Error:', err);

  }

})();
 
// --------------------- MIDDLEWARE ---------------------

const JWT_SECRET = 'sX3P@v6mB%J9qZ!kL$rT9&hN2sWxE8jY1uA6cM4vD3fG7gH0iJaKbLcMd57B#@pQz!kL$rT9';
 
app.use(cors());

app.use(express.json());
 
// --------------------- AUTHENTICATION MIDDLEWARE ---------------------

const authenticateToken = (req, res, next) => {

  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
 
  jwt.verify(token, JWT_SECRET, (err, user) => {

    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });

    req.user = user;

    next();

  });

};
 
// --------------------- SERVE FRONTEND ---------------------

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {

  res.sendFile(path.join(__dirname, 'WEBSITE.HTML'));

});
 
// --------------------- REGISTRATION ENDPOINT ---------------------

app.post('/api/register', async (req, res) => {

  const { name, email, phone, password } = req.body;
 
  if (!name || !email || !phone || !password) {

    return res.status(400).json({ success: false, message: 'All fields are required.' });

  }
 
  try {

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO Users (name, email, phone, password) VALUES (?, ?, ?, ?)';

    const [result] = await pool.execute(sql, [name, email, phone, hashedPassword]);
 
    res.status(201).json({

      success: true,

      message: 'User registered successfully!',

      userId: result.insertId

    });

  } catch (error) {

    if (error.code === 'ER_DUP_ENTRY') {

      return res.status(409).json({ success: false, message: 'Email already in use.' });

    }

    console.error('Registration Error:', error);

    res.status(500).json({ success: false, message: 'Server error during registration.' });

  }

});
 
// --------------------- LOGIN ENDPOINT ---------------------

// --------------------- LOGIN ENDPOINT ---------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
 
  try {
    // FIX 1: Selecting the correct column names (id, name instead of user_id, username)
    const sql = 'SELECT id, name, email, password FROM users WHERE email = ?';
    const [rows] = await pool.execute(sql, [email]);
    const user = rows[0];

    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
 
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
 
    // FIX 2: Mapping user.id to user_id so your Itinerary routes don't break
    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
 
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      // FIX 3: Sending back the correct id and name variables
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});
 
// --------------------- PROTECTED ITINERARY ENDPOINTS ---------------------

app.post('/api/itineraries', authenticateToken, async (req, res) => {

  const user_id = req.user.user_id;

  const { destination_name, start_date, end_date } = req.body;
 
  if (!destination_name || !start_date || !end_date) {

    return res.status(400).json({ success: false, message: 'Missing itinerary details.' });

  }
 
  try {

    const sql = 'INSERT INTO Itineraries (user_id, destination_name, start_date, end_date) VALUES (?, ?, ?, ?)';

    const [result] = await pool.execute(sql, [user_id, destination_name, start_date, end_date]);
 
    res.status(201).json({

      success: true,

      message: 'Itinerary created successfully',

      itinerary_id: result.insertId

    });

  } catch (error) {

    console.error('Itinerary Creation Error:', error);

    res.status(500).json({ success: false, message: 'Server error creating itinerary.' });

  }

});
 
app.get('/api/itineraries', authenticateToken, async (req, res) => {

  const user_id = req.user.user_id;
 
  try {

    const sql = 'SELECT * FROM Itineraries WHERE user_id = ? ORDER BY start_date DESC';

    const [itineraries] = await pool.execute(sql, [user_id]);

    res.status(200).json({ success: true, itineraries });

  } catch (error) {

    console.error('Fetch Itineraries Error:', error);

    res.status(500).json({ success: false, message: 'Server error fetching itineraries.' });

  }

});
 
// --------------------- START SERVER ---------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`🚀 Server running on http://localhost:${PORT}`);

});

 