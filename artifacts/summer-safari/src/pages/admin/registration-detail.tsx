import { Link, useParams } from "wouter";
import { useGetRegistration, useUpdatePaymentStatus, PaymentStatusUpdatePaymentStatus, getGetRegistrationQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { 
  ArrowLeft, MapPin, CheckCircle2, XCircle, Clock, Calendar, 
  Phone, Mail, AlertTriangle, FileText, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegistrationDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { toast } = useToast();

  const { data: registration, isLoading } = useGetRegistration(id, {
    query: { enabled: !!id, queryKey: getGetRegistrationQueryKey(id) }
  });

  const updateStatusMutation = useUpdatePaymentStatus();

  const handleStatusChange = async (newStatus: string) => {
    try {
      const result = await updateStatusMutation.mutateAsync({
        id,
        data: { paymentStatus: newStatus as PaymentStatusUpdatePaymentStatus }
      });
      if (result.emailSent) {
        toast({
          title: "Payment confirmed",
          description: "A confirmation email has been sent to the parent.",
        });
      } else if (result.emailError) {
        toast({
          title: "Payment confirmed",
          description: result.emailError,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Status updated",
          description: `Registration status changed to ${newStatus}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update the status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading || !registration) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background pt-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-amber-600 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pb-20">
      <header className="bg-white dark:bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 border-l pl-4 border-border">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-lg font-serif font-bold">Registration #{registration.id}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Status & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <span className="font-medium">Payment Status:</span>
            <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-1.5 ${getStatusColor(registration.paymentStatus)}`}>
              {registration.paymentStatus === 'confirmed' && <CheckCircle2 className="h-4 w-4" />}
              {registration.paymentStatus === 'pending' && <Clock className="h-4 w-4" />}
              {registration.paymentStatus === 'rejected' && <XCircle className="h-4 w-4" />}
              <span className="capitalize">{registration.paymentStatus}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select 
              value={registration.paymentStatus} 
              onValueChange={handleStatusChange}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-6">
            
            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Child Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium text-lg">{registration.childName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date of Birth (Age)</p>
                  <p className="font-medium">{format(new Date(registration.childDateOfBirth), 'MMM d, yyyy')} ({registration.childAge} years)</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Home Address</p>
                  <p className="font-medium">{registration.homeAddress}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-secondary" />
                  <CardTitle>Parent / Guardian</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium">{registration.parentName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${registration.parentPhone}`} className="font-medium text-primary hover:underline">{registration.parentPhone}</a>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${registration.parentEmail}`} className="font-medium text-primary hover:underline">{registration.parentEmail}</a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b bg-amber-50/50 dark:bg-amber-950/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <CardTitle>Medical Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Allergies</p>
                  <p className="font-medium">{registration.allergies || <span className="text-muted-foreground italic">None reported</span>}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Medical Conditions</p>
                  <p className="font-medium">{registration.medicalConditions || <span className="text-muted-foreground italic">None reported</span>}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Physical Limitations</p>
                  <p className="font-medium">{registration.physicalLimitations || <span className="text-muted-foreground italic">None reported</span>}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Special Notes</p>
                  <p className="font-medium">{registration.specialNotes || <span className="text-muted-foreground italic">None reported</span>}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle>Emergency & Pickup Contacts</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                <div>
                  <h4 className="font-semibold text-secondary mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Name</p>
                      <p className="font-medium">{registration.emergencyContactName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Relationship</p>
                      <p className="font-medium">{registration.emergencyContactRelationship}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium">{registration.emergencyContactPhone}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-accent-foreground mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" /> Authorized Pickup
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Name</p>
                      <p className="font-medium">{registration.authorizedPickupPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium">{registration.authorizedPickupPhone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle>Payment Proof</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {registration.paymentProofUrl ? (
                  <div className="space-y-4">
                    <div className="rounded-md overflow-hidden border bg-muted/30">
                      <img
                        src={registration.paymentProofUrl}
                        alt="M-Pesa Payment Screenshot"
                        className="w-full object-contain max-h-[400px]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <a
                      href={registration.paymentProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 justify-center"
                    >
                      <FileText className="h-4 w-4" /> Open Full Image
                    </a>
                    {registration.paymentStatus === "pending" && (
                      <Button
                        className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold gap-2 text-base"
                        onClick={() => handleStatusChange("confirmed")}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        {updateStatusMutation.isPending ? "Confirming…" : "Confirm Payment"}
                      </Button>
                    )}
                    {registration.paymentStatus === "confirmed" && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Payment confirmed
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8 bg-muted/50 rounded-md border border-dashed">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground font-medium">No screenshot provided — verify manually.</p>
                    </div>
                    {registration.paymentStatus === "pending" && (
                      <Button
                        className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                        onClick={() => handleStatusChange("confirmed")}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        {updateStatusMutation.isPending ? "Confirming…" : "Confirm Payment Manually"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle>Consent Waiver</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-md">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <p>Consent accepted on {registration.consentTimestamp ? format(new Date(registration.consentTimestamp), 'MMM d, yyyy h:mm a') : 'Unknown Date'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Signature</p>
                  <div className="border bg-white rounded-md p-2 h-32 flex items-center justify-center">
                    {registration.consentSignature ? (
                      <img src={registration.consentSignature} alt="Signature" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-muted-foreground text-sm italic">No signature image</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Signed By</p>
                  <p className="font-medium font-serif italic text-lg">{registration.consentSignedBy}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Registered: {format(new Date(registration.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </main>
    </div>
  );
}
