import { getReminders, setReminder, getRemindersByDateRange } from '../services/database';

// Function to fetch all reminders
async function fetchAllReminders() {
    try {
        const reminders = await getReminders();
        console.log('All Reminders:', reminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
    }
}

// Function to create a new reminder
async function createNewReminder(message: string, reminderTime: string) {
    try {
        await setReminder(message, reminderTime);
        console.log('Reminder set successfully');
    } catch (error) {
        console.error('Error setting reminder:', error);
    }
}

// Function to fetch reminders within a date range
async function fetchRemindersByDateRange(startDate: string, endDate: string) {
    try {
        const reminders = await getRemindersByDateRange(startDate, endDate);
        console.log(`Reminders from ${startDate} to ${endDate}:`, reminders);
    } catch (error) {
        console.error('Error fetching reminders by date range:', error);
    }
}

// // Example usage
// fetchAllReminders();
// createNewReminder('Meeting with team', '2023-10-15 10:00:00');
// fetchRemindersByDateRange('2023-10-01', '2023-10-31');