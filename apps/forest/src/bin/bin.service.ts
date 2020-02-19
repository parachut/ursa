import { Injectable, Inject, Logger } from '@nestjs/common';
import { Bin } from '@app/database/entities';

@Injectable()
export class BinService {
    private logger = new Logger('BinService')
    private readonly binRepository: typeof Bin = this.sequelize.getRepository(
        'Bin',
    );
    constructor(@Inject('SEQUELIZE') private readonly sequelize) { }

    async generateLabels(): Promise<Bin[]> {

        const bins = await this.binRepository.findAll({});
        console.log(bins)
        // const columns = {
        //     id: 'ID',
        //     location: 'Location',
        //   };

        //   const report = bins.map((bin) => ({
        //     id: bin.id,
        //     location: `${bin.location}-${bin.row}-${bin.column}-${bin.cell}`,
        //   }));


        return
    }
}