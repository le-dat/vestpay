import { Module } from '@nestjs/common';
import { ScallopController } from './scallop.controller';
import { ScallopService } from './scallop.service';

@Module({
  controllers: [ScallopController],
  providers: [ScallopService],
  exports: [ScallopService],
})
export class ScallopModule {}
