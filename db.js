const mysql = require('mysql2/promise'); // Using the promise wrapper for async/await

// ⚠️ IMPORTANT: Replace these placeholders with your actual MySQL Workbench credentials!
const pool = mysql.createPool({
    host: 'localhost',       // Or your MySQL Server IP
    user: 'root',            // Your MySQL Workbench username
    password: 'password123', // Your MySQL Workbench password
    database: 'travelores_db', // The name of the database you create in Workbench
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection when the application starts
pool.getConnection()
    .then(connection => {
        console.log("✅ MySQL Database connected successfully!");
        connection.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.error("❌ Error connecting to MySQL Database:", err.message);
        // You might want to exit the process if the DB connection fails
    });

module.exports = pool;