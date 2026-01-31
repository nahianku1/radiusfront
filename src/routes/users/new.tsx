// src/routes/users/new.tsx
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
// Card imports removed as they are unused after the redesign
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  UserPlus,
  User,
  MapPin,
  Lock,
  Package as PackageIcon,
  Calendar,
  Clock,
  Ban,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { IUser } from "@/types/user.interface";
import type { IPackage } from "@/types/package.interface";
import type { INas } from "@/types/nas.interface";

import { format, parse, isValid } from "date-fns";

export const Route = createFileRoute("/users/new")({
  component: NewUserPage,
});

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const RADIUS_DATE_FORMAT = "dd MMM yyyy HH:mm:ss";
const DB_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
const ONLY_DATE_FORMAT = "yyyy-MM-dd";
const ONLY_TIME_FORMAT = "HH:mm";

const generateUserId = (): number =>
  Math.floor(100000 + Math.random() * 900000);

function NewUserPage() {
  const [loading, setLoading] = React.useState(false);
  const [packages, setPackages] = React.useState<IPackage[]>([]);
  const [nasList, setNasList] = React.useState<INas[]>([]);
  const [sameAsPermanent, setSameAsPermanent] = React.useState(false);

  const toRadiusDate = (date: Date | null): string =>
    date && isValid(date) ? format(date, RADIUS_DATE_FORMAT) : "";
  const fromRadiusDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
      const parsed = parse(dateStr, RADIUS_DATE_FORMAT, new Date());
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const toDbDateTime = (date: Date | null): string =>
    date && isValid(date) ? format(date, DB_DATETIME_FORMAT) : "";
  const fromDbDateTime = React.useCallback(
    (dateStr: string | undefined): Date | null => {
      if (!dateStr) return null;
      try {
        // Try DB format first
        let parsed = parse(dateStr, DB_DATETIME_FORMAT, new Date());
        if (isValid(parsed)) return parsed;
        // Fallback to simple date without seconds if necessary
        parsed = parse(dateStr, "yyyy-MM-dd HH:mm", new Date());
        return isValid(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    [],
  );

  const getOnlyDate = React.useCallback(
    (dateStr: string | undefined): Date | null => {
      const d = fromDbDateTime(dateStr);
      return d;
    },
    [fromDbDateTime],
  );

  const getOnlyTime = React.useCallback(
    (dateStr: string | undefined): string => {
      const d = fromDbDateTime(dateStr);
      return d ? format(d, ONLY_TIME_FORMAT) : "00:00";
    },
    [fromDbDateTime],
  );

  const combineDateTime = React.useCallback(
    (date: Date | null, timeStr: string): string => {
      if (!date) return "";
      const datePart = format(date, ONLY_DATE_FORMAT);
      return `${datePart} ${timeStr}:00`;
    },
    [],
  );

  const RADIUS_DATE_NO_SECONDS_FORMAT = "dd MMM yyyy HH:mm";
  const toRadiusDateNoSeconds = (date: Date | null): string =>
    date && isValid(date) ? format(date, RADIUS_DATE_NO_SECONDS_FORMAT) : "";

  const [formData, setFormData] = React.useState<IUser>({
    userid: generateUserId(),
    name: "",
    corporate_name: "",
    email: "",
    mobile: "",
    permanent_address: "",
    present_address: "",
    connection_type: "home",

    // Flattened connection defaults
    username: "",
    password: "",
    ip_type: "package",
    static_ip: "",
    p2p_block: "",
    package_id: 0,
    expiry_date: toRadiusDate(new Date(Date.now() + 31 * 24 * 60 * 60 * 1000)),
    billing_date: toDbDateTime(new Date()),
    disable_type: "none",
    disable_weekdays: [],
    disable_time_start: "",
    disable_time_end: "",
    connectivity: "",
    nas: 0,
  });

  React.useEffect(() => {
    if (sameAsPermanent) {
      setFormData((prev) => ({
        ...prev,
        present_address: prev.permanent_address,
      }));
    }
  }, [formData.permanent_address, sameAsPermanent]);

  React.useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/services/getall-service`,
        );
        setPackages(response.data.data);
      } catch (error) {
        console.error("Failed to fetch packages", error);
        toast.error("Failed to load packages");
      }
    };
    const fetchNas = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/nas/getall-nas`,
        );
        setNasList(response.data.data);
      } catch (error) {
        console.error("Failed to fetch NAS devices", error);
      }
    };
    fetchPackages();
    fetchNas();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
      package_id: id === "connection_type" ? 0 : prev.package_id,
    }));
  };

  const handleConnectionChange = (field: keyof IUser, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConnectionWeekdayChange = (day: string) => {
    setFormData((prev) => {
      const currentWeekdays = prev.disable_weekdays;
      const updatedWeekdays = currentWeekdays.includes(day)
        ? currentWeekdays.filter((d) => d !== day)
        : [...currentWeekdays, day];

      return {
        ...prev,
        disable_weekdays: updatedWeekdays,
      };
    });
  };

  const handleToggleAllWeekdaysForConnection = () => {
    setFormData((prev) => {
      const currentLen = prev.disable_weekdays.length;
      return {
        ...prev,
        disable_weekdays: currentLen === WEEKDAYS.length ? [] : [...WEEKDAYS],
      };
    });
  };

  const generateTimeRule = (connection: IUser): string => {
    let timePart = "";
    if (connection.disable_time_start && connection.disable_time_end) {
      const start = connection.disable_time_start.replace(":", "");
      const end = connection.disable_time_end.replace(":", "");
      timePart = `${start}-${end}`;
    }

    if (!timePart || connection.disable_weekdays.length === 0) return "";

    // If all days are selected with the same time, return Al{timePart} shorthand
    if (connection.disable_weekdays.length === 7) {
      return `Al${timePart}`;
    }

    // Include ONLY explicitly selected weekdays with their time range
    const rules = connection.disable_weekdays.map((day) => {
      const dayCode = day.slice(0, 2);
      return `${dayCode}${timePart}`;
    });

    return rules.join(",");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Helper to convert empty strings to null
    const sanitizePayload = (data: any): any => {
      if (data === "" || data === null || data === undefined) return undefined;
      if (Array.isArray(data)) {
        const filtered = data
          .map(sanitizePayload)
          .filter((v) => v !== undefined);
        return filtered.length > 0 ? filtered : undefined;
      }
      if (typeof data === "object") {
        const result = {} as any;
        let hasValue = false;
        Object.keys(data).forEach((key) => {
          const value = sanitizePayload(data[key]);
          if (value !== undefined) {
            result[key] = value;
            hasValue = true;
          }
        });
        return hasValue ? result : undefined;
      }
      return data;
    };

    // Payload is essentially formData now, as we handle timestamps directly in state
    const rawPayload = {
      ...formData,
      expiry_date:
        formData.connection_type === "corporate"
          ? null
          : toRadiusDateNoSeconds(fromRadiusDate(formData.expiry_date)),
      disable_weekdays: generateTimeRule(formData),
    };

    // Remove client-only helper fields
    const cleanPayload = { ...rawPayload } as any;
    delete cleanPayload.ip_type;
    delete cleanPayload.disable_type;
    delete cleanPayload.package_name;
    delete cleanPayload.disable_time_start;
    delete cleanPayload.disable_time_end;
    delete cleanPayload.disable_whole_day;

    const payload = sanitizePayload(cleanPayload);

    console.log(payload);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/create-users`,
        payload,
      );
      toast.success("User created successfully");
      // Reset form
      setFormData({
        userid: generateUserId(),
        name: "",
        corporate_name: "",
        email: "",
        mobile: "",
        permanent_address: "",
        present_address: "",
        connection_type: "home",
        username: "",
        password: "",
        ip_type: "package",
        static_ip: "",
        p2p_block: "",
        package_id: 0,
        expiry_date: toRadiusDate(
          new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
        ),
        billing_date: toDbDateTime(new Date()),
        disable_type: "none",
        disable_weekdays: [],
        disable_time_start: "",
        disable_time_end: "",
        connectivity: "",
        nas: 0,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/30 -m-4 md:-m-8">
      {/* Page Header */}
      <header className="px-8 py-6 border-b bg-white shrink-0 z-10 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Create New User Account
              </h2>
              <p className="text-slate-500 text-sm">
                Configure profile, security, and networking settings for a new
                subscriber.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="px-8 pb-12">
        <form
          id="new-user-form"
          onSubmit={handleSubmit}
          className="max-w-7xl mx-auto space-y-10"
        >
          {/* Row 1: Primary Info & Address */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information Card */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider pb-2 border-b">
                <User className="h-4 w-4" /> Personal Profile
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.connection_type === "home" ? (
                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                      className="bg-slate-50/50 focus:bg-white transition-colors"
                    />
                  </div>
                ) : (
                  <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                    <Label htmlFor="corporate_name">Corporate Name *</Label>
                    <Input
                      id="corporate_name"
                      value={formData.corporate_name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          corporate_name: e.target.value,
                        })
                      }
                      placeholder="Acme Corp"
                      required
                      className="bg-slate-50/50 focus:bg-white transition-colors"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                    className="bg-slate-50/50 focus:bg-white transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    placeholder="017XXXXXXXX"
                    className="bg-slate-50/50 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                  <MapPin className="h-4 w-4" /> Location Details
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-blue-600 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    checked={sameAsPermanent}
                    onChange={(e) => setSameAsPermanent(e.target.checked)}
                    className="rounded-sm border-blue-200 text-blue-600 focus:ring-blue-500"
                  />
                  Link Addresses
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="permanent_address">Permanent Address *</Label>
                  <Input
                    id="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleInputChange}
                    required
                    placeholder="Village, P.O, District"
                    className="bg-slate-50/50 focus:bg-white transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="present_address">Present Address *</Label>
                  <Input
                    id="present_address"
                    value={formData.present_address}
                    onChange={handleInputChange}
                    required
                    disabled={sameAsPermanent}
                    placeholder="House, Road, Area"
                    className={cn(
                      "bg-slate-50/50 focus:bg-white transition-all",
                      sameAsPermanent &&
                        "opacity-50 cursor-not-allowed bg-slate-100",
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Connection Settings */}
          <div className="bg-white p-8 rounded-xl border shadow-sm space-y-8">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider pb-2 border-b">
              <Lock className="h-4 w-4" /> Technical Configuration
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-6">
                <div>
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                    NETWORK TYPE
                  </Label>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="connection_type">Connection Type *</Label>
                      <Select
                        onValueChange={(v) =>
                          handleSelectChange("connection_type", v)
                        }
                        value={formData.connection_type}
                      >
                        <SelectTrigger className="bg-slate-50/50 focus:bg-white h-11">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home / Personal</SelectItem>
                          <SelectItem value="corporate">
                            Corporate / Business
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="connectivity">
                        Medium / Connectivity *
                      </Label>
                      <Input
                        id="connectivity"
                        value={formData.connectivity}
                        onChange={(e) =>
                          handleConnectionChange("connectivity", e.target.value)
                        }
                        required
                        placeholder="Fiber/Wireless"
                        className="bg-slate-50/50 focus:bg-white h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nas">NAS Device *</Label>
                      <Select
                        onValueChange={(v) =>
                          handleConnectionChange("nas", Number(v))
                        }
                        value={formData.nas ? String(formData.nas) : ""}
                      >
                        <SelectTrigger className="bg-slate-50/50 focus:bg-white h-11 transition-all">
                          <SelectValue placeholder="Select NAS Device" />
                        </SelectTrigger>
                        <SelectContent>
                          {nasList.map((nas) => (
                            <SelectItem key={nas.id} value={String(nas.id)}>
                              <div className="flex flex-col">
                                <span className="font-bold">
                                  {nas.shortname}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {nas.nasname}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                    ACCESS CREDENTIALS
                  </Label>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="username">RADIUS Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          handleConnectionChange("username", e.target.value)
                        }
                        required
                        placeholder="username_radius"
                        className="bg-slate-50/50 focus:bg-white h-11 font-mono text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Access Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleConnectionChange("password", e.target.value)
                        }
                        required
                        placeholder="••••••••"
                        className="bg-slate-50/50 focus:bg-white h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">
                    IP ALLOCATION
                  </Label>
                  <div className="flex flex-col gap-3 p-4 bg-slate-50/30 rounded-xl border border-slate-100 mb-4">
                    {["package", "static", "point_to_point"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-3 cursor-pointer group px-2 py-1.5 rounded-md hover:bg-white transition-colors"
                      >
                        <input
                          type="radio"
                          name="ip_type"
                          value={type}
                          checked={formData.ip_type === type}
                          onChange={() =>
                            handleConnectionChange("ip_type", type)
                          }
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold capitalize text-slate-600 group-hover:text-slate-900 transition-colors">
                          {type.replace(/_/g, " ")}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="min-h-[70px]">
                    {formData.ip_type === "static" && (
                      <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                        <Label htmlFor="static_ip">Static IP Address *</Label>
                        <Input
                          id="static_ip"
                          value={formData.static_ip}
                          onChange={(e) =>
                            handleConnectionChange("static_ip", e.target.value)
                          }
                          required
                          placeholder="0.0.0.0"
                          className="bg-blue-50/30 border-blue-100 focus:bg-white h-11"
                        />
                      </div>
                    )}
                    {formData.ip_type === "point_to_point" && (
                      <div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
                        <Label htmlFor="p2p_block">P2P IP Block *</Label>
                        <Input
                          id="p2p_block"
                          value={formData.p2p_block}
                          onChange={(e) =>
                            handleConnectionChange("p2p_block", e.target.value)
                          }
                          required
                          placeholder="10.0.0.0/24"
                          className="bg-blue-50/30 border-blue-100 focus:bg-white h-11"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="border-slate-100" />

          {/* Row 3: Package & Billing and Disabling Policies */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            {/* Package & Billing */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider pb-2 border-b">
                <PackageIcon className="h-4 w-4" /> Service & Billing
              </div>
              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 font-semibold">
                    <PackageIcon className="h-3.5 w-3.5 text-blue-500" />{" "}
                    Subscription Plan *
                  </Label>
                  <Select
                    onValueChange={(v) =>
                      handleConnectionChange("package_id", Number(v))
                    }
                    value={
                      formData.package_id ? String(formData.package_id) : ""
                    }
                  >
                    <SelectTrigger className="bg-slate-50/50 focus:bg-white h-11">
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages
                        .filter(
                          (p) =>
                            p.type?.toLowerCase() === formData.connection_type,
                        )
                        .map((pkg) => (
                          <SelectItem key={pkg.id} value={String(pkg.id)}>
                            {pkg.name} ({pkg.price} BDT)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.connection_type !== "corporate" && (
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2 font-semibold text-slate-700">
                      <Clock className="h-4 w-4 text-amber-500" /> Account
                      Expiry
                    </Label>
                    <div className="relative">
                      <DatePicker
                        selected={fromRadiusDate(formData.expiry_date)}
                        onChange={(date: Date | null) =>
                          handleConnectionChange(
                            "expiry_date",
                            date ? toRadiusDate(date) : "",
                          )
                        }
                        showTimeSelect
                        dateFormat="dd MMM yyyy HH:mm"
                        className="w-full h-11 rounded-md border bg-slate-50/50 px-3 py-2 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                      />
                      <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 font-semibold text-slate-700">
                    <Calendar className="h-4 w-4 text-purple-500" /> Cycle
                    Billing Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.billing_date}
                    onChange={(e) =>
                      handleConnectionChange("billing_date", e.target.value)
                    }
                    className="bg-slate-50/50 h-11 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Controls */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider pb-2 border-b">
                <Ban className="h-4 w-4" /> Access Restrictions
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Date/Range Disabling */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    TEMPORARY SUSPENSION
                  </Label>
                  <div className="flex items-center gap-3 p-1.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    {["none", "date", "range"].map((type) => (
                      <label
                        key={type}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer flex-1 py-2 px-4 rounded-lg transition-all text-center justify-center",
                          formData.disable_type === type
                            ? "bg-white shadow-sm border border-slate-200 text-blue-600 font-bold"
                            : "text-slate-400 hover:text-slate-600",
                        )}
                      >
                        <input
                          type="radio"
                          name="disable_type"
                          value={type}
                          checked={formData.disable_type === type}
                          onChange={() =>
                            handleConnectionChange("disable_type", type)
                          }
                          className="sr-only"
                        />
                        <span className="text-xs capitalize">{type}</span>
                      </label>
                    ))}
                  </div>

                  <div className="h-20 pt-2">
                    {formData.disable_type === "date" && (
                      <div className="relative animate-in fade-in slide-in-from-left-2">
                        <DatePicker
                          selected={getOnlyDate(formData.disable_date || "")}
                          onChange={(date: Date | null) =>
                            handleConnectionChange(
                              "disable_date",
                              date
                                ? `${format(date, ONLY_DATE_FORMAT)} 00:00:00`
                                : "",
                            )
                          }
                          dateFormat="yyyy-MM-dd"
                          className="w-full h-11 rounded-md border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                          placeholderText="Select Date"
                        />
                        <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                    {formData.disable_type === "range" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                        {/* Start Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                          <div className="relative">
                            <DatePicker
                              selected={getOnlyDate(
                                formData.disable_start_date || "",
                              )}
                              onChange={(date: Date | null) =>
                                handleConnectionChange(
                                  "disable_start_date",
                                  combineDateTime(
                                    date,
                                    getOnlyTime(
                                      formData.disable_start_date || "",
                                    ),
                                  ),
                                )
                              }
                              dateFormat="yyyy-MM-dd"
                              className="w-full h-11 rounded-md border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                              placeholderText="Start Date"
                            />
                            <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                          </div>
                          <Input
                            type="time"
                            value={getOnlyTime(
                              formData.disable_start_date || "",
                            )}
                            onChange={(e) =>
                              handleConnectionChange(
                                "disable_start_date",
                                combineDateTime(
                                  getOnlyDate(
                                    formData.disable_start_date || "",
                                  ),
                                  e.target.value,
                                ),
                              )
                            }
                            className="h-11 bg-white font-semibold"
                          />
                        </div>
                        {/* End Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative">
                            <DatePicker
                              selected={getOnlyDate(
                                formData.disable_end_date || "",
                              )}
                              onChange={(date: Date | null) =>
                                handleConnectionChange(
                                  "disable_end_date",
                                  combineDateTime(
                                    date,
                                    getOnlyTime(
                                      formData.disable_end_date || "",
                                    ),
                                  ),
                                )
                              }
                              dateFormat="yyyy-MM-dd"
                              className="w-full h-11 rounded-md border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                              placeholderText="End Date"
                            />
                            <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                          </div>
                          <Input
                            type="time"
                            value={getOnlyTime(formData.disable_end_date || "")}
                            onChange={(e) =>
                              handleConnectionChange(
                                "disable_end_date",
                                combineDateTime(
                                  getOnlyDate(formData.disable_end_date || ""),
                                  e.target.value,
                                ),
                              )
                            }
                            className="h-11 bg-white font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Weekday Time Restriction */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      WEEKLY ACCESS TIME
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleAllWeekdaysForConnection}
                      className="h-7 text-[10px] uppercase font-black text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full px-4"
                    >
                      {formData.disable_weekdays.length === 7
                        ? "Deselect All"
                        : "Allow All Week"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {WEEKDAYS.map((day) => (
                      <label
                        key={day}
                        className={cn(
                          "flex flex-col items-center justify-center p-2.5 rounded-xl border cursor-pointer transition-all duration-200",
                          formData.disable_weekdays.includes(day)
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 scale-105"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.disable_weekdays.includes(day)}
                          onChange={() => handleConnectionWeekdayChange(day)}
                        />
                        <span className="text-[11px] font-bold">
                          {day.slice(0, 3)}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <input
                      type="checkbox"
                      id="whole_day_access"
                      checked={formData.disable_whole_day || false}
                      onChange={(e) => {
                        const isWhole = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          disable_whole_day: isWhole,
                          disable_time_start: isWhole ? "00:00" : "09:00",
                          disable_time_end: isWhole ? "23:59" : "18:00",
                        }));
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                    />
                    <Label
                      htmlFor="whole_day_access"
                      className="text-[10px] font-bold text-slate-600 uppercase cursor-pointer"
                    >
                      Whole Day Access
                    </Label>
                  </div>

                  {formData.disable_weekdays.length > 0 &&
                    !formData.disable_whole_day && (
                      <div className="grid grid-cols-2 gap-4 pt-1 animate-in fade-in slide-in-from-right-2">
                        <div className="grid gap-1.5">
                          <Label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                            Daily Start
                          </Label>
                          <Input
                            type="time"
                            value={formData.disable_time_start}
                            onChange={(e) =>
                              handleConnectionChange(
                                "disable_time_start",
                                e.target.value,
                              )
                            }
                            className="h-10 text-xs font-bold bg-slate-50 border-slate-200"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                            Daily End
                          </Label>
                          <Input
                            type="time"
                            value={formData.disable_time_end}
                            onChange={(e) =>
                              handleConnectionChange(
                                "disable_time_end",
                                e.target.value,
                              )
                            }
                            className="h-10 text-xs font-bold bg-slate-50 border-slate-200"
                          />
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky Footer */}
      <footer className="px-8 py-6 border-t bg-white shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            className="px-8 h-12 text-base font-semibold border-slate-200 hover:bg-slate-50 rounded-xl"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            form="new-user-form"
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 px-12 h-12 text-lg font-bold transition-all hover:-translate-y-0.5 rounded-xl active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Finalizing
                Account...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-3 h-5 w-5" /> Create User Account
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
