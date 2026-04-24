import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departman } from './departman.entity';

@Controller('departmanlar')
export class DepartmanController {
  constructor(
    @InjectRepository(Departman)
    private departmanRepo: Repository<Departman>,
  ) {}

  @Get()
  findAll() {
    return this.departmanRepo.find();
  }

  @Post()
  create(@Body() body: { ad: string }) {
    return this.departmanRepo.save(body);
  }
}
