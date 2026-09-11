export type UserRole = 'admin' | 'operator' | 'petugas_muatan' | 'kasir';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type ShipStatus = 'Aktif Berlayar' | 'Sandar di Pelabuhan' | 'Docking / Perawatan' | 'Siaga';

export interface Ship {
  id: string;
  code: string; // e.g. KMP-01
  name: string; // e.g. KMP Batumandi
  type: 'Ferry Ro-Ro' | 'Cargo / Kontainer' | 'Fast Boat' | 'Kapal Motor Penumpang';
  passengerCapacity: number; // Max pax
  cargoCapacityDWT: number; // in Ton (Deadweight tonnage)
  maxVehicles: number; // Max vehicle units
  deckCount: number;
  yearBuilt: number;
  captainName: string;
  callSign: string;
  lengthMeters: number;
  breadthMeters: number;
  status: ShipStatus;
  currentLocation?: string;
  photoUrl?: string;
}

export interface Port {
  id: string;
  code: string; // e.g. MRK
  name: string; // e.g. Pelabuhan Merak
  city: string; // e.g. Cilegon
  province: string; // e.g. Banten
  dockCount: number;
  latitude: number;
  longitude: number;
  activeDocks: string[]; // e.g. ['Dermaga 1', 'Dermaga 2 Eksekutif', 'Dermaga 3']
}

export interface Route {
  id: string;
  code: string; // e.g. MRK-BKH
  name: string; // Merak - Bakauheni
  originPortId: string;
  destinationPortId: string;
  distanceNm: number; // Nautical miles
  estimatedDurationHours: number;
  baseFarePassenger: number; // in IDR
  baseFareCargoPerTon: number; // in IDR
}

export type VehicleOrCargoCategory = 
  | 'Golongan I (Sepeda Dayung)'
  | 'Golongan II (Sepeda Motor <250cc)'
  | 'Golongan III (Sepeda Motor >250cc)'
  | 'Golongan IV (Mobil Pribadi / Sedan / Minibus)'
  | 'Golongan V (Bus Sedang / Truk Sedang)'
  | 'Golongan VI (Bus Besar / Truk Besar)'
  | 'Golongan VII (Truk Tronton / Trailer)'
  | 'Kargo Curah / Pallet'
  | 'Kontainer 20ft'
  | 'Kontainer 40ft';

export interface CargoCategoryMaster {
  id: string;
  code: string;
  name: VehicleOrCargoCategory;
  categoryType: 'Kendaraan' | 'Barang Kargo';
  standardWeightTon: number;
  fare: number; // in IDR
  description: string;
}

export type ScheduleStatus = 'Terjadwal' | 'Boarding' | 'Berlayar' | 'Tiba' | 'Dibatalkan' | 'Ditunda (Cuaca)';

export interface VoyageSchedule {
  id: string;
  tripNumber: string; // e.g. VOY-2026-081
  shipId: string;
  routeId: string;
  dockName: string;
  departureTime: string; // ISO string
  estimatedArrivalTime: string; // ISO string
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  status: ScheduleStatus;
  weatherCondition: 'Normal / Laut Tenang' | 'Waspada Gelombang 1.5 - 2.5m' | 'Cuaca Buruk / Gelombang > 2.5m';
  notes?: string;
}

export type TicketStatus = 'Terbit' | 'Checked-in' | 'Boarded' | 'Batal';

export interface PassengerTicket {
  id: string;
  ticketNumber: string; // e.g. TIX-202609-0012
  scheduleId: string;
  passengerName: string;
  identityType: 'KTP' | 'Paspor' | 'SIM' | 'Kartu Identitas Anak';
  identityNumber: string;
  gender: 'L' | 'P';
  age: number;
  passengerType: 'Dewasa' | 'Anak' | 'Bayi';
  seatClass: 'Ekonomi' | 'Bisnis' | 'VIP Eksekutif';
  seatNumber?: string;
  fare: number;
  status: TicketStatus;
  bookingDate: string;
  checkInTime?: string;
  qrCodeToken: string;
}

export type CargoStatus = 'Terdaftar' | 'Ditimbang' | 'Dimuat' | 'Dimuat (Loaded)' | 'Selesai Bongkar' | 'Ditolak (Overweight)';

export interface CargoItem {
  id: string;
  manifestNumber: string; // e.g. CRG-202609-0045 or MFS-2026-1042
  scheduleId: string;
  categoryId?: string;
  categoryName?: VehicleOrCargoCategory;
  category?: VehicleOrCargoCategory | string;
  description?: string;
  plateNumber?: string; // e.g. B 9421 UZX
  vehiclePlateNumber?: string;
  driverName?: string;
  driverPhone?: string;
  companyName?: string; // Ekspedisi PT Logistik Cepat
  weightTon: number;
  measuredWeightTon?: number;
  dimensionM3?: number;
  deckPosition?: string; // e.g. Dek Bawah (Car Deck 1), Dek Atas (Main Deck)
  deckLocation?: string;
  fare: number;
  status: CargoStatus;
  createdAt?: string;
  registeredAt?: string;
  loadedAt?: string;
  verifiedAt?: string;
  notes?: string;
}

export type DatabaseProviderType = 'local' | 'supabase' | 'neon' | 'firebase';

export interface DatabaseConfig {
  activeProvider: DatabaseProviderType;
  activeEngine?: 'supabase' | 'neon' | 'firebase' | 'local';
  isConnected?: boolean;
  provider?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  neonConnectionString?: string;
  neonHost?: string;
  neonApiKey?: string;
  firebaseProjectId?: string;
  firebaseApiKey?: string;
  firebaseAppId?: string;
  supabase: {
    url: string;
    anonKey: string;
    connected: boolean;
    lastPing?: string;
    lastSync?: string;
    tablePrefix?: string;
  };
  neon: {
    connectionString: string;
    connected: boolean;
    lastPing?: string;
    lastSync?: string;
  };
  firebase: {
    apiKey: string;
    projectId: string;
    appId: string;
    connected: boolean;
    lastPing?: string;
    lastSync?: string;
  };
  autoSync: boolean;
}

export interface OperationalAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: string;
  shipId?: string;
}
