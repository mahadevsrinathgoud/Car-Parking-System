import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Car } from '../car.model';
import { Slot } from '../slot.model';

@Injectable()
export class ParkingService {
  private parkingSlots: Slot[] = [];
  private totalSlots: number = 0;

  initializeParkingLot(noOfSlot: number): { total_slot: number } {
    if (this.totalSlots > 0) {
      throw new HttpException('Parking lot already initialized', HttpStatus.BAD_REQUEST);
    }

    this.totalSlots = noOfSlot;
    this.parkingSlots = Array.from({ length: noOfSlot }, (_, i) => ({
      slotNumber: i + 1,
      isOccupied: false,
    }));

    return { total_slot: this.totalSlots };
  }

  expandParkingLot(incrementSlot: number): { total_slot: number } {
    if (incrementSlot <= 0) {
      throw new HttpException('Increment slot must be greater than 0', HttpStatus.BAD_REQUEST);
    }

    const newTotalSlots = this.totalSlots + incrementSlot;
    const newSlots = Array.from({ length: incrementSlot }, (_, i) => ({
      slotNumber: this.totalSlots + i + 1,
      isOccupied: false,
    }));

    this.parkingSlots = [...this.parkingSlots, ...newSlots];
    this.totalSlots = newTotalSlots;

    return { total_slot: this.totalSlots };
  }

  allocateParkingSlot(car: Car): { allocated_slot_number: number } {
    const availableSlot = this.parkingSlots.find((slot) => !slot.isOccupied);

    if (!availableSlot) {
      throw new HttpException('Parking lot is full', HttpStatus.BAD_REQUEST);
    }

    availableSlot.isOccupied = true;
    availableSlot.car = car;

    return { allocated_slot_number: availableSlot.slotNumber };
  }

  freeParkingSlot(body: { slot_number?: number; car_registration_no?: string }): { freed_slot_number: number } {
    let slot: Slot | undefined;

    if (body.slot_number) {
      slot = this.parkingSlots.find((s) => s.slotNumber === body.slot_number);
    } else if (body.car_registration_no) {
      slot = this.parkingSlots.find((s) => s.car?.registrationNumber === body.car_registration_no);
    } else {
      throw new HttpException('Invalid request. Provide either slot_number or car_registration_no', HttpStatus.BAD_REQUEST);
    }

    if (!slot) {
      throw new HttpException('Slot not found', HttpStatus.NOT_FOUND);
    }

    if (!slot.isOccupied) {
      throw new HttpException('Slot is already free', HttpStatus.BAD_REQUEST);
    }

    slot.isOccupied = false;
    slot.car = undefined;

    return { freed_slot_number: slot.slotNumber };
  }

//   getRegistrationNumbersByColor(color: string): string[] {
//     return this.parkingSlots
//       .filter((slot) => slot.isOccupied && slot.car?.color === color)
//       .map((slot) => slot.car.registrationNumber);
//   }

//   getSlotNumbersByColor(color: string): number[] {
//     return this.parkingSlots
//       .filter((slot) => slot.isOccupied && slot.car?.color === color)
//       .map((slot) => slot.slotNumber);
//   }

//   getOccupiedSlots(): any[] {
//     return this.parkingSlots
//       .filter((slot) => slot.isOccupied)
//       .map((slot) => ({
//         slot_no: slot.slotNumber,
//         registration_no: slot.car.registrationNumber,
//         color: slot.car.color,
//       }));
//   }
// }
getRegistrationNumbersByColor(color: string): string[] {
    return this.parkingSlots
      .filter((slot) => slot.isOccupied && slot.car?.color === color)
      .map((slot) => slot.car?.registrationNumber ?? ''); // Use optional chaining and nullish coalescing
  }

  getSlotNumbersByColor(color: string): number[] {
    return this.parkingSlots
      .filter((slot) => slot.isOccupied && slot.car?.color === color)
      .map((slot) => slot.slotNumber);
  }

  getOccupiedSlots(): any[] {
    return this.parkingSlots
      .filter((slot) => slot.isOccupied)
      .map((slot) => ({
        slot_no: slot.slotNumber,
        registration_no: slot.car?.registrationNumber ?? 'N/A', // Use optional chaining and nullish coalescing
        color: slot.car?.color ?? 'N/A', // Use optional chaining and nullish coalescing
      }));
  }
}