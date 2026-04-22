-- Student offers: track application status for courses
CREATE TABLE student_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'considering' CHECK (status IN ('considering', 'applied', 'conditional', 'unconditional', 'accepted', 'declined', 'rejected')),
  offer_grades TEXT,
  is_insurance BOOLEAN DEFAULT false,
  is_firm BOOLEAN DEFAULT false,
  notes TEXT,
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

ALTER TABLE student_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own offers" ON student_offers FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own offers" ON student_offers FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update own offers" ON student_offers FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can delete own offers" ON student_offers FOR DELETE USING (auth.uid() = student_id);
CREATE INDEX idx_so_student ON student_offers(student_id);
CREATE INDEX idx_so_status ON student_offers(status);

-- Prep checklist items: track completion of university preparation tasks
CREATE TABLE prep_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  item_key TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(student_id, item_key)
);

ALTER TABLE prep_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own checklist" ON prep_checklist_items FOR ALL USING (auth.uid() = student_id);
CREATE INDEX idx_pci_student ON prep_checklist_items(student_id);
