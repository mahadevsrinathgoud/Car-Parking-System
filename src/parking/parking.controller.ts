import {Controller,Get,Post,Body,Patch,Param,Delete,HttpException,HttpStatus,Put,UsePipes,ValidationPipe,Query,} from '@nestjs/common';
import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';
  
  class InitializeParkingLotDto {
    @IsNumber()
    @IsNotEmpty()
    no_of_slot: number;
  }
  
  class ExpandParkingLotDto {
    @IsNumber()
    @IsNotEmpty()
    increment_slot: number;
  }
  
  class ParkCarDto {
    @IsString()
    @IsNotEmpty()
    registrationNumber: string;
  
    @IsString()
    @IsNotEmpty()
    color: string;
  }
  
  class ClearSlotDto {
    @IsNumber()
    @IsOptional()
    slot_number?: number;
  
    @IsString()
    @IsOptional()
    car_registration_no?: string;
  }
  
  class UpdateSlotDto {
    @IsNumber()
    @IsNotEmpty()
    slotNumber: number;
  
    @IsString()
    @IsOptional()
    registrationNumber?: string;
  
    @IsString()
    @IsOptional()
    color?: string;
  }
  
  interface Car {
    registrationNumber: string;
    color: string;
  }
  
  interface Slot {
    slotNumber: number;
    isOccupied: boolean;
    car?: Car;
  }
  
  @Controller('parking')
  export class ParkingController {
    private parkingSlots: Slot[] = [];
    private totalSlots: number = 0;
  
    @Post('parking_lot')
    @UsePipes(new ValidationPipe({ transform: true }))
    initializeParkingLot(@Body() body: InitializeParkingLotDto): { total_slot: number } {
      if (this.totalSlots > 0) {
        throw new HttpException('Parking lot already initialized', HttpStatus.BAD_REQUEST);
      }
  
      this.totalSlots = body.no_of_slot;
      this.parkingSlots = Array.from({ length: body.no_of_slot }, (_, i) => ({
        slotNumber: i + 1,
        isOccupied: false,
      }));
  
      return { total_slot: this.totalSlots };
    }
  
    @Patch('parking_lot')
    @UsePipes(new ValidationPipe({ transform: true }))
    expandParkingLot(@Body() body: ExpandParkingLotDto): { total_slot: number } {
      if (body.increment_slot <= 0) {
        throw new HttpException('Increment slot must be greater than 0', HttpStatus.BAD_REQUEST);
      }
  
      const newTotalSlots = this.totalSlots + body.increment_slot;
      const newSlots = Array.from({ length: body.increment_slot }, (_, i) => ({
        slotNumber: this.totalSlots + i + 1,
        isOccupied: false,
      }));
  
      this.parkingSlots = [...this.parkingSlots, ...newSlots];
      this.totalSlots = newTotalSlots;
  
      return { total_slot: this.totalSlots };
    }
  
    @Post('park')
    @UsePipes(new ValidationPipe({ transform: true }))
    allocateParkingSlot(@Body() car: ParkCarDto): { allocated_slot_number: number } {
      const availableSlot = this.parkingSlots.find((slot) => !slot.isOccupied);
  
      if (!availableSlot) {
        throw new HttpException('Parking lot is full', HttpStatus.BAD_REQUEST);
      }
  
      availableSlot.isOccupied = true;
      availableSlot.car = {
        registrationNumber: car.registrationNumber,
        color: car.color,
      };
  
      return { allocated_slot_number: availableSlot.slotNumber };
    }
  
    @Post('clear')
    @UsePipes(new ValidationPipe({ transform: true }))
    freeParkingSlot(@Body() body: ClearSlotDto): { freed_slot_number: number } {
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
  
    @Get('registration_numbers/:color')
    getRegistrationNumbersByColor(@Param('color') color: string): string[] {
      return this.parkingSlots
        .filter((slot) => slot.isOccupied && slot.car?.color === color)
        .map((slot) => slot.car?.registrationNumber ?? '');
    }
  
    @Get('slot_numbers/:color')
    getSlotNumbersByColor(@Param('color') color: string): number[] {
      return this.parkingSlots
        .filter((slot) => slot.isOccupied && slot.car?.color === color)
        .map((slot) => slot.slotNumber);
    }
  
    @Get('status')
    getOccupiedSlots(): any[] {
      return this.parkingSlots
        .filter((slot) => slot.isOccupied)
        .map((slot) => ({
          slot_no: slot.slotNumber,
          registration_no: slot.car?.registrationNumber ?? 'N/A',
          color: slot.car?.color ?? 'N/A',
        }));
    }
  
    @Put(':slotNumber')
    @UsePipes(new ValidationPipe({ transform: true }))
    updateParkingSlot(@Param('slotNumber') slotNumber: string, @Body() body: UpdateSlotDto): Slot {
      const slotNo = parseInt(slotNumber, 10);
      if (isNaN(slotNo)) {
        throw new HttpException('Invalid slot number', HttpStatus.BAD_REQUEST);
      }
  
      const slot = this.parkingSlots.find((s) => s.slotNumber === slotNo);
      if (!slot) {
        throw new HttpException('Slot not found', HttpStatus.NOT_FOUND);
      }
  
      if (body.registrationNumber || body.color) {
        slot.car = {
          registrationNumber: body.registrationNumber ?? slot.car?.registrationNumber ?? '',
          color: body.color ?? slot.car?.color ?? '',
        };
        slot.isOccupied = true;
      } else {
        slot.car = undefined;
        slot.isOccupied = false;
      }
  
      return slot;
    }
  
    @Delete(':slotNumber')
    deleteParkingSlot(@Param('slotNumber') slotNumber: string): { message: string; total_slot: number } {
      const slotNo = parseInt(slotNumber, 10);
      if (isNaN(slotNo)) {
        throw new HttpException('Invalid slot number', HttpStatus.BAD_REQUEST);
      }
  
      const initialTotalSlots = this.totalSlots;
  
      this.parkingSlots = this.parkingSlots.filter((slot) => slot.slotNumber !== slotNo);
  
      if (this.parkingSlots.length === initialTotalSlots) {
        throw new HttpException('Slot not found', HttpStatus.NOT_FOUND);
      }
  
      this.totalSlots = this.parkingSlots.length;
  
      return { message: `Slot ${slotNumber} deleted successfully`, total_slot: this.totalSlots };
    }
    @Get('slot_number')
    getSlotNumberByRegistrationNumber(@Query('registrationNumber') registrationNumber: string): { slot_number: number | null } {
      const slot = this.parkingSlots.find((s) => s.isOccupied && s.car?.registrationNumber === registrationNumber);
  
      if (!slot) {
        return { slot_number: null };
      }
  
      return { slot_number: slot.slotNumber };
    }
  }
  
