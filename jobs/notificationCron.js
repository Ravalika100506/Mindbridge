const cron = require('node-cron');
const User = require('../models/User');
const Mood = require('../models/Mood');
const Notification = require('../models/Notification');

/**
 * Smart Notification Scheduler
 * Runs reminders for mood logging, meditation, breaks, and streak preservation.
 */
const startNotificationJobs = () => {

  // Daily mood reminder — 9 AM every day
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily mood reminder job...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find users who haven't logged mood today
      const allUsers = await User.find({ isActive: true, 'preferences.notifications': true }).select('_id wellness');
      const moodedToday = await Mood.find({ date: { $gte: today } }).distinct('user');
      const moodedSet = new Set(moodedToday.map(id => id.toString()));

      const usersToRemind = allUsers.filter(u => !moodedSet.has(u._id.toString()));

      if (usersToRemind.length > 0) {
        await Notification.insertMany(usersToRemind.map(u => ({
          user: u._id,
          type: 'mood_reminder',
          title: '🌤️ Daily Mood Check-in',
          message: "How are you feeling today? Log your mood to keep your streak going!",
          link: '/mood'
        })));
        console.log(`✅ Sent mood reminders to ${usersToRemind.length} users`);
      }
    } catch (err) {
      console.error('Mood reminder job error:', err.message);
    }
  });

  // Meditation reminder — 6 PM weekdays
  cron.schedule('0 18 * * 1-5', async () => {
    console.log('⏰ Running meditation reminder job...');
    try {
      const users = await User.find({ isActive: true, 'preferences.notifications': true }).select('_id');
      await Notification.insertMany(users.map(u => ({
        user: u._id,
        type: 'meditation_reminder',
        title: '🧘 Evening Wind-Down',
        message: "Take 5 minutes to breathe and reset before the night. You deserve it.",
        link: '/breathe'
      })));
      console.log(`✅ Sent meditation reminders to ${users.length} users`);
    } catch (err) {
      console.error('Meditation reminder job error:', err.message);
    }
  });

  // Break reminder — every 2 hours on weekdays during study hours
  cron.schedule('0 10,12,14,16 * * 1-5', async () => {
    console.log('⏰ Running break reminder job...');
    try {
      const users = await User.find({ isActive: true, 'preferences.notifications': true }).select('_id');
      await Notification.insertMany(users.map(u => ({
        user: u._id,
        type: 'break_reminder',
        title: '☕ Time for a Break!',
        message: "Stand up, stretch, and hydrate. A 5-minute break improves focus significantly.",
        link: '/breathe'
      })));
    } catch (err) {
      console.error('Break reminder job error:', err.message);
    }
  });

  // Streak at-risk warning — 8 PM, for users who haven't logged today
  cron.schedule('0 20 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const allUsers = await User.find({ isActive: true, 'wellness.streak': { $gt: 0 }, 'preferences.notifications': true }).select('_id wellness');
      const moodedToday = await Mood.find({ date: { $gte: today } }).distinct('user');
      const moodedSet = new Set(moodedToday.map(id => id.toString()));
      const atRisk = allUsers.filter(u => !moodedSet.has(u._id.toString()) && u.wellness.streak > 0);
      if (atRisk.length > 0) {
        await Notification.insertMany(atRisk.map(u => ({
          user: u._id,
          type: 'streak_milestone',
          title: '🔥 Don\'t Break Your Streak!',
          message: `You have a ${u.wellness.streak}-day streak — log your mood before midnight to keep it!`,
          link: '/mood'
        })));
      }
    } catch (err) {
      console.error('Streak warning job error:', err.message);
    }
  });

  console.log('🕐 Notification cron jobs started');
};

module.exports = { startNotificationJobs };
