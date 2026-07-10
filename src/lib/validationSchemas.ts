import { z } from 'zod';

// Phone number validation (10 digits)
const phoneRegex = /^[0-9]{10}$/;

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Name validation (letters and spaces only)
const nameRegex = /^[a-zA-Z\s]+$/;

export const studentRegistrationSchema = z.object({
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(nameRegex, "Name can only contain letters and spaces"),
  mobile: z.string()
    .regex(phoneRegex, "Mobile number must be exactly 10 digits"),
  qualification: z.enum(["B.A", "B.Sc", "B.Com", "M.A", "M.Sc", "M.Com", "Other"], {
    required_error: "Please select your qualification"
  }),
  desiredRole: z.enum([
    "Business Development",
    "Customer Success",
    "Project Management",
    "Operations Management",
    "Product Management",
    "Human Resources",
    "Marketing Management",
    "Customer Support"
  ], {
    required_error: "Please select a course"
  }),
  email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  state: z.string()
    .min(2, "Please select your state"),
  district: z.string()
    .min(2, "Please select your district"),
  agreedToTerms: z.boolean()
    .refine((val) => val === true, {
      message: "You must agree to the terms and conditions"
    })
});

export const employerRegistrationSchema = z.object({
  contactPerson: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(nameRegex, "Name can only contain letters and spaces"),
  
  orgName: z.string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(150, "Company name must be less than 150 characters"),
  
  designation: z.array(z.string())
    .min(1, "Please select at least one role/designation"),
  
  email: z.string()
    .email("Please enter a valid work email address")
    .max(255, "Email must be less than 255 characters"),
  
  mobile: z.string()
    .regex(phoneRegex, "Mobile number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),
  
  hiringVolume: z.enum(["1-5", "5-10", "10+"], {
    errorMap: () => ({ message: "Please select hiring needs" })
  })
});

export type StudentRegistrationFormData = z.infer<typeof studentRegistrationSchema>;
export type EmployerRegistrationFormData = z.infer<typeof employerRegistrationSchema>;
