import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

async function reset() {
  const hash = await bcrypt.hash('123', 10);
  const db = new sqlite3.Database('./database.sqlite');
  db.run("UPDATE user SET password = ?", [hash], (err) => {
    if (err) console.error(err);
    else console.log("Passwords reset to 123 for all users.");
    db.close();
  });
}
reset();
