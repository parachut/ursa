export class InsertProductDto {
  readonly data: {
    attributes: {
      values: {
        readonly url: string[],
        readonly price: number
      }
    };
    collection_name: string;
  };
  readonly type: string[];
}
