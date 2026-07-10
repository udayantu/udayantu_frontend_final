import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEmployerAuth } from "@/hooks/useEmployerAuth";
import {
  Plus,
  Download,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  AlertTriangle,
  Globe,
} from "lucide-react";
import {
  getEmployerOffers,
  createOffer,
  updateOfferStatus,
  submitDocument,
  exportOffersToCSV,
  type Offer,
  type OfferDocument,
} from "@/lib/offersApi";
import { requestCSAction } from "@/lib/csMediationService";

interface OfferWithDocuments extends Offer {
  documents?: OfferDocument[];
}

export default function OfferManagement() {
  const navigate = useNavigate();
  const { session } = useEmployerAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<OfferWithDocuments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferWithDocuments | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');

  // Create form state
  const [formData, setFormData] = useState({
    studentId: "",
    salaryAmount: "",
    role: "",
    joiningDate: "",
  });

  // Auth check
  useEffect(() => {
    if (!session?.id) {
      navigate("/employer-login");
    }
  }, [session, navigate]);

  useEffect(() => {
    if (session?.id) {
      loadOffers();
    }
  }, [session?.id]);

  const loadOffers = async () => {
    if (!session?.id) return;
    setIsLoading(true);
    try {
      const data = await getEmployerOffers(session.id);
      setOffers(data.offers);
    } catch (error: any) {
      console.error("Error loading offers:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load offers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.studentId.trim()) errors.studentId = "Student ID is required";
    if (!formData.role.trim()) errors.role = "Role is required";
    
    const salary = parseFloat(formData.salaryAmount);
    if (!formData.salaryAmount || isNaN(salary) || salary <= 0) {
      errors.salaryAmount = "Salary must be a positive number";
    }

    if (!formData.joiningDate) {
      errors.joiningDate = "Joining date is required";
    } else {
      const joiningDate = new Date(formData.joiningDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (joiningDate < today) {
        errors.joiningDate = "Joining date must be in the future";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOffer = async () => {
    if (!validateForm()) return;
    if (!session?.id) return;

    setIsCreating(true);
    try {
      const csResult = requestCSAction(
        'send_offer',
        session.id,
        session.companyName,
        formData.studentId,
        {
          salaryAmount: parseFloat(formData.salaryAmount),
          role: formData.role,
          joiningDate: formData.joiningDate,
        },
        'medium'
      );

      if (csResult.success) {
        toast({
          title: "Request Sent",
          description: "Customer Success will process and send this offer to the candidate",
        });

        setFormData({ studentId: "", salaryAmount: "", role: "", joiningDate: "" });
        setFormErrors({});
        setShowCreateDialog(false);
      }
    } catch (error: any) {
      console.error("Create offer error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create offer request",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusUpdate = async (
    offerId: string,
    newStatus: "offered" | "accepted" | "rejected" | "joined"
  ) => {
    if (!session?.id) return;
    
    if (newStatus === 'accepted' || newStatus === 'joined') {
      let freshOffers = offers;
      try {
        const data = await getEmployerOffers(session.id);
        freshOffers = data.offers;
        setOffers(data.offers);
      } catch {
      }

      const offer = freshOffers.find(o => o.id === offerId);
      if (!offer) {
        toast({
          title: language === 'hi' ? 'त्रुटि' : 'Error',
          description: 'Offer not found',
          variant: 'destructive',
        });
        return;
      }

      try {
        const csResult = requestCSAction(
          newStatus === 'accepted' ? 'request_feedback' : 'share_candidate',
          session.id,
          session.companyName,
          offer.student_id,
          { 
            newStatus, 
            offerId,
            studentId: offer.student_id,
            action: newStatus === 'joined' ? 'confirm_joining' : 'confirm_acceptance',
          },
          newStatus === 'joined' ? 'high' : 'medium'
        );

        if (csResult.success) {
          toast({
            title: language === 'hi' ? 'अनुरोध भेजा गया' : 'Request Sent',
            description: language === 'hi' 
              ? 'Customer Success इस अपडेट को प्रोसेस करेगी'
              : 'Customer Success will process this status update',
          });
          setSelectedOffer(null);
          setDeleteConfirmId(null);
        }
      } catch (error: any) {
        console.error("CS request error:", error);
        toast({
          title: language === 'hi' ? 'त्रुटि' : 'Error',
          description: error.message || 'Failed to submit request',
          variant: 'destructive',
        });
      }
      return;
    }
    
    try {
      await updateOfferStatus(offerId, newStatus, session.id);
      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: language === 'hi' 
          ? `स्टेटस ${newStatus} में अपडेट किया गया`
          : `Offer status updated to ${newStatus}`,
      });
      await loadOffers();
      setSelectedOffer(null);
      setDeleteConfirmId(null);
    } catch (error: any) {
      console.error("Status update error:", error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = async () => {
    if (!session?.id) return;
    try {
      await exportOffersToCSV(session.id);
      toast({
        title: "Success",
        description: "Offers exported to CSV",
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to export offers",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "offered":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "joined":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "offered":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "joined":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!session) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Offer Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage job offers for candidates
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="gap-2"
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
            data-testid="button-create-offer"
          >
            <Plus className="w-4 h-4" />
            Create Offer
          </Button>
        </div>
      </div>

      {/* Language Toggle */}
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant={language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage('en')}
        >
          <Globe className="w-4 h-4 mr-1" />
          EN
        </Button>
        <Button
          variant={language === 'hi' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage('hi')}
        >
          हिंदी
        </Button>
      </div>

      {/* CS Mediation Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-800 dark:text-yellow-200">
            {language === 'hi' 
              ? 'ऑफर Customer Success के माध्यम से प्रोसेस होते हैं'
              : 'Offers are processed through Customer Success'}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            {language === 'hi'
              ? 'सभी ऑफर Customer Success (CS) द्वारा रिव्यू और भेजे जाते हैं। स्टूडेंट से सीधा संपर्क अनुमति नहीं है।'
              : 'All offers are reviewed and sent by Customer Success (CS) to ensure compliance. Direct student contact is not permitted.'}
          </p>
        </div>
      </div>

      {/* Offers Grid */}
      {offers.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-semibold mb-2">No offers yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first offer to get started
          </p>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              All ({offers.length})
            </TabsTrigger>
            <TabsTrigger value="offered">
              Offered ({offers.filter((o) => o.status === "offered").length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({offers.filter((o) => o.status === "accepted").length})
            </TabsTrigger>
            <TabsTrigger value="joined">
              Joined ({offers.filter((o) => o.status === "joined").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {offers.map((offer) => (
              <Card key={offer.id} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {offer.role}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Student ID: {offer.student_id}
                      </p>
                    </div>
                    <Badge className={getStatusColor(offer.status)}>
                      {getStatusIcon(offer.status)}
                      <span className="ml-1 capitalize">{offer.status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Salary</p>
                      <p className="font-semibold text-foreground">
                        ₹{offer.salary_amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Joining Date
                      </p>
                      <p className="font-semibold text-foreground">
                        {new Date(offer.joining_date).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Documents
                      </p>
                      <p className="font-semibold text-foreground">
                        {offer.documents?.filter((d) => d.is_submitted).length ||
                          0}
                        /{offer.documents?.length || 0}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedOffer(offer)}
                    variant="outline"
                    size="sm"
                    data-testid={`button-view-offer-${offer.id}`}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {["offered", "accepted", "joined"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {offers
                .filter((o) => o.status === status)
                .map((offer) => (
                  <Card key={offer.id} className="hover-elevate">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {offer.role}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Student ID: {offer.student_id}
                          </p>
                        </div>
                        <Badge className={getStatusColor(offer.status)}>
                          {getStatusIcon(offer.status)}
                          <span className="ml-1 capitalize">{offer.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Salary
                          </p>
                          <p className="font-semibold text-foreground">
                            ₹{offer.salary_amount.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Joining Date
                          </p>
                          <p className="font-semibold text-foreground">
                            {new Date(offer.joining_date).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Documents
                          </p>
                          <p className="font-semibold text-foreground">
                            {offer.documents?.filter((d) => d.is_submitted)
                              .length || 0}
                            /{offer.documents?.length || 0}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => setSelectedOffer(offer)}
                        variant="outline"
                        size="sm"
                        data-testid={`button-view-offer-${offer.id}`}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Create Offer Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Offer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="studentId" className={formErrors.studentId ? "text-destructive" : ""}>
                Student ID
              </Label>
              <Input
                id="studentId"
                placeholder="Enter student ID"
                value={formData.studentId}
                onChange={(e) => {
                  setFormData({ ...formData, studentId: e.target.value });
                  if (formErrors.studentId) setFormErrors({ ...formErrors, studentId: "" });
                }}
                data-testid="input-student-id"
                className={formErrors.studentId ? "border-destructive" : ""}
              />
              {formErrors.studentId && (
                <p className="text-xs text-destructive mt-1">{formErrors.studentId}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role" className={formErrors.role ? "text-destructive" : ""}>
                Role
              </Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer"
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value });
                  if (formErrors.role) setFormErrors({ ...formErrors, role: "" });
                }}
                data-testid="input-role"
                className={formErrors.role ? "border-destructive" : ""}
              />
              {formErrors.role && (
                <p className="text-xs text-destructive mt-1">{formErrors.role}</p>
              )}
            </div>

            <div>
              <Label htmlFor="salary" className={formErrors.salaryAmount ? "text-destructive" : ""}>
                Salary (₹)
              </Label>
              <Input
                id="salary"
                type="number"
                placeholder="e.g., 500000"
                value={formData.salaryAmount}
                onChange={(e) => {
                  setFormData({ ...formData, salaryAmount: e.target.value });
                  if (formErrors.salaryAmount) setFormErrors({ ...formErrors, salaryAmount: "" });
                }}
                data-testid="input-salary"
                className={formErrors.salaryAmount ? "border-destructive" : ""}
              />
              {formErrors.salaryAmount && (
                <p className="text-xs text-destructive mt-1">{formErrors.salaryAmount}</p>
              )}
            </div>

            <div>
              <Label htmlFor="joiningDate" className={formErrors.joiningDate ? "text-destructive" : ""}>
                Joining Date
              </Label>
              <Input
                id="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => {
                  setFormData({ ...formData, joiningDate: e.target.value });
                  if (formErrors.joiningDate) setFormErrors({ ...formErrors, joiningDate: "" });
                }}
                data-testid="input-joining-date"
                className={formErrors.joiningDate ? "border-destructive" : ""}
              />
              {formErrors.joiningDate && (
                <p className="text-xs text-destructive mt-1">{formErrors.joiningDate}</p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOffer}
                disabled={isCreating}
                data-testid="button-submit-offer"
              >
                {isCreating ? "Creating..." : "Create Offer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Offer Details Dialog */}
      {selectedOffer && (
        <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Offer Details - {selectedOffer.role}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Offer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Student ID</p>
                  <p className="font-semibold text-foreground">
                    {selectedOffer.student_id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge className={getStatusColor(selectedOffer.status)}>
                    {getStatusIcon(selectedOffer.status)}
                    <span className="ml-1 capitalize">
                      {selectedOffer.status}
                    </span>
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Salary</p>
                  <p className="font-semibold text-foreground">
                    ₹{selectedOffer.salary_amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Joining Date
                  </p>
                  <p className="font-semibold text-foreground">
                    {new Date(selectedOffer.joining_date).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>

              {/* Document Checklist */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">
                  Document Checklist
                </h4>
                <div className="space-y-2">
                  {selectedOffer.documents?.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            doc.is_submitted
                              ? "bg-green-500 border-green-500"
                              : "border-muted-foreground"
                          }`}
                        >
                          {doc.is_submitted && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {doc.document_type.replace("_", " ")}
                          </p>
                          {doc.submitted_at && (
                            <p className="text-xs text-muted-foreground">
                              Submitted:{" "}
                              {new Date(doc.submitted_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              {selectedOffer.status !== "joined" &&
                selectedOffer.status !== "rejected" && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">
                      Update Status
                    </h4>
                    <div className="flex gap-2">
                      {selectedOffer.status === "offered" && (
                        <>
                          <Button
                            variant="default"
                            onClick={() =>
                              handleStatusUpdate(selectedOffer.id, "accepted")
                            }
                            data-testid="button-mark-accepted"
                          >
                            Mark as Accepted
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => setDeleteConfirmId(selectedOffer.id)}
                            data-testid="button-mark-rejected"
                          >
                            Mark as Rejected
                          </Button>
                        </>
                      )}
                      {selectedOffer.status === "accepted" && (
                        <Button
                          variant="default"
                          onClick={() =>
                            handleStatusUpdate(selectedOffer.id, "joined")
                          }
                          data-testid="button-mark-joined"
                        >
                          Mark as Joined
                        </Button>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirm Rejection
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this offer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted p-3 rounded text-sm">
            <p className="font-semibold">Offer Details:</p>
            <p className="text-muted-foreground">
              {selectedOffer?.role} - Student ID: {selectedOffer?.student_id}
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  handleStatusUpdate(deleteConfirmId, "rejected");
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm Rejection
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
