import { Link } from "wouter";
import { useGetStats, useListRegistrations, useExportRegistrations, getExportRegistrationsQueryKey, useDeleteRegistration, getListRegistrationsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { 
  Users, CheckCircle2, Clock, Search, FileDown, 
  MapPin, LogOut, ChevronRight, Trash2, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: stats } = useGetStats();
  const { data: registrationsData } = useListRegistrations({
    search: search || undefined,
    paymentStatus: statusFilter !== "all" ? statusFilter : undefined,
    limit: 50
  });
  
  const { refetch: fetchExport, isFetching: isExporting } = useExportRegistrations({
    query: { enabled: false, queryKey: getExportRegistrationsQueryKey() }
  });

  const queryClient = useQueryClient();
  const deleteMutation = useDeleteRegistration();
  const [isClearingAll, setIsClearingAll] = useState(false);

  const refreshData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: getListRegistrationsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() }),
    ]);

  const handleDelete = async (id: number, childName: string) => {
    if (!window.confirm(`Delete the registration for "${childName}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync({ id });
      await refreshData();
    } catch {
      window.alert("Could not delete this registration. Please try again.");
    }
  };

  const handleClearAll = async () => {
    const rows = registrationsData?.registrations ?? [];
    if (rows.length === 0) return;
    if (!window.confirm(`Delete the ${rows.length} registration(s) currently shown? This permanently removes them and cannot be undone.`)) return;
    setIsClearingAll(true);
    let deleted = 0;
    try {
      for (const reg of rows) {
        await deleteMutation.mutateAsync({ id: reg.id });
        deleted++;
      }
    } catch {
      window.alert(`Deleted ${deleted} of ${rows.length}. Some could not be removed — please try again.`);
    } finally {
      await refreshData();
      setIsClearingAll(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin";
  };

  const handleExport = async () => {
    const { data: csvData } = await fetchExport();
    if (csvData) {
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `registrations-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed': return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default: return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <header className="bg-white dark:bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-serif font-bold">Admin Dashboard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.confirmed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payment</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats?.pending || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Signups</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.todayRegistrations || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table Section */}
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
            <CardTitle className="text-xl font-serif">Registrations</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search names, phones..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto gap-2">
                <FileDown className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={isClearingAll || (registrationsData?.registrations?.length ?? 0) === 0}
                className="w-full sm:w-auto gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                {isClearingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Clear Shown{(registrationsData?.registrations?.length ?? 0) > 0 ? ` (${registrationsData?.registrations?.length})` : ""}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Child Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationsData?.registrations?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No registrations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrationsData?.registrations?.map((reg) => (
                      <TableRow key={reg.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{reg.childName}</TableCell>
                        <TableCell>{reg.childAge} yrs</TableCell>
                        <TableCell>{reg.parentName}</TableCell>
                        <TableCell>{reg.parentPhone}</TableCell>
                        <TableCell>{getStatusBadge(reg.paymentStatus)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(reg.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(reg.id, reg.childName)}
                              disabled={deleteMutation.isPending || isClearingAll}
                              aria-label={`Delete registration for ${reg.childName}`}
                              className="inline-flex items-center justify-center p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                            <Link href={`/admin/registrations/${reg.id}`}>
                              <a className="inline-flex items-center justify-center p-2 text-primary hover:bg-primary/10 rounded-md transition-colors">
                                <ChevronRight className="h-5 w-5" />
                              </a>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
