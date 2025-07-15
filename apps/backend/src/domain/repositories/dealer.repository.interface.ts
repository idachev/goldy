import { Dealer } from '../entities/dealer.entity';

export interface IDealerRepository {
  findAll(): Promise<Dealer[]>;
  findById(id: string): Promise<Dealer | null>;
  findByName(name: string): Promise<Dealer | null>;
  findActive(): Promise<Dealer[]>;
  create(dealer: Omit<Dealer, 'id' | 'createdAt' | 'listings'>): Promise<Dealer>;
  update(id: string, dealer: Partial<Dealer>): Promise<Dealer | null>;
  delete(id: string): Promise<boolean>;
}