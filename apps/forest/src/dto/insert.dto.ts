export class InsertProductDto {
  readonly data: {
    attributes: {
      values: {
        url: string[],
        price: string[]
      }
    };
    collection_name: string;
  };
  readonly type: string;
}
