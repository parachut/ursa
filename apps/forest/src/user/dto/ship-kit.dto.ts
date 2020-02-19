export class ShipKitDto {
    readonly data: {
        attributes: {
            ids: string[]
            values: {
                airbox: boolean
            }
        };
        collection_name: string;
    };
    readonly type: string[];
}
