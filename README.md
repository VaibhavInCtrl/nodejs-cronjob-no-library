# Node.js Cron Scheduler

A lightweight, non-blocking cron scheduler for Node.js applications without using any depending libraries

## Features

- ⏱️ Flexible scheduling from minutes to hours to days
- 🚫 Non-blocking task execution
- 🧩 Modular, extensible design
- 🛡️ Graceful error handling
- 📝 Comprehensive logging
- 🔄 Task status tracking
- 🔌 Zero dependencies

## Installation

Simply copy the `cronScheduler.js` file into your project:

```bash
# Clone the repository
git clone https://github.com/VaibhavInCtrl/node-cron-scheduler.git

# Or just copy the file to your project
cp src/cronScheduler.js /path/to/your/project/
```

## Quick Start

```javascript
const CronScheduler = require('../src/cronScheduler');

// Initialize the scheduler
const scheduler = new CronScheduler();

// Define a task
const myTask = {
  name: 'My Periodic Task',
  execute: () => {
    console.log('Task executed at:', new Date().toISOString());
    // Your task logic goes here
  }
};

// Schedule to run every 30 minutes
const taskId = scheduler.schedule(myTask, { minutes: 30 });

// You can cancel it later if needed
// scheduler.cancel(taskId);
```

## Usage

### Initializing the Scheduler

```javascript
const CronScheduler = require('./cronScheduler');

// Default initialization
const scheduler = new CronScheduler();

// With custom options
const schedulerWithOptions = new CronScheduler({
  logPath: './custom-logs',  // Custom log directory
  logEnabled: true           // Enable or disable logging
});
```

### Scheduling Tasks

Tasks require an `execute` method and can optionally have a `name`:

```javascript
// Simple task
const simpleTask = {
  name: 'Simple Task',
  execute: () => {
    console.log('Simple task executed!');
  }
};

// Async task
const asyncTask = {
  name: 'Async Task',
  execute: async () => {
    await someAsyncOperation();
    console.log('Async task completed!');
  }
};

// Schedule with different frequencies
scheduler.schedule(simpleTask, { minutes: 5 });                // Every 5 minutes
scheduler.schedule(asyncTask, { hours: 2 });                   // Every 2 hours
scheduler.schedule(simpleTask, { days: 1 });                   // Daily
scheduler.schedule(asyncTask, { minutes: 30, hours: 1 });      // Every 1 hour and 30 minutes
scheduler.schedule(simpleTask, { minutes: 10 }, true);         // Run immediately and then every 10 minutes
```

### Managing Tasks

```javascript
// Get a list of all scheduled tasks
const tasks = scheduler.listTasks();
console.log(tasks);

// Cancel a specific task
scheduler.cancel(taskId);

// Shutdown the scheduler and cancel all tasks
scheduler.shutdown();
```

### Handling Graceful Shutdown

```javascript
// Handle application shutdown
process.on('SIGINT', () => {
  console.log('Application shutting down...');
  scheduler.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Application terminated...');
  scheduler.shutdown();
  process.exit(0);
});
```

## Task Configuration

Each task should be an object with:

- `name` (optional): A descriptive name for the task
- `execute`: A function or async function to execute

## Frequency Options

The frequency object can contain any combination of:

- `minutes`: Run every X minutes
- `hours`: Run every X hours
- `days`: Run every X days

Example:
```javascript
// Run every 1 day, 6 hours, and 30 minutes
scheduler.schedule(myTask, { days: 1, hours: 6, minutes: 30 });
```

## API Reference

### CronScheduler

#### Constructor

```javascript
new CronScheduler(options)
```

- `options.logPath`: Directory for log files (default: './logs')
- `options.logEnabled`: Enable/disable logging (default: true)

#### Methods

- `schedule(task, frequency, runImmediately)`: Schedule a new task
  - Returns: `taskId` (number)
- `cancel(taskId)`: Cancel a scheduled task
  - Returns: `success` (boolean)
- `listTasks()`: Get a list of all scheduled tasks
  - Returns: Array of task objects
- `shutdown()`: Cancel all tasks and shutdown the scheduler

## Error Handling

The scheduler automatically catches and logs errors that occur during task execution. Tasks will continue to be scheduled even if they encounter errors.

## Logging

By default, logs are written to both the console and daily log files in the `./logs` directory. Each log entry includes:

- Timestamp
- Log level (INFO, WARN, ERROR)
- Message

## Possible Future Improvements

### Task Management
- **Task Prioritization**: Support prioritizing certain tasks over others when multiple are due to run
- **Task Retry Logic**: Implement automatic retry attempts for failed tasks with configurable backoff strategies
- **Task Timeout**: Add configurable maximum execution time to prevent tasks from running indefinitely

### Technical Enhancements
- **Drift Correction**: Improve timing accuracy by preventing drift that can occur with setInterval
- **State Persistence**: Add ability to persist scheduled tasks across application restarts
- **Event System**: Implement event emitters to allow subscribing to task lifecycle events
- **Memory Usage Optimization**: Implement log rotation and better memory management

### Performance
- **Resource Management**: Add CPU and memory usage limits for task execution
- **Performance Metrics**: Add built-in performance tracking for task execution
- **Intelligent Scheduling**: Schedule similar tasks in batches to improve efficiency

### Scheduling Flexibility
- **Advanced Cron Patterns**: Support for cron-like syntax for more complex scheduling patterns
- **Specific Times**: Schedule tasks to run at specific times of day rather than intervals
- **Timezone Support**: Add support for different timezones when scheduling daily or time-specific tasks
- **Calendar-based Scheduling**: Schedule tasks for specific days of week, month, or year

## License

MIT