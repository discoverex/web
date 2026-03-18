export interface WrappedResponse<T> {
  status: number | string;
  data: T;
  message?: string;
}
