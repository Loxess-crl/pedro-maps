export interface Schedule {
  id: number;
  t_start: string;
  t_end: string;
  sh_type: string;
  sh_date: string;
  sh_weekday: number;
  sh_description: string;
  route_id: number;
  driver_id: number;
  route: Route;
  driver: Driver;
}

export interface Driver {
  id: number;
  name: string;
  ln_pat: string;
  ln_mat: string;
  dni: string;
  address: string;
  email: string;
  phone: string;
  birthday: Date;
  active: number;
  created_at: Date;
  updated_at: Date;
}

export interface Route {
  id: number;
  name: string;
  description: string;
  points: Point[];
  created_at: Date;
  updated_at: Date;
}

export interface Point {
  id: number;
  latitude: string;
  longitude: string;
  route_id: number;
}
