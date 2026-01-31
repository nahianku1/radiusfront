import { createFileRoute } from "@tanstack/react-router";
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
  Edit,
  Trash2,
  Server,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Save,
  Info,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/nas/list")({
  component: NASListPage,
});

interface NAS {
  id: string;
  nasname: string;
  shortname: string;
  secret: string;
  type: string;
  community?: string | null;
  description?: string | null;
  apiuser?: string | null;
  apipassword?: string | null;
}

function NASListPage() {
  const [data, setData] = React.useState<NAS[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [loadingUpdate, setLoadingUpdate] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState({
    id: "",
    nasname: "",
    shortname: "",
    secret: "",
    type: "",
    community: "",
    description: "",
    apiuser: "",
    apipassword: "",
  });

  const fetchNASDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/nas/getall-nas`,
      );
      setData(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch NAS devices");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNASDevices();
  }, []);

  const handleEditClick = (nas: NAS) => {
    setEditFormData({
      id: nas.id,
      nasname: nas.nasname,
      shortname: nas.shortname,
      secret: nas.secret,
      type: nas.type,
      community: nas.community || "",
      description: nas.description || "",
      apiuser: nas.apiuser || "",
      apipassword: nas.apipassword || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditSelectChange = (value: string) => {
    setEditFormData((prev) => ({ ...prev, type: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingUpdate(true);

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/nas/update-nas/${editFormData.id}`,
        editFormData,
      );
      toast.success("NAS updated successfully");
      setIsEditModalOpen(false);
      fetchNASDevices();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update NAS");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this NAS device?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/nas/delete-nas/${id}`,
      );
      toast.success("NAS device deleted successfully");
      fetchNASDevices();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete NAS device");
    }
  };

  const columns = React.useMemo<ColumnDef<NAS>[]>(
    () => [
      {
        accessorKey: "nasname",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-slate-100"
            >
              NAS IP
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("nasname")}</div>
        ),
      },
      {
        accessorKey: "shortname",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-slate-100"
            >
              Short Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-slate-100"
            >
              Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
            {row.getValue("type")}
          </span>
        ),
      },
      {
        accessorKey: "community",
        header: "Community",
        cell: ({ row }) => row.getValue("community") || "-",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.getValue("description") || "-",
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-slate-100"
            >
              Date Added
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = row.getValue("created_at") as string;
          if (!date) return "-";
          return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        },
      },

      {
        accessorKey: "updated_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hover:bg-slate-100"
            >
              Date Updated
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = row.getValue("updated_at") as string;
          if (!date) return "-";
          return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const nas = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                onClick={() => handleEditClick(nas)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                onClick={() => handleDelete(nas.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          NAS Devices
        </h2>
      </div>

      <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-600" />
            All NAS Devices
          </CardTitle>
          <CardDescription>
            Manage your Network Access Servers. Search, sort, and filter
            devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Global Search */}
          <div className="flex items-center py-4">
            <Input
              placeholder="Search all columns..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm bg-white"
            />
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <div className="inline-block min-w-full align-middle">
              <div className="rounded-md border bg-white overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full">
                      <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr
                            key={headerGroup.id}
                            className="border-b bg-slate-50"
                          >
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="px-4 py-3 text-left font-semibold text-sm"
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
                      <tbody>
                        {table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => (
                            <tr
                              key={row.id}
                              className="border-b transition-colors hover:bg-slate-50"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-4 py-3 text-sm">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={columns.length}
                              className="h-24 text-center"
                            >
                              No NAS devices found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}{" "}
              of {table.getFilteredRowModel().rows.length} device(s)
            </div>

            <div className="flex items-center gap-2">
              {/* Page Size Selector */}
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
              >
                {[5, 10, 20, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} rows
                  </option>
                ))}
              </select>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1 px-2">
                  <span className="text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-9"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit NAS Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Server className="h-6 w-6 text-blue-600" />
              Edit NAS Configuration
            </DialogTitle>
            <DialogDescription>
              Update the details for NAS device {editFormData.shortname}. Fields
              marked with * are mandatory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-6 pt-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2 text-gray-700">
                <Info className="h-4 w-4" /> Basic Information
              </h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nasname">
                    Name IP <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nasname"
                    value={editFormData.nasname}
                    onChange={handleEditInputChange}
                    required
                    placeholder="e.g. 192.168.88.1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shortname">
                    NAS Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="shortname"
                    value={editFormData.shortname}
                    onChange={handleEditInputChange}
                    required
                    placeholder="e.g. Main Router"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="secret">
                    NAS Secret <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="secret"
                    type="password"
                    value={editFormData.secret}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Enter shared secret"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    onValueChange={handleEditSelectChange}
                    value={editFormData.type}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select NAS Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mikrotik">Mikrotik</SelectItem>
                      <SelectItem value="juniper">Juniper</SelectItem>
                      <SelectItem value="cisco">Cisco</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="community">Community</Label>
                <Input
                  id="community"
                  value={editFormData.community}
                  onChange={handleEditInputChange}
                  placeholder="e.g. public"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  placeholder="Optional description"
                />
              </div>
            </div>

            {/* Mikrotik API Section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-medium flex items-center gap-2 text-gray-700">
                <Shield className="h-4 w-4" /> Mikrotik API Configuration
              </h3>
              <Separator />
              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="apiuser">API User</Label>
                  <Input
                    id="apiuser"
                    value={editFormData.apiuser}
                    onChange={handleEditInputChange}
                    placeholder="Mikrotik Login User"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apipassword">API Password</Label>
                  <Input
                    id="apipassword"
                    type="password"
                    value={editFormData.apipassword}
                    onChange={handleEditInputChange}
                    placeholder="Mikrotik Login Password"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loadingUpdate}
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                {loadingUpdate ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update NAS
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
