# Migration Plan: Single Vehicle with Multiple Service Records

## Current System:
- Each Job Card = New entry (duplicate vehicles)
- No history tracking
- Same car creates multiple Job Cards

## New System:
```
Vehicle (السيارة)
├── Basic Info (تسجل مرة واحدة)
│   ├── Car Number (رقم اللوحة)
│   ├── VIN
│   ├── Make (Ford)
│   ├── Model (Mustang)
│   ├── Year (2020)
│   ├── Specs
│   ├── Owner Name
│   └── Owner Phone
│
└── Service Records (سجلات الصيانة - متعددة)
    ├── Service #1
    │   ├── Date
    │   ├── Issues
    │   ├── Repairs
    │   ├── Parts
    │   ├── Cost
    │   ├── Status
    │   └── Images
    │
    ├── Service #2
    │   └── ...
    │
    └── Service #3
        └── ...
```

## Database Structure:

### Collection: `vehicles`
```javascript
{
  id: "auto-generated",
  carNumber: "12345",
  vin: "1FA6P8TH9J5123456",
  make: "Ford",
  model: "Mustang",
  year: 2020,
  specs: "GT Premium",
  ownerName: "أحمد محمد",
  ownerPhone: "+96512345678",
  createdAt: timestamp,
  lastServiceDate: timestamp,
  totalServices: 3
}
```

### Sub-Collection: `vehicles/{vehicleId}/services`
```javascript
{
  id: "auto-generated",
  serviceDate: "2025-12-05",
  entryDate: "2025-12-05",
  expectedDelivery: "2025-12-10",
  status: "In Progress",
  issues: ["Engine problem", "AC not working"],
  fixed: ["Replaced spark plugs"],
  notes: "Customer complained about...",
  parts: [
    { name: "Spark Plug", price: 50, qty: 4 }
  ],
  laborCost: 100,
  discount: 10,
  images: ["base64..."],
  createdAt: timestamp,
  updatedAt: timestamp,
  serviceNumber: 1
}
```

## Benefits:
✅ No duplicate vehicles
✅ Complete service history per car
✅ Easy to track repeat customers
✅ Better analytics
✅ QR code shows full history

## Implementation Steps:
1. Create new Vehicle form (one-time registration)
2. Service form appears after selecting vehicle
3. Migrate existing Job Cards to new structure
4. Update Gallery to group by vehicle
5. Update QR codes to show vehicle + all services

## User Workflow:
1. Search for car by plate number
2. If exists → Add new service
3. If new → Register vehicle first, then add service
