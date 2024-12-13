const TYPES = {
    AuthProvider: Symbol('AuthProvider'),
    MongoDBClient: Symbol('MongoDBClient'),
    Middleware: {
        Validation: Symbol('ValidationMiddleware'),
    },
    Repositories: {
        Reminder: Symbol('ReminderRepository'),
        User: Symbol('UserRepository'),
    },
    Services: {
        Auth: Symbol('AuthService'),
        Cron: Symbol('CronService'),
        OpenReminder: Symbol('OpenReminderService'),
        Reminder: Symbol('ReminderService'),
        User: Symbol('UserService'),
    },
    Namespace: {
        Auth: '/api/auth',
        Reminder: '/api/reminders',
    },
};

export default TYPES;
