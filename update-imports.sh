#!/bin/bash

# Atualizar todos os imports do supabase
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak "s|from '@/lib/supabase-client'|from '@/lib/supabase-singleton'|g" {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak "s|from '@/lib/supabase'|from '@/lib/supabase-singleton'|g" {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak "s|from '@/lib/supabase/client'|from '@/lib/supabase-singleton'|g" {} \;
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak "s|from '@/lib/supabase/server'|from '@/lib/supabase-singleton'|g" {} \;

# Remover backups
find src -name "*.bak" -delete

echo "✅ Todos os imports foram atualizados!"