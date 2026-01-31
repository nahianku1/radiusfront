import * as React from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Trash2,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  Globe,
  MapPin,
  Home,
  Edit,
  Ban,
  Power,
  CheckCircle,
  Server,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import type { IUser } from "@/types/user.interface";
import type { IPackage } from "@/types/package.interface";
import { EditUserModal } from "./EditUserModal";

type FlattenedRow = IUser & {
  _isUserOnly: boolean;
  _originalUser: IUser;
};

interface UsersDataTableProps {
  data: IUser[];
  packages: IPackage[];
  loading: boolean;
  onRefresh: () => void;
}

export function UsersDataTable({
  data,
  packages,
  loading,
  onRefresh,
}: UsersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = React.useState({});

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<IUser | null>(null);

  const navigate = useNavigate();

  const handleDelete = React.useCallback(
    async (id: string) => {
      if (
        !confirm(
          "Are you sure you want to delete this user? This action cannot be undone.",
        )
      )
        return;

      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/users/delete-users/${id}`,
        );
        toast.success("User deleted successfully");
        onRefresh();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete user");
      }
    },
    [onRefresh],
  );

  const handleToggleStatus = React.useCallback(
    async (id: string) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/users/toggle-status/${id}`,
        );
        toast.success("User status updated successfully");
        onRefresh();
      } catch (error) {
        console.error(error);
        toast.error("Failed to update user status");
      }
    },
    [onRefresh],
  );

  const handleDisconnect = React.useCallback(async (id: string) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/disconnect-users/${id}`,
      );
      toast.success("Disconnect request sent");
    } catch (error) {
      console.error(error);
      toast.error("Failed to disconnect user");
    }
  }, []);

  const handleBulkAction = async (action: string) => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const confirmMessage = `Are you sure you want to ${action} ${selectedRows.length} selected users?`;
    if (!confirm(confirmMessage)) return;

    const toastId = toast.loading(`Processing bulk ${action}...`);
    let promises: Promise<unknown>[] = [];

    try {
      if (action === "delete") {
        const ids = selectedRows
          .map((r) => r.original.id || r.original._originalUser?.id)
          .filter(Boolean);
        promises = ids.map((id) =>
          axios.delete(
            `${import.meta.env.VITE_API_URL}/users/delete-users/${id}`,
          ),
        );
      } else if (action === "disable") {
        const rowsToDisable = selectedRows.filter(
          (r) => r.original.status !== "disabled",
        );
        const ids = rowsToDisable
          .map((r) => r.original.id || r.original._originalUser?.id)
          .filter(Boolean);
        promises = ids.map((id) =>
          axios.post(
            `${import.meta.env.VITE_API_URL}/users/toggle-status/${id}`,
          ),
        );
      } else if (action === "enable") {
        const rowsToEnable = selectedRows.filter(
          (r) => r.original.status === "disabled",
        );
        const ids = rowsToEnable
          .map((r) => r.original.id || r.original._originalUser?.id)
          .filter(Boolean);
        promises = ids.map((id) =>
          axios.post(
            `${import.meta.env.VITE_API_URL}/users/toggle-status/${id}`,
          ),
        );
      } else if (action === "disconnect") {
        const ids = selectedRows
          .map((r) => r.original.id || r.original._originalUser?.id)
          .filter(Boolean);
        promises = ids.map((id) =>
          axios.post(
            `${import.meta.env.VITE_API_URL}/users/disconnect-users/${id}`,
          ),
        );
      }

      await Promise.all(promises);
      toast.success(`Bulk ${action} completed`, { id: toastId });
      setRowSelection({});
      onRefresh();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to perform bulk ${action}`, { id: toastId });
    }
  };

  const getPackageDetails = React.useCallback(
    (packageId: number) => {
      const pkg = packages.find((p) => Number(p.id) === packageId);
      return pkg ? { name: pkg.name, price: pkg.price } : null;
    },
    [packages],
  );

  const flattenedData = React.useMemo(() => {
    return data.map((user) => ({
      ...user,
      _originalUser: user,
      _isUserOnly: false,
    })) as FlattenedRow[];
  }, [data]);

  const columns: ColumnDef<FlattenedRow>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "userid",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            UserID <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 w-fit">
            {row.original.userid}
          </div>
        ),
      },
      {
        id: "display_name",
        accessorFn: (row) =>
          row.connection_type === "corporate"
            ? `${row.corporate_name} ${row.name}`
            : row.name,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            Name <ArrowUpDown className="ml-1 h-2.5 w-2.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const isCorporate = row.original.connection_type === "corporate";
          return (
            <div className="flex flex-col gap-0.5 min-w-[140px]">
              <span className="font-bold text-slate-900 text-sm">
                {isCorporate
                  ? row.original.corporate_name || row.original.name || "N/A"
                  : row.original.name || "N/A"}
              </span>
              {isCorporate && row.original.name && (
                <span className="text-xs text-slate-400 font-medium">
                  Rep: {row.original.name}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "username",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            Username <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-bold text-blue-600 text-sm">
            <User className="h-3.5 w-3.5" />
            {row.original.username}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            Email <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-slate-500 truncate max-w-[140px]">
            {row.original.email}
          </div>
        ),
      },
      {
        accessorKey: "mobile",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            Mobile <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-slate-500 whitespace-nowrap">
            {row.original.mobile}
          </div>
        ),
      },
      {
        id: "package_details",
        accessorFn: (row) => {
          const details = getPackageDetails(row.package_id);
          return details ? `${details.name} ${details.price}` : "N/A";
        },
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            Pkg & Price <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const details = getPackageDetails(row.original.package_id);
          if (!details)
            return <span className="text-slate-400 text-xs italic">N/A</span>;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-900 text-sm uppercase tracking-tight">
                {details.name}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 w-fit">
                ৳ {details.price}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "connection_type",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            Connection Type <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const type = row.original.connection_type;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                type === "corporate"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {type}
            </span>
          );
        },
      },
      {
        id: "network_info",
        accessorFn: (row) =>
          `${row.static_ip} ${row.p2p_block} ${row.connectivity} ${row.ip_type}`,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            Network <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const conn = row.original;
          const ip = conn.static_ip || conn.p2p_block;
          return (
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-emerald-600">
                <Globe className="h-3.5 w-3.5 text-emerald-500" />
                {ip || "Dynamic"}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-slate-200">
                  {conn.ip_type}
                </span>
                {conn.connectivity && (
                  <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight border border-blue-100">
                    {conn.connectivity}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "nas_details",
        accessorFn: (row) => `${row.nas_name} ${row.nas_ip}`,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            NAS <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const { nas_name, nas_ip } = row.original;
          if (!nas_name)
            return <span className="text-slate-400 text-xs italic">N/A</span>;
          return (
            <div className="flex items-center gap-2 min-w-[120px]">
              <Server className="h-4 w-4 text-blue-500 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-slate-700 text-sm tracking-tight leading-none">
                  {nas_name}
                </span>
                {nas_ip && (
                  <span className="text-[10px] font-medium text-slate-400 font-mono mt-0.5">
                    {nas_ip}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "full_address",
        accessorFn: (row: IUser) =>
          `${row.present_address} ${row.permanent_address}`,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            Addresses <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1.5 text-xs min-w-[180px]">
            <div className="flex items-start gap-1.5">
              <MapPin className="h-3 w-3 mt-0.5 text-blue-500 shrink-0" />
              <span className="line-clamp-1">
                Pres: {row.original.present_address}
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <Home className="h-3 w-3 mt-0.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">
                Perm: {row.original.permanent_address}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "billing_date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            Billing <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-xs font-medium text-slate-500 whitespace-nowrap">
            {row.original.billing_date}
          </div>
        ),
      },
      {
        accessorKey: "expiry_date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent font-extrabold text-xs uppercase tracking-widest"
          >
            Expiry <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-xs font-bold text-orange-600 whitespace-nowrap">
            {row.original.expiry_date}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const id = row.original.id || row.original._originalUser?.id || "";
          return (
            <div className="flex justify-end gap-1 pr-2">
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 text-slate-400 hover:text-blue-600 transition-colors"
                title="Edit User"
                onClick={() => {
                  setSelectedUser(row.original);
                  setIsEditModalOpen(true);
                }}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className={`h-7 w-7 transition-colors ${
                  row.original.status === "disabled"
                    ? "text-slate-400 hover:text-emerald-600"
                    : "text-slate-400 hover:text-amber-600"
                }`}
                title={
                  row.original.status === "disabled"
                    ? "Enable User"
                    : "Disable User"
                }
                onClick={() => handleToggleStatus(id)}
              >
                {row.original.status === "disabled" ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 text-slate-400 hover:text-slate-900 transition-colors"
                title="Disconnect User"
                onClick={() => handleDisconnect(id)}
              >
                <Power className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 text-slate-400 hover:text-red-600 transition-colors"
                title="Delete User"
                onClick={() => handleDelete(id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      handleDelete,
      handleToggleStatus,
      handleDisconnect,
      getPackageDetails,
      navigate,
    ],
  );

  const table = useReactTable({
    data: flattenedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => `${row.userid}-${row.username || "user"}`,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      rowSelection,
    },
  });

  return (
    <>
      <Card className="shadow-2xl bg-white border-none overflow-hidden ring-1 ring-slate-200">
        <CardHeader className="pb-6 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">
                  User Directory
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium">
                  Currently displaying {data.length} users
                </CardDescription>
              </div>
            </div>

            <div className="flex gap-4 items-center w-full md:w-auto">
              {Object.keys(rowSelection).length > 0 && (
                <Select onValueChange={handleBulkAction}>
                  <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="delete"
                      className="text-red-600 focus:text-red-600"
                    >
                      Delete Selected
                    </SelectItem>
                    {(() => {
                      const selectedRows = table.getSelectedRowModel().rows;
                      const allDisabled = selectedRows.every(
                        (r) => r.original.status === "disabled",
                      );
                      return allDisabled ? (
                        <SelectItem value="enable">Enable Selected</SelectItem>
                      ) : (
                        <SelectItem value="disable">
                          Disable Selected
                        </SelectItem>
                      );
                    })()}
                    <SelectItem value="disconnect">
                      Disconnect Selected
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Find users by name, email, or mobile..."
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="pl-11 h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all font-medium text-slate-600"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-32 space-y-6">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse rounded-full" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600 font-bold text-lg">
                      Synchronizing Records
                    </p>
                    <p className="text-slate-400 text-sm">
                      Please wait while we fetch the latest radius data...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="bg-slate-50/80">
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-6 py-4 text-left font-extrabold text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => {
                          const status = row.original.status;
                          let rowClass =
                            "bg-white hover:bg-blue-50/20 transition-all group/row";

                          if (status === "online") {
                            rowClass =
                              "bg-sky-200 hover:bg-sky-300 transition-all group/row";
                          } else if (status === "expired") {
                            rowClass =
                              "bg-yellow-200 hover:bg-yellow-300 transition-all group/row";
                          } else if (status === "disabled") {
                            rowClass =
                              "bg-red-200 hover:bg-red-300 transition-all group/row";
                          }

                          return (
                            <tr key={row.id} className={rowClass}>
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-6 py-4">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2 p-4 bg-slate-50/50 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={onRefresh}
      />
    </>
  );
}
