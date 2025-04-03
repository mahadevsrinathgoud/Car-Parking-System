# Car Parking System.
A RESTful API  implement for a car parking system.

## Data Models

- ParkingSpace
  - spot_no: number
  - is_reserved: boolean
  - registration_no: string | null
- Vehicle
  - registration_no: string
  - color: string
- Booking (Implicit)
  - registration_no: string
### Relationships and Embedding

- ParkingLot
  - embeds ParkingSpaces

---
## Notes
-Implemented in NestJS with TypeScript.
-Uses arrays and maps to store related information. 
## APIs

- `POST /parking/parking_lots/init`     - Initialize the Parking Lot System
- `PATCH /parking/parking_lots/expand`   - Expand the capacity of existing Parking Lot System
- `POST /parking/parking_spaces/park`   - Park a Vehicle
- `POST /parking/parking_spaces/leave`  - Unpark a Vehicle
- `GET /parking/parking_spaces/status` - Get Parking Space Status
- `GET /parking/parking_spaces/registration_numbers/:color` - Get All Registered Vehicles with a Specific Color
- `GET /parking/parking_spaces/slots/:color`               - Get All Parking Slots with a Specific Color
- `GET /parking/parking_spaces/slot?registrationNumber={registrationNumber}` - Get Parking Slot for a Specific Vehicle Registration
- `PUT /parking/parking_spaces/:slotNumber` - Update Parking Slot Information
- `DELETE /parking/parking_spaces/:slotNumber` - Delete a Parking Slot from System

---
## Assumptions

- The parking lot is initialized before any other operations.
- Slot numbers increase as the distance from the entry point increases.
- The system allocates the nearest available slot to a car.
- A car can only be parked if there is an available slot.
- When unparking a car by registration number, the first matching slot is cleared.

## Features

- RESTful API design.
- Uses NestJS and TypeScript for a scalable and maintainable architecture.
- In-memory data storage using arrays and maps.
- Implements all required functionalities: initialization, expansion, allocation, deallocation, and status retrieval.
- Includes error handling for various scenarios (e.g., parking lot full, invalid input).
- Implements Unit Tests with Jest
- Implements README markdown file

## Installation

```
# Using npm
npm install
```

## Running

```
# For Local Development
npm run start:dev

# On Production
npm run start
```

## Functionality Testing

```
# Initialize the Parking Lot System
curl -X POST -H "Content-Type: application/json" -d '{"no_of_slot": 6}' http://localhost:3000/parking/parking_lots/init

# Expand Parking Lot System
curl -X PATCH -H "Content-Type: application/json" -d '{"increment_slot": 3}' http://localhost:3000/parking/parking_lots/expand

# Park a Vehicle
curl -X POST -H "Content-Type: application/json" -d '{"registrationNumber": "KA-01-AB-2211", "color": "white"}' http://localhost:3000/parking/parking_spaces/park

# Unpark a Vehicle (by slot number)
curl -X POST -H "Content-Type: application/json" -d '{"slot_number": 1}' http://localhost:3000/parking/parking_spaces/leave

# Unpark a Vehicle (by registration number)
curl -X POST -H "Content-Type: application/json" -d '{"car_registration_no": "KA-01-AB-2211"}' http://localhost:3000/parking/parking_spaces/leave

# Get Parking Space Status
curl http://localhost:3000/parking/parking_spaces/status

# Get All Registered Vehicles with a Specific Color
curl http://localhost:3000/parking/parking_spaces/registration_numbers/white

# Get All Parking Slots with a Specific Color
curl http://localhost:3000/parking/parking_spaces/slots/white

# Get Parking Slot for a Specific Vehicle Registration
curl http://localhost:3000/parking/parking_spaces/slot?registrationNumber=KA-01-AB-2211

# Update Parking Slot Information
curl -X PUT -H "Content-Type: application/json" -d '{"registrationNumber": "KA-01-CD-5678", "color": "black"}' http://localhost:3000/parking/parking_spaces/1

# Delete a Parking Slot from System
curl -X DELETE http://localhost:3000/parking/parking_spaces/1
```

### Development Notes
```
* Implemented all the steps in the problem statement
* Implemented unit tests with Jest
* Used TypeScript
* Implemented error handling
* Refactored and reviewed code multiple times.
```
