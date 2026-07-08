export interface Seller {
  id: string; // e.g., 'jose', 'elmer', 'daniel', 'rossi'
  name: string;
  storeId: string; // '102' or '218'
  avatarColor: string; // Tailwind color for the vehicle/avatar
  carImage: string; // Car style/emoji
}

export interface MonthlyGoal {
  sellerId: string;
  month: string; // 'YYYY-MM'
  goalAmount: number; // in S/ con IGV
}

export interface DailyRecord {
  id: string;
  date: string; // 'YYYY-MM-DD'
  sellerId: string;
  storeId: string; // '102' or '218'
  salesWithTax: number; // Ventas con IGV (S/)
  salesWithoutTax: number; // Ventas sin IGV (S/)
  productsSold: number;
  clientsServed: number;
  cleanlinessPassed: boolean; // Sí/No
  punctualityPassed: boolean; // Sí/No
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  rewardBono: number; // S/ reward
  targetProduct: string; // name of product X
  targetQuantity: number; // quantity needed to complete
  active: boolean;
}

// Track progress of each salesperson towards the active mission
export interface MissionProgress {
  missionId: string;
  sellerId: string;
  progressCount: number; // products sold for this mission
}
