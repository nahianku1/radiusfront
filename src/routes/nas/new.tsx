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
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, Server, Shield, Info, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/nas/new")({
  component: NewNASPage,
});

function NewNASPage() {
  const [formData, setFormData] = React.useState({
    nasname: "",
    shortname: "",
    secret: "",
    type: "",
    community: "",
    description: "",
    apiuser: "",
    apipassword: "",
  });
  const [loading, setLoading] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log(formData);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/nas/create-nas`,
        formData,
      );
      toast.success("NAS created successfully");
      // Optional: navigate back to list or reset form
      // navigate({ to: '/nas/list' })
      setFormData({
        nasname: "",
        shortname: "",
        secret: "",
        type: "",
        community: "",
        description: "",
        apiuser: "",
        apipassword: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create NAS. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Add New NAS
        </h2>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              NAS Configuration
            </CardTitle>
            <CardDescription>
              Configure the Network Access Server (NAS) details. Fields marked
              with * are mandatory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Primary Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2 text-gray-700">
                  <Info className="h-4 w-4" /> Basic Information
                </h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="nasname" className="font-semibold">
                      Name IP <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nasname"
                      value={formData.nasname}
                      onChange={handleInputChange}
                      placeholder="e.g. 192.168.88.1"
                      required
                      className="bg-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="shortname" className="font-semibold">
                      NAS Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="shortname"
                      value={formData.shortname}
                      onChange={handleInputChange}
                      placeholder="e.g. Main Router"
                      required
                      className="bg-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="secret" className="font-semibold">
                      NAS Secret <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="secret"
                      type="password"
                      value={formData.secret}
                      onChange={handleInputChange}
                      placeholder="Enter shared secret"
                      required
                      className="bg-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="type" className="font-semibold">
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      onValueChange={handleSelectChange}
                      value={formData.type}
                    >
                      <SelectTrigger id="type" className="bg-white">
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="community" className="font-semibold">
                      Community
                    </Label>
                    <Input
                      id="community"
                      value={formData.community}
                      onChange={handleInputChange}
                      placeholder="e.g. public"
                      className="bg-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="font-semibold">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Optional description"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Mikrotik API Section */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium flex items-center gap-2 text-gray-700">
                  <Shield className="h-4 w-4" /> Mikrotik API Configuration
                </h3>
                <Separator />
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="apiuser" className="font-semibold">
                        API User
                      </Label>
                      <Input
                        id="apiuser"
                        value={formData.apiuser}
                        onChange={handleInputChange}
                        placeholder="Mikrotik Login User"
                        className="bg-white"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="apipassword" className="font-semibold">
                        API Password
                      </Label>
                      <Input
                        id="apipassword"
                        type="password"
                        value={formData.apipassword}
                        onChange={handleInputChange}
                        placeholder="Mikrotik Login Password"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create NAS
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
