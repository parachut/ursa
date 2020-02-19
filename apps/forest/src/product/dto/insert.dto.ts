export class InsertProductDto {
  readonly data: {
    attributes: {
      values: {
        url: string[],
        price: number
      }
    };
    collection_name: string;
  };
  readonly type: string[];
}
