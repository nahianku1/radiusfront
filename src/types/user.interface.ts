export interface IUser {
  id?: string;
  userid: number;
  name?: string;
  corporate_name?: string;
  email: string;
  mobile: string;
  permanent_address: string;
  present_address: string;
  connection_type: "home" | "corporate";

  // Connection details (flattened)
  username: string;
  password: string;
  ip_type: "package" | "static" | "point_to_point";
  static_ip?: string;
  p2p_block?: string;
  package_id: number;
  package_name?: string; // Helper for display
  expiry_date: string; // "dd MMM yyyy HH:mm:ss"
  billing_date: string; // "dd MMM yyyy HH:mm:ss"
  disable_type: "none" | "date" | "range";
  disable_date?: string; // "dd MMM yyyy HH:mm:ss"
  disable_start_date?: string; // "dd MMM yyyy HH:mm:ss"
  disable_end_date?: string; // "dd MMM yyyy HH:mm:ss"
  disable_weekdays: string[]; // e.g. ["Monday", "Tuesday"]
  disable_time_start?: string; // e.g. "10:00"
  disable_time_end?: string; // e.g. "22:00"
  disable_whole_day?: boolean; // If true, sets time to 00:00-23:59
  connectivity: string;
  nas?: number;
  nas_name?: string;
  nas_ip?: string;
  status?: "online" | "offline" | "expired" | "disabled";

  created_at?: string;
  updated_at?: string;
}
