import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

async function createSuperAdmin() {
    const db = new sqlite3.Database('./database.sqlite');
    const password = '123';
    const hash = await bcrypt.hash(password, 10);
    
    // Check if user exists
    db.get("SELECT id FROM user WHERE email = 'superadmin@test.com'", (err, row) => {
        if (err) {
            console.error("DB Error:", err);
            db.close();
            return;
        }
        
        if (row) {
            console.log("User superadmin@test.com already exists. Updating role and password...");
            db.run("UPDATE user SET role = 'superadmin', password = ? WHERE id = ?", [hash, row.id], (err) => {
                if (err) console.error("Update Error:", err);
                else console.log("User updated successfully.");
                db.close();
            });
        } else {
            console.log("Creating new superadmin@test.com...");
            const sql = `INSERT INTO user (firstName, lastName, email, password, role, unvan, iseGirisTarihi, normalCalismaSaati, saatlikUcret, canViewDashboard, canManagePersonnel, canManageFinance, canApproveLeaves, canManageInventory, canViewLogs) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = ['Admin', 'Sistem', 'superadmin@test.com', hash, 'superadmin', 'Kurucu / CEO', '2020-01-01', 8, 250, 1, 1, 1, 1, 1, 1];
            
            db.run(sql, params, (err) => {
                if (err) console.error("Insert Error:", err);
                else console.log("User created successfully.");
                db.close();
            });
        }
    });
}

createSuperAdmin();
