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
import { AssetListingDto } from '@goldy/shared/types';
import { ManageAssetListingsUseCase } from '../../application/use-cases/manage-asset-listings.use-case';

interface CreateAssetListingRequest {
  assetId: string;
  dealerId: string;
  productLink: string;
  isActive?: boolean;
}

interface UpdateAssetListingRequest {
  productLink?: string;
  isActive?: boolean;
}

interface AssetListingFiltersQuery {
  assetId?: string;
  dealerId?: string;
  active?: boolean;
}

@Controller('api/asset-listings')
export class AssetListingsController {
  constructor(
    private readonly manageAssetListingsUseCase: ManageAssetListingsUseCase
  ) {}

  @Get()
  async getListings(
    @Query() filters: AssetListingFiltersQuery
  ): Promise<AssetListingDto[]> {
    if (filters.active === true) {
      return this.manageAssetListingsUseCase.getActiveListings();
    }
    if (filters.assetId) {
      return this.manageAssetListingsUseCase.getListingsByAssetId(
        filters.assetId
      );
    }
    if (filters.dealerId) {
      return this.manageAssetListingsUseCase.getListingsByDealerId(
        filters.dealerId
      );
    }
    return this.manageAssetListingsUseCase.getAllListings();
  }

  @Get(':id')
  async getListingById(@Param('id') id: string): Promise<AssetListingDto> {
    const listing = await this.manageAssetListingsUseCase.getListingById(id);
    if (!listing) {
      throw new NotFoundException(`Asset listing not found with ID: ${id}`);
    }
    return listing;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createListing(
    @Body() createRequest: CreateAssetListingRequest
  ): Promise<AssetListingDto> {
    return this.manageAssetListingsUseCase.createListing(createRequest);
  }

  @Put(':id')
  async updateListing(
    @Param('id') id: string,
    @Body() updateRequest: UpdateAssetListingRequest
  ): Promise<AssetListingDto> {
    const updatedListing = await this.manageAssetListingsUseCase.updateListing(
      id,
      updateRequest
    );
    if (!updatedListing) {
      throw new NotFoundException(`Asset listing not found with ID: ${id}`);
    }
    return updatedListing;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteListing(@Param('id') id: string): Promise<void> {
    const deleted = await this.manageAssetListingsUseCase.deleteListing(id);
    if (!deleted) {
      throw new NotFoundException(`Asset listing not found with ID: ${id}`);
    }
  }
}
