-- Schema atualizado do Supabase para Entropia Cursinho
-- Com autenticação segura e melhorias

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum para tipos de usuário
CREATE TYPE user_role AS ENUM ('student', 'admin', 'teacher');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- Tabela de perfis (estende auth.users do Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role user_role DEFAULT 'student' NOT NULL,
  status user_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de estudantes (informações específicas)
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  enrollment_date DATE NOT NULL,
  city VARCHAR(100),
  school_type VARCHAR(50), -- 'public', 'private'
  income_range VARCHAR(50), -- 'low', 'medium', 'high'
  ethnicity VARCHAR(50),
  has_disability BOOLEAN DEFAULT false,
  is_quilombola BOOLEAN DEFAULT false,
  is_indigenous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de admins
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de presenças
CREATE TABLE attendances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  class_date DATE NOT NULL,
  subject VARCHAR(100) NOT NULL,
  teacher_name VARCHAR(255),
  is_present BOOLEAN DEFAULT false,
  justification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, class_date, subject)
);

-- Tabela de notas
CREATE TABLE grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject VARCHAR(100) NOT NULL,
  evaluation_type VARCHAR(50) CHECK (evaluation_type IN ('mock_exam', 'test', 'assignment', 'exercise')),
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  evaluation_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela financeira
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) CHECK (type IN ('monthly_fee', 'material', 'enrollment_fee', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status payment_status DEFAULT 'pending' NOT NULL,
  description TEXT NOT NULL,
  payment_date DATE,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de materiais
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('handbook', 'exercise', 'mock_exam', 'video', 'other')),
  file_url TEXT,
  description TEXT,
  available_for_classes TEXT[] NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de logs de acesso (para auditoria)
CREATE TABLE access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de cálculos da calculadora (para análise)
CREATE TABLE calculator_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  process VARCHAR(20) NOT NULL, -- 'PSC', 'MACRO', 'SIS', 'ENEM'
  course VARCHAR(100) NOT NULL,
  quota VARCHAR(50) NOT NULL,
  total_score DECIMAL(6,2) NOT NULL,
  cutoff_score DECIMAL(6,2) NOT NULL,
  approved BOOLEAN NOT NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, cpf, full_name, phone, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil após signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Índices para performance
CREATE INDEX idx_profiles_cpf ON profiles(cpf);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_students_profile_id ON students(profile_id);
CREATE INDEX idx_attendances_student_date ON attendances(student_id, class_date);
CREATE INDEX idx_grades_student_subject ON grades(student_id, subject);
CREATE INDEX idx_payments_student_status ON payments(student_id, status);
CREATE INDEX idx_materials_subject ON materials(subject);
CREATE INDEX idx_access_logs_user_created ON access_logs(user_id, created_at);

-- RLS (Row Level Security) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para estudantes
CREATE POLICY "Students can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Students can view own student data" ON students
  FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Students can view own attendance" ON attendances
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

CREATE POLICY "Students can view own grades" ON grades
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

CREATE POLICY "Students can view own payments" ON payments
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

-- Políticas para materiais
CREATE POLICY "Public materials are viewable by all" ON materials
  FOR SELECT USING (is_public = true);

CREATE POLICY "Class materials viewable by enrolled students" ON materials
  FOR SELECT USING (
    available_for_classes && (
      SELECT ARRAY[class_name] FROM students 
      WHERE profile_id = auth.uid()
    )
  );

-- Políticas para admins (podem ver tudo)
CREATE POLICY "Admins can do everything" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Repetir política de admin para todas as tabelas...

-- Políticas para logs
CREATE POLICY "Users can insert own calculator logs" ON calculator_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own calculator logs" ON calculator_logs
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);