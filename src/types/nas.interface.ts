export interface INas {
  id: number;
  nasname: string;
  shortname: string;
  secret: string;
  type: string;
  community?: string;
  description?: string;
  apiuser?: string;
  apipassword?: string;
  created_at: string;
  updated_at: string;
}
