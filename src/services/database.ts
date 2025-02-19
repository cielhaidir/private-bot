import { createPool } from "mysql2/promise";



const db = createPool({
    host: 'd6vscs19jtah8iwb.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'hh6zonruer23u7on',
    password: 'fq6l0qme9mueei67',
    database: 'lzgwsgdhwnd8p582',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// const db = createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });


// Pengecekan dan pembuatan tabel
export async function ensureDatabaseSetup() {

    try {

        await db.query(`
            CREATE TABLE IF NOT EXISTS journal (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(10) NOT NULL,  -- 'in' atau 'out'
                total INT NOT NULL,
                \`desc\` TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS settings (
                \`key\` VARCHAR(50) PRIMARY KEY,
                \`value\` TEXT NOT NULL
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS reminders (
                id SERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                reminder_time TIMESTAMP NOT NULL,
                triggered BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
                );
            `);

        console.log("Database setup complete.");
    } catch (error) {
        console.error("Error setting up the database:", error);
        throw error;
    }
}



export async function insertToJournal(type: string, total: number, desc: string) {
    await db.query(
        "INSERT INTO journal (type, total, `desc`, created_at) VALUES (?, ?, ?, NOW())",
        [type, total, desc]
    );
}


export async function getWeeklyJournal(): Promise<Array<{ type: string; total: number; desc: string; created_at: string }>> {

    const [rows] = await db.query(
        "SELECT * FROM journal WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)"
    );
    return rows as Array<{ type: string; total: number; desc: string; created_at: string }>;
}

export async function setWeeklyBudget(nominal: number) {
    await db.query(
        "INSERT INTO settings (`key`, `value`) VALUES ('weekly_budget', ?) ON DUPLICATE KEY UPDATE `value` = ?",
        [nominal, nominal]
    );
}


export async function getWeeklyBudget(): Promise<number | null> {
    const [data]: any = await db.query(
        "SELECT `value` FROM settings WHERE `key` = 'weekly_budget' LIMIT 1"
    );
    if (data.length > 0) {
        return parseInt(data[0].value, 10);
    }
    return null;
}


export async function getReminders(): Promise<Array<{ id: number; message: string; reminder_time: string; triggered: boolean; created_at: string; updated_at: string }>> {
    const [rows] = await db.query("SELECT * FROM reminders");
    return rows as Array<{ id: number; message: string; reminder_time: string; triggered: boolean; created_at: string; updated_at: string }>;
}

export async function setReminder(message: string, reminder_time: string) {
    await db.query(
        "INSERT INTO reminders (message, reminder_time, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
        [message, reminder_time]
    );
}

export async function getRemindersByDateRange(startDate: string, endDate: string): Promise<Array<{ id: number; message: string; reminder_time: string; triggered: boolean; created_at: string; updated_at: string }>> {
    const [rows] = await db.query(
        "SELECT * FROM reminders WHERE reminder_time BETWEEN ? AND ?",
        [startDate, endDate]
    );
    return rows as Array<{ id: number; message: string; reminder_time: string; triggered: boolean; created_at: string; updated_at: string }>;
}