const CronScheduler = require('./cronScheduler');

// Initialize the scheduler
const scheduler = new CronScheduler({ 
  logPath: './logs', // Where to store log files
  logEnabled: true   // Enable logging
});

// Example 1: Heavy computation task (non-blocking)
const heavyTask = {
  name: 'Heavy Computation Task',
  execute: () => {
    console.log('Starting heavy computation...');
    
    // Simulate heavy computation (50000 iterations)
    let count = 0;
    while (count < 50000) {
      count++;
      // Do some work without blocking the event loop
      if (count % 10000 === 0) {
        console.log(`Processed ${count} iterations`);
      }
    }
    
    console.log('Heavy computation completed!');
  }
};

// Schedule to run every 5 minutes
scheduler.schedule(heavyTask, { minutes: 5 }, true);

// Example 2: Email sending task
const emailTask = {
  name: 'Send Email Notification',
  execute: async () => {
    try {
      console.log('Preparing to send email...');
      
      // Simulating email sending
      await new Promise((resolve) => {
        // In real-world, you would use a proper email service
        setTimeout(() => {
          console.log('Email sent successfully!');
          resolve();
        }, 1000);
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error; // Let the scheduler handle the error
    }
  }
};

// Schedule to run every 1 hour
const emailTaskId = scheduler.schedule(emailTask, { hours: 1 });

// Example 3: Task with multiple time units
const dailyReportTask = {
  name: 'Generate Daily Report',
  execute: () => {
    console.log('Generating daily report...');
    // Report generation logic here
    console.log('Daily report generated!');
  }
};

// Schedule to run every 1 day and 12 hours
scheduler.schedule(dailyReportTask, { days: 1, hours: 12 });

// List all tasks
console.log('Scheduled Tasks:', scheduler.listTasks());

// Example for cancelling a task after some time
setTimeout(() => {
  console.log('Cancelling email task...');
  scheduler.cancel(emailTaskId);
  console.log('Updated Tasks:', scheduler.listTasks());
}, 5 * 60 * 1000); // Cancel after 5 minutes

// Graceful shutdown on application exit
process.on('SIGINT', () => {
  console.log('Received SIGINT. Gracefully shutting down...');
  scheduler.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Gracefully shutting down...');
  scheduler.shutdown();
  process.exit(0);
});

console.log('Cron scheduler examples started. Press Ctrl+C to exit.');