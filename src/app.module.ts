import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { CommonModule } from './common/common.module';
import { BannerModule } from './banner/banner.module';
import { LeadModule } from './lead/lead.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig,
    }),
    CommonModule,
    BannerModule,
    LeadModule

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
