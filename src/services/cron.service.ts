import { injectable } from 'inversify';
import cron from 'node-cron';

@injectable()
export default class CronService {
    constructor() {
        this.initializeCronJobs(); // Schedule the cron jobs
    }

    private initializeCronJobs() {
        cron.schedule(
            '0 0 * * *', // minute, day, hour, month, day of the week
            this.handleDailyPoll.bind(this),
            { timezone: 'America/New_York' },
        );
    }

    public async handleDailyPoll(): Promise<void> {
        // Add daily polling logic here
    }
}
