-- Add performance indexes for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_student_registrations_payment_status ON student_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_student_registrations_status ON student_registrations(status);
CREATE INDEX IF NOT EXISTS idx_student_registrations_created_at ON student_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_employers_created_at ON employers(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(completed_at);
CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON assessments(student_id);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_student_registrations_payment_status_created_at 
  ON student_registrations(payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status_created_at 
  ON payments(status, created_at DESC);

-- Comments for documentation
COMMENT ON INDEX idx_student_registrations_payment_status IS 'Index for admin dashboard payment status filtering';
COMMENT ON INDEX idx_student_registrations_status IS 'Index for admin dashboard status filtering';
COMMENT ON INDEX idx_payments_status IS 'Index for admin dashboard payment queries';
COMMENT ON INDEX idx_assessments_student_id IS 'Index for joining assessments with students';