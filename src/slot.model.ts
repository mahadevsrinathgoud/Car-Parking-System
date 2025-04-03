import { Car } from './car.model';

export interface Slot {
  slotNumber: number;
  isOccupied: boolean;
  car?: Car;
}
