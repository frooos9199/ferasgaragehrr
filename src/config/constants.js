export const FORD_MODELS = [
  'F-150', 'F-150 Raptor', 'F-250', 'F-350', 'F-450',
  'Expedition', 'Expedition Max', 'Explorer', 'Explorer ST',
  'Mustang', 'Mustang GT', 'Shelby GT500',
  'Bronco', 'Bronco Sport', 'Ranger', 'Ranger Raptor',
  'Edge', 'Edge ST', 'Escape', 'Taurus', 'Crown Victoria',
  'Flex', 'Fusion', 'EcoSport', 'Transit'
]

export const SERVICE_TYPES = ['maintenance', 'repair', 'programming']

export const WORK_ORDER_STATUS = [
  'received', 'diagnosis', 'in_progress', 'done', 'delivered'
]

export const STATUS_COLORS = {
  received: 'bg-blue-500',
  diagnosis: 'bg-yellow-500',
  in_progress: 'bg-orange-500',
  done: 'bg-green-500',
  delivered: 'bg-gray-500',
}

export const USER_ROLES = { ADMIN: 'admin', TECHNICIAN: 'technician' }

export const WHATSAPP_NUMBER = '96550540999'

export const CURRENCY = 'KWD'

export const WORK_ORDER_TEMPLATES = [
  {
    id: 'periodic',
    services: ['oil_change', 'filter_change', 'inspection'],
  },
  {
    id: 'computer',
    services: ['ecu_diagnostic', 'code_reading'],
  },
  {
    id: 'brakes',
    services: ['brake_pads', 'brake_discs', 'brake_fluid'],
  },
]

export const YEARS = Array.from({ length: 35 }, (_, i) => 2025 - i)
