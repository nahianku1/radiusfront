// src/routes/packages/new.tsx
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Package,
  CircleDollarSign,
  Zap,
  Info,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IPackage } from "@/types/package.interface";

export const Route = createFileRoute("/packages/new")({
  component: NewPackagePage,
});

function NewPackagePage() {
  const [formData, setFormData] = React.useState<IPackage>({
    name: "",
    price: "",
    upload_speed: "",
    download_speed: "",
    type: "home",
    pool: "",
    simultaneos_users: "",
    description: "",
  });
  const [loading, setLoading] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "price") {
      const intValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [id]: intValue }));
      return;
    }
    if (id === "simultaneos_users") {
      const intValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [id]: intValue }));
      return;
    }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      price: formData.price,
      simultaneos_users: formData.simultaneos_users,
      pool: formData.pool,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/services/create-service`,
        payload,
      );
      toast.success("Package created successfully");
      // Reset form
      setFormData({
        name: "",
        price: "",
        upload_speed: "",
        download_speed: "",
        type: "home",
        pool: "",
        simultaneos_users: "",
        description: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create package. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Add New Package
        </h2>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-t-4 border-t-blue-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <CardTitle>Package Configuration</CardTitle>
            </div>
            <CardDescription>
              Define the package plan details. Fields marked with * are
              mandatory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="new-package-form"
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <Info className="h-4 w-4" /> General Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-slate-700">
                      Package Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Home Starter 10M"
                      className="bg-white border-slate-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type" className="text-slate-700">
                      Package Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(v) => handleSelectChange("type", v)}
                      value={formData.type}
                    >
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-6 border-t pt-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <CircleDollarSign className="h-4 w-4" /> Pricing
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="price" className="text-slate-700">
                      Monthly Price (BDT){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="1"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Config */}
              <div className="space-y-6 border-t pt-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <Zap className="h-4 w-4" /> Package Policy
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="upload_speed">Upload Speed *</Label>
                    <Input
                      id="upload_speed"
                      value={formData.upload_speed}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 10M"
                      className="bg-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="download_speed">Download Speed *</Label>
                    <Input
                      id="download_speed"
                      value={formData.download_speed}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 10M"
                      className="bg-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pool">IP Pool *</Label>
                    <Input
                      id="pool"
                      value={formData.pool}
                      onChange={handleInputChange}
                      required
                      placeholder="Pool-1"
                      className="bg-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="simultaneos_users">
                      Simultaneous Users *
                    </Label>
                    <Input
                      id="simultaneos_users"
                      type="number"
                      min="1"
                      value={formData.simultaneos_users}
                      onChange={handleInputChange}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Detailed package description"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t bg-slate-50/50 p-6 rounded-b-xl">
            <Button
              form="new-package-form"
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Processing...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Package
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
