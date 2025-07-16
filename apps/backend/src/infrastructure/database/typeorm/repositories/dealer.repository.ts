import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dealer } from '../../../../domain/entities/dealer.entity';
import { IDealerRepository } from '../../../../domain/repositories/dealer.repository.interface';

@Injectable()
export class DealerRepository implements IDealerRepository {
  constructor(
    @InjectRepository(Dealer)
    private readonly repository: Repository<Dealer>
  ) {}

  async findAll(): Promise<Dealer[]> {
    return this.repository.find({
      relations: ['listings'],
    });
  }

  async findById(id: string): Promise<Dealer | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['listings'],
    });
  }

  async findByName(name: string): Promise<Dealer | null> {
    return this.repository.findOne({
      where: { name },
      relations: ['listings'],
    });
  }

  async findActive(): Promise<Dealer[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['listings'],
    });
  }

  async create(
    dealer: Omit<Dealer, 'id' | 'createdAt' | 'listings'>
  ): Promise<Dealer> {
    const newDealer = this.repository.create(dealer);
    return this.repository.save(newDealer);
  }

  async update(id: string, dealer: Partial<Dealer>): Promise<Dealer | null> {
    await this.repository.update(id, dealer);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
