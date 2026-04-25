const { Sequelize } = require("sequelize");

// Setup Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/pos_db", {
  dialect: "postgres",
  logging: false, // Set to true to see SQL queries in console
});

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully.");
    
    // Automatically create tables if they don't exist
    await sequelize.sync(); 
  } catch (error) {
    throw new Error("Unable to connect to the database: " + error.message);
  }
}

module.exports = { sequelize, connectDatabase };
