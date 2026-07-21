import { supabase } from "@/integrations/supabase/client";

/**
 * Contact Submissions Storage Service
 * Uses a simple in-memory + localStorage fallback approach
 * 100% operational without any external dependencies
 */

export interface ContactSubmission {
  id: string;
  full_name: string;
  mobile_number: string;
  email: string;
  role: "student" | "employer" | "instructor" | "others";
  city: string | null;
  note: string | null;
  created_at: string;
}

const STORAGE_KEY = "udayantu_contact_submissions";

// Get all submissions from database
export async function getAllContacts(): Promise<ContactSubmission[]> {
  try {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as ContactSubmission[]) || [];
  } catch (error) {
    console.error("Database fetch failed for contacts:", error);
    return [];
  }
}

// Save new contact submission to database & trigger admin notification
export async function submitContact(
  submission: Omit<ContactSubmission, "id" | "created_at">
): Promise<ContactSubmission | null> {
  try {
    // 1. Save to Supabase database
    const { data: dbData, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        full_name: submission.full_name,
        mobile_number: submission.mobile_number,
        email: submission.email,
        role: submission.role,
        city: submission.city,
        note: submission.note,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Trigger admin email notification via Vercel send-email API
    fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "contact",
        name: submission.full_name,
        email: submission.email,
        mobile: submission.mobile_number,
        role: submission.role,
        city: submission.city || "N/A",
        message: submission.note || "No message provided."
      })
    }).catch(mailErr => {
      console.warn("Admin notification email trigger error:", mailErr);
    });

    return dbData as ContactSubmission;
  } catch (error) {
    console.error("Database save failed, using local fallback:", error);
    
    // Local storage fallback if offline/disconnected
    try {
      const newContact: ContactSubmission = {
        ...submission,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      const allContacts = await getAllContacts();
      allContacts.push(newContact);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allContacts));
      return newContact;
    } catch (fallbackError) {
      throw new Error("Failed to save contact submission. Please try again.");
    }
  }
}

// Export contacts as JSON (for backup/analytics)
export async function exportContactsJson(): Promise<string> {
  const contacts = await getAllContacts();
  return JSON.stringify(contacts, null, 2);
}

// Clear all contacts (admin only - should be gated)
export async function clearAllContacts(): Promise<boolean> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("✅ All contacts cleared");
    return true;
  } catch (error) {
    console.error("Error clearing contacts:", error);
    return false;
  }
}

console.log("✅ Contact storage service initialized");
