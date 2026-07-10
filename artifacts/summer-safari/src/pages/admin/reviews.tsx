import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListReviews,
  useUpdateReview,
  useDeleteReview,
  getListReviewsQueryKey,
  type Review,
  type ListReviewsStatus,
} from "@workspace/api-client-react";
import {
  MapPin, LogOut, ChevronLeft, ChevronRight, Star, Check, X,
  Pencil, Trash2, Loader2, MessageSquareQuote, Clock, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function statusBadge(status: string) {
  switch (status) {
    case "approved": return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    case "rejected": return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    default: return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
  }
}

export default function AdminReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Review | null>(null);
  const [editName, setEditName] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editReview, setEditReview] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const listParams = {
    status: statusFilter !== "all" ? (statusFilter as ListReviewsStatus) : undefined,
    page,
    limit: PAGE_SIZE,
  };
  const { data, isLoading } = useListReviews(listParams);

  const updateMutation = useUpdateReview();
  const deleteMutation = useDeleteReview();

  const rows = data?.reviews ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey().slice(0, 1) });

  const setStatus = async (r: Review, status: "approved" | "rejected" | "pending") => {
    try {
      await updateMutation.mutateAsync({ id: r.id, data: { status } });
      toast({ title: status === "approved" ? "Review approved" : status === "rejected" ? "Review rejected" : "Moved back to pending", description: `Review by ${r.name}` });
      refresh();
    } catch {
      toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const openEdit = (r: Review) => {
    setEditing(r);
    setEditName(r.name);
    setEditRating(r.rating);
    setEditReview(r.review);
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: { name: editName.trim(), rating: editRating, review: editReview.trim() },
      });
      toast({ title: "Review updated", description: `Review by ${editName}` });
      setEditing(null);
      refresh();
    } catch {
      toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (deletingId == null) return;
    try {
      await deleteMutation.mutateAsync({ id: deletingId });
      toast({ title: "Review deleted" });
      setDeletingId(null);
      refresh();
    } catch {
      toast({ title: "Delete failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <header className="bg-white dark:bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-serif font-bold">Reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-serif font-bold">Parent Reviews</h1>
            <Badge variant="secondary">{total}</Badge>
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading reviews…
              </div>
            ) : rows.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                No reviews {statusFilter !== "all" ? `with status "${statusFilter}"` : "yet"}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="min-w-[280px]">Review</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, i) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-muted-foreground">{r.email}</TableCell>
                        <TableCell><Stars rating={r.rating} /></TableCell>
                        <TableCell className="max-w-[360px]">
                          <p className="text-sm text-foreground/80 line-clamp-2 whitespace-normal">{r.review}</p>
                        </TableCell>
                        <TableCell>{statusBadge(r.status)}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {format(new Date(r.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {r.status !== "approved" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-700 hover:text-green-800 hover:bg-green-50 gap-1"
                                onClick={() => setStatus(r, "approved")}
                                disabled={updateMutation.isPending}
                                title="Approve"
                              >
                                <Check className="h-4 w-4" /> Approve
                              </Button>
                            )}
                            {r.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                                onClick={() => setStatus(r, "rejected")}
                                disabled={updateMutation.isPending}
                                title="Reject"
                              >
                                <X className="h-4 w-4" /> Reject
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeletingId(r.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} · {total} review{total === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="gap-1">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="gap-1">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Edit dialog */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Review</DialogTitle>
            <DialogDescription>Fix typos or moderate content before approving.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onClick={() => setEditRating(n)}
                    className="p-1 rounded focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <Star className={`h-6 w-6 ${n <= editRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-review">Review</Label>
              <Textarea id="edit-review" value={editReview} onChange={(e) => setEditReview(e.target.value)} rows={5} maxLength={1000} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending || editName.trim().length < 2 || editReview.trim().length < 10} className="gap-2">
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deletingId !== null} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Delete Review?</DialogTitle>
            <DialogDescription>
              This will permanently remove the review. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending} className="gap-2">
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
