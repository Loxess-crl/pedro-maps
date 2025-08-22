export interface PaginationResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  perPage: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}
