import { Controller, Get, Param } from '@nestjs/common';
import { MagazinesService } from './magazines.service';

@Controller('magazines')
export class MagazinesController {
  constructor(private readonly magazines: MagazinesService) {}

  @Get()
  list() {
    return this.magazines.list();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.magazines.getBySlug(slug);
  }
}
