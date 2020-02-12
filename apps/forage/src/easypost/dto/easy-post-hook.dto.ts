export class EasyPostHookDto {
  readonly description: string;
  readonly mode: string;
  readonly result: {
    id: string;
    mode: string;
    shipment_id: string;
    tracking_details: {
      status: string;
      datetime: string;
    };
  };
}
