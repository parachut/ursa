export class TrackerDto {
  readonly affiliateId: string;
  readonly visitorId: string;
  readonly deviceId: string;
  readonly marketingSource: {
    campaign: string;
    source: string;
    medium: string;
  };
}
