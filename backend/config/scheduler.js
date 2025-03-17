const cron = require("node-cron");
const User = require("../models/User"); // Adjust the path to your User model
const sendMail = require("../config/mailer"); // Import the sendMail function

// Schedule a task to run daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Find users who haven't been active in the last 7 days
    const inactiveUsers = await User.find({
      lastActivity: { $lt: sevenDaysAgo }, // Last activity is older than 7 days
      isActivate: "Activated", // Only check activated users
    });

    // Deactivate inactive users and send deactivation notices
    for (const user of inactiveUsers) {
      user.isActivate = "Deactivated";
      await user.save();

      // Send deactivation notice
      const subject = "Account Deactivation Notice";
      const text = `Dear ${user.name},\n\nYour account has been deactivated due to inactivity. If this was a mistake, please contact our support team.\n\nBest regards,\nOptic AI Team`;

      await sendMail(user.email, subject, text);
      console.log(`Deactivation notice sent to ${user.email}`);
    }

    console.log(`Deactivated ${inactiveUsers.length} inactive users.`);
  } catch (error) {
    console.error("Error in scheduled task:", error);
  }
});

// Manually trigger the scheduler for testing
async function runSchedulerManually() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find users who haven't been active in the last 7 days
    const inactiveUsers = await User.find({
      lastActivity: { $lt: sevenDaysAgo }, // Last activity is older than 7 days
      isActivate: "Activated", // Only check activated users
    });

    // Deactivate inactive users and send deactivation notices
    for (const user of inactiveUsers) {
      user.isActivate = "Deactivated";
      await user.save();

      // Send deactivation notice
      const subject = "Account Deactivation Notice";
      const text = `Dear ${user.name},\n\nYour account has been deactivated due to inactivity. If this was a mistake, please contact our support team.\n\nBest regards,\nOptic AI Team`;

      await sendMail(user.email, subject, text);
      console.log(`Deactivation notice sent to ${user.email}`);
    }

    console.log(`Deactivated ${inactiveUsers.length} inactive users.`);
  } catch (error) {
    console.error("Error in scheduled task:", error);
  }
}

// Uncomment the line below to run the scheduler manually
//runSchedulerManually();