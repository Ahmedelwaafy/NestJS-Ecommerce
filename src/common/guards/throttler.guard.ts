import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, any>): Promise<string> {
    // Return the IP as a Promise to match the base class signature
    const ip = req.ips.length ? req.ips[0] : req.ip;
    return Promise.resolve(ip);
  }
}
