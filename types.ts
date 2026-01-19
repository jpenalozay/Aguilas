
export enum DetectionType {
  LICENSE_PLATE = 'PLACA',
  MOTORCYCLE = 'MOTOCICLETA',
  CAR = 'AUTO',
  OTHER_VEHICLE = 'VEHÍCULO PESADO/BUS',
  WEAPON = 'ARMA',
  SUSPICIOUS_BEHAVIOR = 'COMPORTAMIENTO SOSPECHOSO',
  PREDICTED_CRIME = 'PREDICCIÓN DE ATRACO (IA)',
  CROWD_ANOMALY = 'ANOMALÍA DE MULTITUD'
}

export enum AlertLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  CRITICAL = 'CRITICAL'
}

export interface Incident {
  id: string;
  timestamp: Date;
  location: string;
  type: DetectionType;
  confidence: number;
  imageUrl?: string;
  metadata?: string;
  status: 'detectado' | 'policia_notificada' | 'neutralizado';
  isPredictive?: boolean;
}

export interface HistoricalDetection {
  id: string;
  plate: string;
  timestamp: Date;
  nodeId: string;
  location: string;
  coordinates: { lat: number; lng: number };
  speed?: number;
}

export interface StatisticsData {
  name: string;
  detections: number;
}
