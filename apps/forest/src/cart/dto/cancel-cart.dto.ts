export class CancelCartDto {
  readonly data: {
    attributes: {
      ids: string[];
    };
    collection_name: string;
  };
  readonly type: string;
}
