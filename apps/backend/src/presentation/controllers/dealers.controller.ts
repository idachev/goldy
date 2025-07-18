import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { DealerDto, AssetType } from '@goldy/shared/types';
import { ManageDealersUseCase } from '../../application/use-cases/manage-dealers.use-case';

interface CreateDealerRequest {
  name: string;
  websiteUrl: string;
  scrapingConfig: {
    selectors: Record<string, string>;
    urlPatterns: Record<AssetType, string>;
  };
  isActive?: boolean;
}

interface UpdateDealerRequest {
  name?: string;
  websiteUrl?: string;
  scrapingConfig?: {
    selectors: Record<string, string>;
    urlPatterns: Record<AssetType, string>;
  };
  isActive?: boolean;
}

@Controller('api/dealers')
export class DealersController {
  constructor(private readonly manageDealersUseCase: ManageDealersUseCase) {}

  @Get()
  async getAllDealers(): Promise<DealerDto[]> {
    return this.manageDealersUseCase.getAllDealers();
  }

  @Get('active')
  async getActiveDealers(): Promise<DealerDto[]> {
    return this.manageDealersUseCase.getActiveDealers();
  }

  @Get(':id')
  async getDealerById(@Param('id') id: string): Promise<DealerDto> {
    const dealer = await this.manageDealersUseCase.getDealerById(id);
    if (!dealer) {
      throw new NotFoundException(`Dealer not found with ID: ${id}`);
    }
    return dealer;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDealer(
    @Body() createDealerRequest: CreateDealerRequest
  ): Promise<DealerDto> {
    return this.manageDealersUseCase.createDealer(createDealerRequest);
  }

  @Put(':id')
  async updateDealer(
    @Param('id') id: string,
    @Body() updateDealerRequest: UpdateDealerRequest
  ): Promise<DealerDto> {
    const updatedDealer = await this.manageDealersUseCase.updateDealer(
      id,
      updateDealerRequest
    );
    if (!updatedDealer) {
      throw new NotFoundException(`Dealer not found with ID: ${id}`);
    }
    return updatedDealer;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDealer(@Param('id') id: string): Promise<void> {
    const deleted = await this.manageDealersUseCase.deleteDealer(id);
    if (!deleted) {
      throw new NotFoundException(`Dealer not found with ID: ${id}`);
    }
  }
}
