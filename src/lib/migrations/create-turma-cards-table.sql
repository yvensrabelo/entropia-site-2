-- Create turma_cards table
CREATE TABLE IF NOT EXISTS turma_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    package_title VARCHAR(255),
    main_title VARCHAR(255),
    description TEXT,
    plans JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    cta_text VARCHAR(100) DEFAULT 'Comece Agora',
    gradient VARCHAR(255) DEFAULT 'linear-gradient(135deg, rgb(25, 44, 38) 0%, rgb(92, 200, 133) 100%)',
    order_index INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on turma_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_turma_cards_turma_id ON turma_cards(turma_id);

-- Create index on order_index for sorting
CREATE INDEX IF NOT EXISTS idx_turma_cards_order ON turma_cards(order_index);

-- Create index on visible for filtering
CREATE INDEX IF NOT EXISTS idx_turma_cards_visible ON turma_cards(visible);

-- Add RLS policies
ALTER TABLE turma_cards ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access" ON turma_cards
    FOR SELECT
    USING (visible = true);

-- Policy for admin full access
CREATE POLICY "Allow admin full access" ON turma_cards
    FOR ALL
    USING (true);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_turma_cards_updated_at BEFORE UPDATE
    ON turma_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();