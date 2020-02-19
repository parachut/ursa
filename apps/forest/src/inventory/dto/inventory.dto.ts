export class InventoryDto {
    readonly data: {
        attributes: {
            ids: string[];
            values: {
                startDate: Date
                endDate: Date
            }
        };
        collection_name: string;
    };
    readonly type: string;
}
