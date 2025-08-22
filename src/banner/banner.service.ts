import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { OrderBannersDto } from './dto/order-banners.dto';
import { BannerResponseDto, ActiveBannerResponseDto } from './dto/banner-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginate } from '../common/helpers/paginate.helper';
import { BannerFilesService } from './services/banner-files.service';
import { SerializedFile } from './interfaces/serialized-file.interface';

@Injectable()
export class BannerService {
  private readonly MAX_ACTIVE_BANNERS = 5;

  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    private readonly bannerFilesService: BannerFilesService,
  ) {}

  async create(createBannerDto: CreateBannerDto, file: SerializedFile): Promise<BannerResponseDto> {
    // Subir la imagen primero
    const fileBuffer = Buffer.from(file.buffer, 'base64');
    const uploadResult = await this.bannerFilesService.uploadImage({
      buffer: fileBuffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const banner = this.bannerRepository.create({
      ...createBannerDto,
      imageUrl: uploadResult.url,
    });
    
    if (createBannerDto.isActive !== false) {
      await this.handleActiveLimit(banner);
    }

    const savedBanner = await this.bannerRepository.save(banner);
    return this.mapToResponseDto(savedBanner);
  }

  async findAllPaginated(paginationDto: PaginationDto) {
    const {page = 1, limit = 10} = paginationDto;
    const queryBuilder = this.bannerRepository
      .createQueryBuilder('banner')
      .orderBy('banner.isActive', 'DESC')
      .addOrderBy('banner.order', 'ASC', 'NULLS LAST')
      .addOrderBy('banner.updatedAt', 'DESC').skip((page - 1) * limit).take(limit);

    const items = await queryBuilder.getMany();
    const bannerList = paginate(items, { page, limit });

    return bannerList;
  }

  async update(id: number, updateBannerDto: UpdateBannerDto, file?: SerializedFile): Promise<BannerResponseDto> {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    
    if (!banner) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Banner no encontrado',
      });
    }

    const wasActive = banner.isActive;
    let newImageUrl = banner.imageUrl;

    // Si se proporciona una nueva imagen, subirla y eliminar la anterior
    if (file) {
      // Subir nueva imagen
      const fileBuffer = Buffer.from(file.buffer, 'base64');
      const uploadResult = await this.bannerFilesService.uploadImage({
        buffer: fileBuffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
      
      newImageUrl = uploadResult.url;
      
      // Eliminar imagen anterior si existe
      if (banner.imageUrl) {
        try {
          const oldKey = this.extractKeyFromUrl(banner.imageUrl);
          if (oldKey) {
            await this.bannerFilesService.deleteImage(oldKey);
          }
        } catch (error) {
          // Log el error pero no fallar la actualización
          console.warn('No se pudo eliminar la imagen anterior:', error);
        }
      }
    }

    Object.assign(banner, updateBannerDto, { imageUrl: newImageUrl });

    if (updateBannerDto.isActive === true && !wasActive) {
      await this.handleActiveLimit(banner);
    } else if (updateBannerDto.isActive === false && wasActive) {
      banner.order = undefined;
    }

    const updatedBanner = await this.bannerRepository.save(banner);
    return this.mapToResponseDto(updatedBanner);
  }

  async orderBanners(orderBannersDto: OrderBannersDto) {

    try {
      console.log('Ordenando banners:', orderBannersDto);
    const { banners } = orderBannersDto;
    
    const bannerIds = banners.map(b => b.id);
    const existingBanners = await this.bannerRepository.find({
      where: { id: In(bannerIds) },
    });
      console.log('Ordenando banners 2:', orderBannersDto);

    if (existingBanners.length !== bannerIds.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Uno o más banners no existen',
      });
    }
      console.log('Ordenando banners 3:', orderBannersDto);

    const activeBanners = existingBanners.filter(b => b.isActive);
    if (activeBanners.length !== banners.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Solo se pueden ordenar banners activos',
      });
    }
      console.log('Ordenando banners 4:', orderBannersDto);

    await this.bannerRepository.manager.transaction(async manager => {
      for (const bannerOrder of banners) {
        await manager.update(Banner, bannerOrder.id, { order: bannerOrder.order });
      }
    });
      console.log('Ordenando banners 5:', orderBannersDto);
      return {
        ok: true,
      }

  }
  catch (error) {
    console.log('Error al ordenar banners:', error);
    throw new RpcException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error al ordenar banners',
    });
  }
}

  async findActiveOnly(): Promise<ActiveBannerResponseDto[]> {
    const now = new Date();
    
    const activeBanners = await this.bannerRepository.find({
      where: {
        isActive: true,
      },
      order: {
        order: 'ASC',
      },
    });

    const validBanners = activeBanners.filter(banner => {
      if (banner.startDate && banner.startDate > now) return false;
      if (banner.endDate && banner.endDate < now) return false;
      return true;
    });

    return validBanners.map(banner => ({
      id: banner.id,
      imageUrl: banner.imageUrl,
      title: banner.title,
      description: banner.description,
      link: banner.link,
      linkType: banner.linkType,
      order: banner.order,
      
    }));
  }

  private async handleActiveLimit(newBanner: Banner): Promise<void> {
    const activeCount = await this.bannerRepository.count({
      where: { isActive: true },
    });

    if (activeCount >= this.MAX_ACTIVE_BANNERS) {
      const oldestActive = await this.bannerRepository.findOne({
        where: { isActive: true },
        order: { updatedAt: 'ASC' },
      });

      if (oldestActive) {
        oldestActive.isActive = false;
        oldestActive.order = undefined; 
        await this.bannerRepository.save(oldestActive);
      }
    }

    newBanner.isActive = true;
    newBanner.order = this.MAX_ACTIVE_BANNERS;
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      // Extraer la key de una URL de S3
      // Ejemplo: https://bucket.s3.region.amazonaws.com/folder/file.jpg -> folder/file.jpg
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Remover el primer '/' si existe
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch (error) {
      return null;
    }
  }

  private mapToResponseDto(banner: Banner): BannerResponseDto {
    return {
      id: banner.id,
      imageUrl: banner.imageUrl,
      title: banner.title,
      description: banner.description,
      link: banner.link,
      linkType: banner.linkType,
      isActive: banner.isActive,
      order: banner.order,
      startDate: banner.startDate,
      endDate: banner.endDate,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  }
}
