import { Link } from "wouter";
import {
  useGetStats,
  useListRegistrations,
  useExportRegistrations,
  getExportRegistrationsQueryKey,
  useDeleteRegistration,
  useUpdatePaymentStatus,
  getListRegistrationsQueryKey,
  getGetStatsQueryKey,
  type ListRegistrationsSortBy as SortByType,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import {
  Users, CheckCircle2, Clock, Search, FileDown,
  MapPin, LogOut, ChevronRight, Trash2, Loader2,
  ChevronLeft, ArrowUp, ArrowDown, ChevronsUpDown,
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
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;
const PROGRAM_NAME = "Summer Safari 2026";

type SortBy =
  | "id" | "parentName" | "parentEmail" | "parentPhone"
  | "childName" | "childAge" | "paymentStatus" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { data: stats } = useGetStats();

  const exportParams = {
    search: search || undefined,
    paymentStatus: statusFilter !== "all" ? statusFilter : undefined,
  };

  const { data: registrationsData } = useListRegistrations({
    search: search || undefined,
    paymentStatus: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: PAGE_SIZE,
    sortBy: sortBy as SortByType,
    sortOrder,
  });

  const { refetch: fetchExport, isFetching: isExporting } = useExportRegistrations(exportParams, {
    query: { enabled: false, queryKey: getExportRegistrationsQueryKey(exportParams) },
  });

  const queryClient = useQueryClient();
  const deleteMutation = useDeleteRegistration();
  const updateStatusMutation = useUpdatePaymentStatus();
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const rows = registrationsData?.registrations ?? [];
  const total = registrationsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const refreshData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: getListRegistrationsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() }),
    ]);

  const resetToFirstPage = () => setPage(1);

  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    resetToFirstPage();
  };

  const handleConfirm = async (id: number, childName: string) => {
    setConfirmingId(id);
    try {
      const result = await updateStatusMutation.mutateAsync({
        id,
        data: { paymentStatus: "confirmed" },
      });
      await refreshData();
      if (result.emailSent) {
        toast({
          title: "Payment confirmed",
          description: `Confirmation email sent to the parent for ${childName}.`,
        });
      } else if (result.emailError) {
        toast({
          title: "Payment confirmed",
          description: result.emailError,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment confirmed",
          description: `Payment for ${childName} marked as confirmed.`,
        });
      }
    } catch {
      toast({
        title: "Update failed",
        description: "Could not confirm this payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfirmingId(null);
    }
  };

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
    switch (status) {
      case "confirmed": return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default: return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    }
  };

  const SortButton = ({ column, label }: { column: SortBy; label: string }) => (
    <button
      type="button"
      onClick={() => handleSort(column)}
      className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors"
    >
      {label}
      {sortBy === column ? (
        sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </button>
  );

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
                  placeholder="Search name, child, email..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); resetToFirstPage(); }}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); resetToFirstPage(); }}>
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
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={isClearingAll || rows.length === 0}
                className="w-full sm:w-auto gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                {isClearingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Clear Shown{rows.length > 0 ? ` (${rows.length})` : ""}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="whitespace-nowrap"><SortButton column="id" label="ID" /></TableHead>
                    <TableHead className="whitespace-nowrap"><SortButton column="parentName" label="Parent Name" /></TableHead>
                    <TableHead className="whitespace-nowrap"><SortButton column="parentEmail" label="Email" /></TableHead>
                    <TableHead className="whitespace-nowrap"><SortButton column="parentPhone" label="Phone Number" /></TableHead>
                    <TableHead className="whitespace-nowrap"><SortButton column="childName" label="Child Name" /></TableHead>
                    <TableHead className="whitespace-nowrap"><SortButton column="childAge" label="Child Age" /></TableHead>
                    <TableHead className="whitespace-nowrap">Program/Event</TableHead>
                    <TableHead className="whitespace-nowrap"><SortButton column="createdAt" label="Registration Date" /></TableHead>
                    <TableHead className="whitespace-nowrap"><SortButton column="paymentStatus" label="Payment Status" /></TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No registrations found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((reg, idx) => (
                      <TableRow
                        key={reg.id}
                        className={`${idx % 2 === 1 ? "bg-muted/30" : ""} hover:bg-muted/60 transition-colors`}
                      >
                        <TableCell className="font-mono text-sm text-muted-foreground">#{reg.id}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{reg.parentName}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <a href={`mailto:${reg.parentEmail}`} className="text-primary hover:underline">{reg.parentEmail}</a>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{reg.parentPhone}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{reg.childName}</TableCell>
                        <TableCell>{reg.childAge} yrs</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{PROGRAM_NAME}</TableCell>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {format(new Date(reg.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{getStatusBadge(reg.paymentStatus)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {reg.paymentStatus === "pending" && (
                              <button
                                type="button"
                                onClick={() => handleConfirm(reg.id, reg.childName)}
                                disabled={updateStatusMutation.isPending}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                {confirmingId === reg.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                Mark as Confirmed
                              </button>
                            )}
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {total === 0 ? "No results" : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
