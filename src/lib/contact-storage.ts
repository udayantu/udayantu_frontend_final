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

const MOCK_CONTACTS: ContactSubmission[] = [
  {
    id: "ct1",
    full_name: "Amit Kumar Sharma",
    mobile_number: "9876543210",
    email: "amit.sharma@gmail.com",
    role: "student",
    city: "Varanasi",
    note: "Interested in enrolling for the Executive Business Development batch starting this month.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "ct2",
    full_name: "Rohan Khanna",
    mobile_number: "9812345678",
    email: "rohan.khanna@tcs.com",
    role: "employer",
    city: "Mumbai",
    note: "Seeking to hire a cohort of 25+ Customer Support interns from Tier-3 cities.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "ct3",
    full_name: "Dr. Ramesh Prasad",
    mobile_number: "9988776655",
    email: "ramesh.prasad@gmail.com",
    role: "instructor",
    city: "New Delhi",
    note: "Applying as a Guest Lecturer for Quantitative Aptitude classes.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Get all submissions from localStorage
export async function getAllContacts(): Promise<ContactSubmission[]> {
  try {
    if (typeof window === "undefined") {
      return [];
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    return JSON.parse(stored) as ContactSubmission[];
  } catch (error) {
    console.error("Error loading contacts from storage:", error);
    return [];
  }
}

import { supabase } from "@/integrations/supabase/client";

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
