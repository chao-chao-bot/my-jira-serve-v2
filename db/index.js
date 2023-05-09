const mysql = require('mysql2/promise')
async function connectToDatabase() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'jira_db'
  })

  return connection
}
exports.connectToDatabase = connectToDatabase
