// JobCard data model (for demo, using local array)
export const jobCards = [
  // Example:
  // {
  //   id: '1',
  //   carNumber: '12345',
  //   vin: '1FAFP404X1F123456',
  //   make: 'Ford',
  //   model: 'Mustang',
  //   year: 2020,
  //   specs: 'GT, 5.0L V8, Automatic',
  //   issues: ['Check engine light', 'ABS fault'],
  //   fixed: ['ABS fault'],
  //   notes: 'Customer requests full checkup',
  //   createdAt: '2025-11-24T20:00:00Z'
  // }
];

// JobCard type for TypeScript/prop validation
export const jobCardFields = [
  'carNumber', 'vin', 'make', 'model', 'year', 'specs', 'issues', 'fixed', 'notes', 'createdAt'
];
