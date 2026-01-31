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
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { IPackage } from "@/types/package.interface";

export const Route = createFileRoute("/packages/list")({
  component: PackagesListPage,
});

function PackagesListPage() {
  const [data, setData] = React.useState<IPackage[]>([]);
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
  const [editFormData, setEditFormData] = React.useState<IPackage>({
    name: "",
    price: "",
    upload_speed: "",
    download_speed: "",
    type: "home",
    pool: "",
    simultaneos_users: "",
    description: "",
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/services/getall-service`,
      );
      setData(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPackages();
  }, []);

  const handleEditClick = React.useCallback((pkg: IPackage) => {
    setEditFormData(pkg);
    setIsEditModalOpen(true);
  }, []);

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "price") {
      const intValue = value.replace(/[^0-9]/g, "");
      setEditFormData((prev) => ({ ...prev, [id]: intValue }));
      return;
    }
    if (id === "simultaneos_users") {
      const intValue = value.replace(/[^0-9]/g, "");
      setEditFormData((prev) => ({ ...prev, [id]: intValue }));
      return;
    }
    setEditFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditSelectChange = (id: keyof IPackage, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingUpdate(true);

    const payload = {
      ...editFormData,
      price: editFormData.price,
      simultaneos_users: String(editFormData.simultaneos_users),
    };

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/services/update-service/${editFormData.id}`,
        payload,
      );
      toast.success("Package updated successfully");
      setIsEditModalOpen(false);
      fetchPackages();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update package");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = React.useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/services/delete-service/${id}`,
      );
      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete package");
    }
  }, []);

  const columns = React.useMemo<ColumnDef<IPackage>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-100"
          >
            Name <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-100"
          >
            Price <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("price")} BDT</div>,
      },
      {
        accessorKey: "upload_speed",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-100"
          >
            Speeds (U/D) <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-blue-600 font-semibold">
              {row.original.upload_speed}
            </span>
            <span>/</span>
            <span className="text-purple-600 font-semibold">
              {row.original.download_speed}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "pool",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-100"
          >
            IP Pool <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("pool") || "-"}</div>,
      },
      {
        accessorKey: "simultaneos_users",
        header: "Concurrent",
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("simultaneos_users")}</div>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-100"
          >
            Type <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
              row.getValue("type") === "corporate"
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {row.getValue("type")}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-100"
          >
            Date Added <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
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
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-100"
          >
            Date Updated <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
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
          const pkg = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                onClick={() => handleEditClick(pkg)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                onClick={() => handleDelete(pkg.id!)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleDelete, handleEditClick],
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
    getRowId: (row) => row.id!,
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
          Package Plans
        </h2>
      </div>

      <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            All Packages
          </CardTitle>
          <CardDescription>
            Manage your package plans and pricing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search packages..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm bg-white"
            />
          </div>

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
                              No packages found.
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

          {/* Pagination */}
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
              of {table.getFilteredRowModel().rows.length} packages
            </div>
            <div className="flex items-center gap-2">
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
              >
                {[5, 10, 20, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} rows
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Package className="h-6 w-6 text-blue-600" />
              Edit Package Plan
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="1"
                  value={editFormData.price}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  onValueChange={(v) => handleEditSelectChange("type", v)}
                  value={editFormData.type}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="upload_speed">Upload Speed *</Label>
                <Input
                  id="upload_speed"
                  value={editFormData.upload_speed}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="download_speed">Download Speed *</Label>
                <Input
                  id="download_speed"
                  value={editFormData.download_speed}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pool">IP Pool *</Label>
                <Input
                  id="pool"
                  value={editFormData.pool}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="simultaneos_users">Simultaneous Users *</Label>
                <Input
                  id="simultaneos_users"
                  type="number"
                  min="1"
                  value={editFormData.simultaneos_users}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                />
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
                className="bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md"
              >
                {loadingUpdate ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Update Package
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
