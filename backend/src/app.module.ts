import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SwapModule } from './swap/swap.module';
import { ScallopModule } from './scallop/scallop.module';

@Module({
  imports: [SwapModule, ScallopModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
