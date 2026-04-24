import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');

db.all("SELECT id, email, password, role FROM user", (err, rows) => {
    if (err) {
        console.error("DB Error:", err);
    } else {
        console.log("Users in DB:");
        console.log(rows);
    }
    db.close();
});
