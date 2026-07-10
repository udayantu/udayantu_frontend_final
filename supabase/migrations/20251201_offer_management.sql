-- Offer Management Tables
-- Tracks salary offers, documents, and joining status

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(255) NOT NULL,
  salary_amount DECIMAL(12, 2) NOT NULL,
  role VARCHAR(255) NOT NULL,
  joining_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'offered', -- offered, accepted, rejected, joined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employer_id, student_id)
);

CREATE TABLE IF NOT EXISTS offer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- id_proof, degree, bank_details
  document_url TEXT,
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(offer_id, document_type)
);

CREATE TABLE IF NOT EXISTS offer_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by VARCHAR(255),
  notes TEXT
);

-- Indexes for faster queries
CREATE INDEX idx_offers_employer ON offers(employer_id);
CREATE INDEX idx_offers_student ON offers(student_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_joining_date ON offers(joining_date);
CREATE INDEX idx_offer_documents_offer_id ON offer_documents(offer_id);
CREATE INDEX idx_offer_status_history_offer_id ON offer_status_history(offer_id);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Employers can manage their own offers" ON offers
  FOR ALL USING (
    auth.uid()::text = employer_id OR
    EXISTS (
      SELECT 1 FROM employers
      WHERE employers.id = offers.employer_id
      AND employers.admin_id = auth.uid()::text
    )
  );

CREATE POLICY "Employers can view offer documents" ON offer_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM offers
      WHERE offers.id = offer_documents.offer_id
      AND (
        auth.uid()::text = offers.employer_id OR
        EXISTS (
          SELECT 1 FROM employers
          WHERE employers.id = offers.employer_id
          AND employers.admin_id = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Students can view their own offers" ON offers
  FOR SELECT USING (auth.uid()::text = student_id);

CREATE POLICY "Students can view their own documents" ON offer_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM offers
      WHERE offers.id = offer_documents.offer_id
      AND auth.uid()::text = offers.student_id
    )
  );
