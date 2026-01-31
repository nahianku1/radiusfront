import * as React from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  User,
  MapPin,
  Lock,
  Package as PackageIcon,
  Calendar,
  Clock,
  Ban,
  Loader2,
  Save,
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

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onSuccess: () => void;
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EditUserModalProps) {
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

  /* Removed unused toDbDateTime to fix lint error */
  const fromDbDateTime = React.useCallback((dateStr: string): Date | null => {
    if (!dateStr) return null;
    try {
      let parsed = parse(dateStr, DB_DATETIME_FORMAT, new Date());
      if (isValid(parsed)) return parsed;
      parsed = parse(dateStr, "yyyy-MM-dd HH:mm", new Date());
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  const getOnlyDate = React.useCallback(
    (dateStr: string | undefined): Date | null => {
      const d = fromDbDateTime(dateStr || "");
      return d;
    },
    [fromDbDateTime],
  );

  const getOnlyTime = React.useCallback(
    (dateStr: string | undefined): string => {
      const d = fromDbDateTime(dateStr || "");
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
    userid: 0,
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
    expiry_date: "",
    billing_date: "",
    disable_type: "none",
    disable_weekdays: [],
    disable_time_start: "",
    disable_time_end: "",
    connectivity: "",
    nas: 0,
  });

  // Fetch packages
  React.useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/services/getall-service`,
        );
        setPackages(response.data.data);
      } catch (error) {
        console.error("Failed to fetch packages", error);
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
    if (isOpen) {
      fetchPackages();
      fetchNas();
    }
  }, [isOpen]);

  // Sync formData with user prop when modal opens
  React.useEffect(() => {
    if (user && isOpen) {
      // Parse disable_weekdays string
      let weekdays: string[] = [];
      let timeStart = "";
      let timeEnd = "";

      const dw = (user as any).disable_weekdays || "";
      if (typeof dw === "string" && dw) {
        if (dw.startsWith("Al")) {
          weekdays = [...WEEKDAYS];
          const times = dw.slice(2).split("-");
          if (times.length === 2) {
            timeStart = `${times[0].slice(0, 2)}:${times[0].slice(2)}`;
            timeEnd = `${times[1].slice(0, 2)}:${times[1].slice(2)}`;
          }
        } else {
          const parts = dw.split(",");
          parts.forEach((p: string) => {
            const dayCode = p.slice(0, 2);
            const day = WEEKDAYS.find((d) => d.startsWith(dayCode));
            if (day) {
              // Check if it has time part
              if (p.length > 2) {
                weekdays.push(day);
                if (!timeStart) {
                  const times = p.slice(2).split("-");
                  if (times.length === 2) {
                    timeStart = `${times[0].slice(0, 2)}:${times[0].slice(2)}`;
                    timeEnd = `${times[1].slice(0, 2)}:${times[1].slice(2)}`;
                  }
                }
              }
            }
          });
        }
      } else if (Array.isArray(dw)) {
        weekdays = dw;
      }

      const ipType = user.static_ip
        ? "static"
        : user.p2p_block
          ? "point_to_point"
          : "package";
      const disableType = user.disable_date
        ? "date"
        : user.disable_start_date
          ? "range"
          : "none";
      const isWholeDay = timeStart === "00:00" && timeEnd === "23:59";

      setFormData({
        ...user,
        ip_type: ipType as "package" | "static" | "point_to_point",
        disable_type: disableType as "none" | "date" | "range",
        disable_weekdays: weekdays,
        disable_time_start: timeStart,
        disable_time_end: timeEnd,
        disable_whole_day: isWholeDay,
      });

      if (
        user.present_address === user.permanent_address &&
        user.permanent_address !== ""
      ) {
        setSameAsPermanent(true);
      } else {
        setSameAsPermanent(false);
      }
    }
  }, [user, isOpen, getOnlyDate]);

  React.useEffect(() => {
    if (sameAsPermanent) {
      setFormData((prev) => ({
        ...prev,
        present_address: prev.permanent_address,
      }));
    }
  }, [formData.permanent_address, sameAsPermanent]);

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

  const handleConnectionChange = (
    field: keyof IUser,
    value: string | number | boolean | string[] | null | undefined,
  ) => {
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

    if (connection.disable_weekdays.length === 7) {
      return `Al${timePart}`;
    }

    const rules = connection.disable_weekdays.map((day) => {
      const dayCode = day.slice(0, 2);
      return `${dayCode}${timePart}`;
    });

    return rules.join(",");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const sanitizePayload = (data: any): any => {
      if (data === "" || data === null || data === undefined) return undefined;
      if (Array.isArray(data)) {
        const filtered = data
          .map((v) => sanitizePayload(v))
          .filter((v) => v !== undefined);
        return filtered.length > 0 ? filtered : undefined;
      }
      if (typeof data === "object") {
        const result = {} as any;
        Object.keys(data).forEach((key) => {
          const value = sanitizePayload((data as any)[key]);
          if (value !== undefined) {
            result[key] = value;
          }
        });
        return result;
      }
      return data;
    };

    const rawPayload = {
      ...formData,
      expiry_date:
        formData.connection_type === "corporate"
          ? null
          : formData.expiry_date && formData.expiry_date.includes(":")
            ? formData.expiry_date
            : (() => {
                const d = fromRadiusDate(formData.expiry_date);
                return d ? toRadiusDateNoSeconds(d) : null;
              })(),
      disable_weekdays: generateTimeRule(formData),
    };

    const cleanPayload = { ...rawPayload } as any;
    delete cleanPayload.ip_type;
    delete cleanPayload.disable_type;
    delete cleanPayload.package_name;
    delete cleanPayload.disable_time_start;
    delete cleanPayload.disable_time_end;
    delete cleanPayload.id;
    delete cleanPayload.userid;
    delete cleanPayload.status;
    delete cleanPayload.created_at;
    delete cleanPayload.updated_at;
    delete cleanPayload._originalUser;
    delete cleanPayload._isUserOnly;
    delete cleanPayload.disable_whole_day;

    // Handle null for expiry_date explicitly if corporate
    if (formData.connection_type === "corporate") {
      cleanPayload.expiry_date = null;
    }

    const payload = sanitizePayload(cleanPayload);

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/update-users/${user?.id}`,
        payload,
      );
      toast.success("User updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[98vw] w-full h-[98vh] max-h-[98vh] p-0 overflow-hidden flex flex-col sm:max-w-[98vw]">
        {/* Sticky Header */}
        <DialogHeader className="p-6 border-b bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  Edit User Account
                </DialogTitle>
                <DialogDescription>
                  Managing connection settings and profile for{" "}
                  <span className="font-semibold text-slate-900">
                    {formData.username}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          <form
            id="edit-user-form"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.connection_type === "home" ? (
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="John Doe"
                        required
                        className="bg-slate-50/50"
                      />
                    </div>
                  ) : (
                    <div className="grid gap-2">
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
                        className="bg-slate-50/50"
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
                      className="bg-slate-50/50"
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
                      className="bg-slate-50/50"
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
                    <Label htmlFor="permanent_address">
                      Permanent Address *
                    </Label>
                    <Input
                      id="permanent_address"
                      value={formData.permanent_address}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-50/50"
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
                      className={cn(
                        "bg-slate-50/50 transition-opacity",
                        sameAsPermanent && "opacity-50 cursor-not-allowed",
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-slate-400">
                    NETWORK TYPE
                  </Label>
                  <div className="grid gap-2">
                    <Label htmlFor="connection_type">Connection Type *</Label>
                    <Select
                      onValueChange={(v) =>
                        handleSelectChange("connection_type", v)
                      }
                      value={formData.connection_type}
                    >
                      <SelectTrigger className="bg-slate-50/50">
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
                  <div className="grid gap-2 pt-2">
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
                      className="bg-slate-50/50"
                    />
                  </div>
                  <div className="grid gap-2 pt-2">
                    <Label htmlFor="nas">NAS Device *</Label>
                    <Select
                      onValueChange={(v) =>
                        handleConnectionChange("nas", Number(v))
                      }
                      value={formData.nas ? String(formData.nas) : ""}
                    >
                      <SelectTrigger className="bg-slate-50/50">
                        <SelectValue placeholder="Select NAS Device" />
                      </SelectTrigger>
                      <SelectContent>
                        {nasList.map((nas) => (
                          <SelectItem key={nas.id} value={String(nas.id)}>
                            <div className="flex flex-col">
                              <span className="font-bold">{nas.shortname}</span>
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

                <div className="space-y-4">
                  <Label className="text-xs font-bold text-slate-400">
                    CREDENTIALS
                  </Label>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username (Fixed)</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      disabled
                      className="bg-slate-100/80 font-mono text-xs"
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
                      className="bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold text-slate-400">
                    IP ALLOCATION
                  </Label>
                  <div className="flex flex-col gap-3 p-4 bg-slate-50/50 rounded-lg border">
                    {["package", "static", "point_to_point"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-3 cursor-pointer group"
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
                        <span className="text-sm font-medium capitalize text-slate-600 group-hover:text-slate-900 transition-colors">
                          {type.replace(/_/g, " ")}
                        </span>
                      </label>
                    ))}
                  </div>
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
                        className="bg-blue-50/30 border-blue-100"
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
                        className="bg-blue-50/30 border-blue-100"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Package & Billing and Disabling Policies */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
              {/* Package & Billing */}
              <div className="lg:col-span-1 bg-white p-6 rounded-xl border shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider pb-2 border-b">
                  <PackageIcon className="h-4 w-4" /> Service & Billing
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <PackageIcon className="h-3.5 w-3.5 text-blue-500" />{" "}
                      Subscription Plan *
                    </Label>
                    <Select
                      onValueChange={(v) =>
                        handleConnectionChange("package_id", Number(v))
                      }
                      value={String(formData.package_id)}
                    >
                      <SelectTrigger className="bg-slate-50/50">
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages
                          .filter(
                            (p) =>
                              p.type?.toLowerCase() ===
                              formData.connection_type,
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
                      <Label className="flex items-center gap-2">
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
                          className="w-full h-10 rounded-md border bg-slate-50/50 px-3 py-2 text-sm"
                        />
                        <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" /> Cycle
                      Billing Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.billing_date}
                      onChange={(e) =>
                        handleConnectionChange("billing_date", e.target.value)
                      }
                      className="bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Controls */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider pb-2 border-b">
                  <Ban className="h-4 w-4" /> Access Restrictions
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Date/Range Disabling */}
                  <div className="space-y-4">
                    <Label className="text-xs font-bold text-slate-400">
                      TEMPORARY SUSPENSION
                    </Label>
                    <div className="flex items-center gap-4 p-2 bg-slate-50/50 rounded-lg border">
                      {["none", "date", "range"].map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer py-1 px-3 rounded-md transition-colors hover:bg-white"
                        >
                          <input
                            type="radio"
                            name="disable_type"
                            value={type}
                            checked={formData.disable_type === type}
                            onChange={() =>
                              handleConnectionChange("disable_type", type)
                            }
                            className="w-3.5 h-3.5"
                          />
                          <span className="text-xs font-semibold capitalize text-slate-600">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="h-20">
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
                            className="w-full h-10 rounded-md border bg-white px-3 py-2 text-sm"
                            placeholderText="Select Date"
                          />
                          <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
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
                                className="w-full h-10 rounded-md border bg-white px-3 py-2 text-sm"
                                placeholderText="Start Date"
                              />
                              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
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
                              className="h-10 bg-white font-semibold"
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
                                className="w-full h-10 rounded-md border bg-white px-3 py-2 text-sm"
                                placeholderText="End Date"
                              />
                              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>
                            <Input
                              type="time"
                              value={getOnlyTime(
                                formData.disable_end_date || "",
                              )}
                              onChange={(e) =>
                                handleConnectionChange(
                                  "disable_end_date",
                                  combineDateTime(
                                    getOnlyDate(
                                      formData.disable_end_date || "",
                                    ),
                                    e.target.value,
                                  ),
                                )
                              }
                              className="h-10 bg-white font-semibold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weekday Time Restriction */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-400">
                        WEEKLY ACCESS TIME
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleAllWeekdaysForConnection}
                        className="h-6 text-[10px] uppercase font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
                            "flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all",
                            formData.disable_weekdays.includes(day)
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-white border-slate-100 text-slate-400 hover:border-slate-200",
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.disable_weekdays.includes(day)}
                            onChange={() => handleConnectionWeekdayChange(day)}
                          />
                          <span className="text-[10px] font-bold">
                            {day.slice(0, 3)}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <input
                        type="checkbox"
                        id="modal_whole_day_access"
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
                        htmlFor="modal_whole_day_access"
                        className="text-[10px] font-bold text-slate-600 uppercase cursor-pointer"
                      >
                        Whole Day Access
                      </Label>
                    </div>

                    {formData.disable_weekdays.length > 0 &&
                      !formData.disable_whole_day && (
                        <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in slide-in-from-right-2">
                          <div className="grid gap-1">
                            <Label className="text-[9px] font-bold text-slate-400 uppercase">
                              Start
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
                              className="h-9 text-xs font-semibold"
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label className="text-[9px] font-bold text-slate-400 uppercase">
                              End
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
                              className="h-9 text-xs font-semibold"
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
        <DialogFooter className="p-6 border-t bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-6 h-12 font-semibold"
            >
              Discard Changes
            </Button>
            <Button
              form="edit-user-form"
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-10 h-12 text-base font-bold transition-all hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating
                  Profile...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Save Account Changes
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
