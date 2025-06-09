import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AccountProfile } from './accountProfile.chema';
import { Follow } from './follow.schema';

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);
  private creditDistributionInterval: CronExpression | string = CronExpression.EVERY_HOUR;

  constructor(
    @InjectModel(AccountProfile.name) private accountModel: Model<AccountProfile>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    private configService: ConfigService
  ) {
    // Get credit distribution interval from env if available
    const configuredInterval = this.configService.get<string>('CREDIT_DISTRIBUTION_INTERVAL');
    if (configuredInterval) {
      this.creditDistributionInterval = configuredInterval;
      this.logger.log(`Credit distribution interval set to: ${configuredInterval}`);
    }
  }

  // @Cron(() => this.creditDistributionInterval)
  @Cron(CronExpression.EVERY_HOUR)
  async distributeCredits() {
    this.logger.log(`Starting credit distribution with interval: ${this.creditDistributionInterval}`);
    
    try {
      // Get all follow relationships
      const follows = await this.followModel.find().exec();
      const creditsDistributed = { total: 0, successful: 0, failed: 0 };
      
      // Process each follow relationship
      for (const follow of follows) {
        try {
          // Get follower profile
          const follower = await this.accountModel.findById(follow.follower).exec();
            if (follower && follower.credit > 0) {
            // Get the followed user profile (it's called 'following' in the schema)
            const followed = await this.accountModel.findById(follow.following).exec();
            
            if (followed) {
              // Update credit: subtract from follower, add to followed
              await this.accountModel.updateOne(
                { _id: follower._id }, 
                { $inc: { credit: -1 } }
              );
              
              await this.accountModel.updateOne(
                { _id: followed._id }, 
                { $inc: { credit: 1 } }
              );
              
              creditsDistributed.total++;
              creditsDistributed.successful++;
              
              this.logger.debug(`Transferred 1 credit from ${follower._id} to ${followed._id}`);
            }
          }
        } catch (error) {
          creditsDistributed.failed++;
          this.logger.error(`Failed to process credit transfer for follow: ${follow._id}`, error);
        }
      }
      
      this.logger.log(`Credit distribution completed. Total: ${creditsDistributed.total}, Success: ${creditsDistributed.successful}, Failed: ${creditsDistributed.failed}`);
    } catch (error) {
      this.logger.error('Error during credit distribution:', error);
    }
  }

  // Method to change the distribution interval at runtime
  setDistributionInterval(interval: string) {
    if (interval) {
      // @Cron(() => this.creditDistributionInterval)
      this.creditDistributionInterval = interval;
      this.logger.log(`Credit distribution interval updated to: ${interval}`);
      // Note: Changing the interval at runtime will not affect the already scheduled cron job.
      // To dynamically change cron intervals, consider using a dynamic scheduler or restart the service.
      return { success: true, message: `Interval updated to ${interval}` };
    } else {
      this.logger.warn('Attempted to set an undefined or empty interval.');
      return { success: false, message: 'Interval must be a non-empty string.' };
    }
  }
}
