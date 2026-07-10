import { supabase } from "@/integrations/supabase/client";

export interface Offer {
  id: string;
  employer_id: string;
  student_id: string;
  salary_amount: number;
  role: string;
  joining_date: string;
  status: "offered" | "accepted" | "rejected" | "joined";
  created_at: string;
  updated_at: string;
}

export interface OfferDocument {
  id: string;
  offer_id: string;
  document_type: "id_proof" | "degree" | "bank_details";
  document_url?: string;
  is_submitted: boolean;
  submitted_at?: string;
  created_at: string;
}

// Fetch all offers for an employer
export async function getEmployerOffers(employerId: string) {
  try {
    const { data: offers, error } = await supabase
      .from("offers" as any)
      .select("*")
      .eq("employer_id", employerId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Fetch documents for each offer
    const enrichedOffers = await Promise.all(
      (offers || []).map(async (offer: any) => {
        const { data: documents } = await supabase
          .from("offer_documents" as any)
          .select("*")
          .eq("offer_id", offer.id);

        return { ...offer, documents: documents || [] };
      })
    );

    return { offers: enrichedOffers };
  } catch (error: any) {
    console.error("Error fetching offers:", error);
    throw error;
  }
}

// Create a new offer
export async function createOffer(payload: {
  employerId: string;
  studentId: string;
  salaryAmount: number;
  role: string;
  joiningDate: string;
}) {
  try {
    const { employerId, studentId, salaryAmount, role, joiningDate } = payload;

    // Create offer
    const { data: offer, error: offerError } = await supabase
      .from("offers" as any)
      .insert([
        {
          employer_id: employerId,
          student_id: studentId,
          salary_amount: salaryAmount,
          role,
          joining_date: joiningDate,
          status: "offered",
        },
      ]);

    if (offerError) throw offerError;

    const createdOffer = offer as any[] | null;
    const offerId = createdOffer?.[0]?.id;

    // Create default document checklist
    const documents = [
      { document_type: "id_proof" },
      { document_type: "degree" },
      { document_type: "bank_details" },
    ];

    if (offerId) {
      for (const doc of documents) {
        await supabase
          .from("offer_documents" as any)
          .insert([
            {
              offer_id: offerId,
              ...doc,
              is_submitted: false,
            },
          ]);
      }

      // Log status change
      await supabase
        .from("offer_status_history" as any)
        .insert([
          {
            offer_id: offerId,
            old_status: null,
            new_status: "offered",
            changed_by: employerId,
            notes: "Offer created",
          },
        ]);
    }

    return { offer: createdOffer?.[0], success: true };
  } catch (error: any) {
    console.error("Error creating offer:", error);
    throw error;
  }
}

// Update offer status
export async function updateOfferStatus(
  offerId: string,
  newStatus: "offered" | "accepted" | "rejected" | "joined",
  employerId: string,
  notes?: string
) {
  try {
    // Get old status
    const { data: offerData } = await supabase
      .from("offers" as any)
      .select("status")
      .eq("id", offerId)
      .single();

    const oldStatus = (offerData as any)?.status;

    // Update offer
    const { error: updateError } = await supabase
      .from("offers" as any)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", offerId);

    if (updateError) throw updateError;

    // Log status change
    await supabase
      .from("offer_status_history" as any)
      .insert([
        {
          offer_id: offerId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: employerId,
          notes,
        },
      ]);

    return { success: true, message: `Offer status updated to ${newStatus}` };
  } catch (error: any) {
    console.error("Error updating offer status:", error);
    throw error;
  }
}

// Submit document
export async function submitDocument(
  documentId: string,
  documentUrl: string
) {
  try {
    const { error } = await supabase
      .from("offer_documents" as any)
      .update({
        is_submitted: true,
        document_url: documentUrl,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (error) throw error;

    return { success: true, message: "Document submitted successfully" };
  } catch (error: any) {
    console.error("Error submitting document:", error);
    throw error;
  }
}

// Export offers to CSV (only if 7+ days since joining)
export async function exportOffersToCSV(employerId: string) {
  try {
    const { data: offers, error } = await supabase
      .from("offers" as any)
      .select("*")
      .eq("employer_id", employerId)
      .eq("status", "joined");

    if (error) throw error;

    // Filter: only offers where joining_date is 7+ days ago
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const exportableOffers = (offers || []).filter((offer: any) => {
      const joiningDate = new Date(offer.joining_date);
      // Ensure proper date comparison
      return joiningDate.getTime() <= sevenDaysAgo.getTime();
    });

    if (exportableOffers.length === 0) {
      throw new Error(
        "No offers available for export. Only joined offers from 7+ days ago can be exported."
      );
    }

    // Generate CSV
    const headers = [
      "Student ID",
      "Role",
      "Salary",
      "Joining Date",
      "Status",
      "Offer Date",
    ];
    const rows = exportableOffers.map((offer: any) => [
      offer.student_id,
      offer.role,
      `₹${offer.salary_amount.toLocaleString("en-IN")}`,
      new Date(offer.joining_date).toLocaleDateString("en-IN"),
      offer.status,
      new Date(offer.created_at).toLocaleDateString("en-IN"),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `offers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true, count: exportableOffers.length };
  } catch (error: any) {
    console.error("Error exporting offers:", error);
    throw error;
  }
}
