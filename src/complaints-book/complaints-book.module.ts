import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintsBookService } from './complaints-book.service';
import { ComplaintsBookController } from './complaints-book.controller';
import { ComplaintsBook } from './entities/complaints-book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintsBook])],
  controllers: [ComplaintsBookController],
  providers: [ComplaintsBookService],
})
export class ComplaintsBookModule {}
