export interface IPackage {
  id?: string;
  name: string;
  price: string;
  upload_speed: string; // e.g. "10M"
  download_speed: string; // e.g. "10M"
  type: "home" | "corporate";
  pool: string;
  simultaneos_users: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
