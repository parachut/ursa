import { Injectable } from '@nestjs/common';
import addMonths from 'date-fns/addMonths';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

@Injectable()
export class CalculatorService {
  dailyRate(points: number): number {
    let dailyRatePercent =
      parseInt(process.env.DAILY_RATE_PERCENT_MAX) -
      Math.floor(points / 1000) * 3.5;

    if (dailyRatePercent < 25)
      dailyRatePercent = parseInt(process.env.DAILY_RATE_PERCENT_MIN);

    return Math.ceil((points * (dailyRatePercent / 100)) / 30.1);
  }

  dailyCommission(points: number, legacy = false): number {
    if (!process.env.CONTRIBUTOR_PERCENT) {
      throw new Error('Missing environment variable CONTRIBUTOR_PERCENT');
    }

    return Number(
      (
        ((points * (legacy ? 1 : 0.7)) / 30.1) *
        (parseInt(process.env.CONTRIBUTOR_PERCENT) / 100)
      ).toFixed(2),
    );
  }

  protectionDailyRate(points: number): number {
    if (!process.env.INSURANCE_PERCENT) {
      throw new Error('Missing environment variable INSURANCE_PERCENT');
    }

    const dailyRate = this.dailyRate(points);
    const protectionPlan = Math.ceil(
      dailyRate * (parseInt(process.env.INSURANCE_PERCENT) / 100),
    );
    return protectionPlan > 0 ? protectionPlan : 1;
  }

  unlimitedTier(total: number): string {
    if (total > 1240 && total < 3500) {
      return '1500';
    } else if (total > 3500 && total < 4900) {
      return '3500';
    } else if (total > 4900) {
      return '7500';
    } else {
      return '750';
    }
  }

  itemLevel(total: number): string {
    if (total <= 1000) {
      return 'level-1';
    } else if (total > 1000 && total <= 2500) {
      return 'level-2';
    } else if (total > 2500) {
      return 'level-3';
    } else {
      return 'error';
    }
  }

  prorate(alpha: number, beta: number, day: number) {
    const dt = new Date();
    const month = dt.getMonth();
    const year = dt.getFullYear();

    const _day = day || new Date().getDate();

    const nextBillingDate = addMonths(new Date(year, month, _day), 1);
    const remaining = differenceInCalendarDays(nextBillingDate, dt);
    const billingDays = differenceInCalendarDays(
      nextBillingDate,
      new Date(year, month, _day),
    );

    const oldRemaining = beta / billingDays;
    const newRemaining = alpha / billingDays;

    return {
      amount: day ? remaining * (newRemaining - oldRemaining) : alpha,
      nextBillingDate,
    };
  }
}
