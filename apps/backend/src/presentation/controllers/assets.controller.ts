import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { AssetDto, AssetType, MetalType } from '@goldy/shared/types';
import { ManageAssetsUseCase } from '../../application/use-cases/manage-assets.use-case';

interface CreateAssetRequest {
  name: string;
  manufacturerName: string;
  assetType: AssetType;
  metalType: MetalType;
  weightGrams: number;
  purity?: string;
}

interface UpdateAssetRequest {
  name?: string;
  manufacturerName?: string;
  assetType?: AssetType;
  metalType?: MetalType;
  weightGrams?: number;
  purity?: string;
}

interface AssetFiltersQuery {
  assetType?: AssetType;
  metalType?: MetalType;
  manufacturerName?: string;
}

@Controller('api/assets')
export class AssetsController {
  constructor(private readonly manageAssetsUseCase: ManageAssetsUseCase) {}

  @Get()
  async getAllAssets(@Query() filters: AssetFiltersQuery): Promise<AssetDto[]> {
    if (Object.keys(filters).length > 0) {
      return this.manageAssetsUseCase.getAssetsByFilters(filters);
    }
    return this.manageAssetsUseCase.getAllAssets();
  }

  @Get(':id')
  async getAssetById(@Param('id') id: string): Promise<AssetDto> {
    const asset = await this.manageAssetsUseCase.getAssetById(id);
    if (!asset) {
      throw new NotFoundException(`Asset not found with ID: ${id}`);
    }
    return asset;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAsset(
    @Body() createAssetRequest: CreateAssetRequest
  ): Promise<AssetDto> {
    return this.manageAssetsUseCase.createAsset(createAssetRequest);
  }

  @Put(':id')
  async updateAsset(
    @Param('id') id: string,
    @Body() updateAssetRequest: UpdateAssetRequest
  ): Promise<AssetDto> {
    const updatedAsset = await this.manageAssetsUseCase.updateAsset(
      id,
      updateAssetRequest
    );
    if (!updatedAsset) {
      throw new NotFoundException(`Asset not found with ID: ${id}`);
    }
    return updatedAsset;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAsset(@Param('id') id: string): Promise<void> {
    const deleted = await this.manageAssetsUseCase.deleteAsset(id);
    if (!deleted) {
      throw new NotFoundException(`Asset not found with ID: ${id}`);
    }
  }
}
