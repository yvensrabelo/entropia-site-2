#!/usr/bin/env python3

import subprocess
import os
import sys

# Change to the project directory
os.chdir("/Users/yvensrabelo/SITE ENTROPIA/VERSAO 0/entropia-site-2")

def run_command(cmd):
    """Run a command and return the output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        print(f"Command: {cmd}")
        print(f"Output: {result.stdout}")
        if result.stderr:
            print(f"Error: {result.stderr}")
        print("-" * 50)
        return result.returncode == 0
    except Exception as e:
        print(f"Exception running command: {e}")
        return False

# Git operations
print("=== Starting Git Operations ===\n")

# 1. Check git status
print("1. Checking git status...")
run_command("git status")

# 2. Stage all changes
print("\n2. Staging all changes...")
if run_command("git add -A"):
    print("✓ All changes staged successfully")

# 3. Create commit
print("\n3. Creating commit...")
commit_message = """fix: correção completa da API de minutos do professor

- Removida pasta conflitante /api/professor/minutos
- Atualizado endpoint para usar função RPC minutos_do_mes
- Criada documentação da função SQL otimizada
- Corrigido problema de roteamento da API

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""

# Write commit message to temp file to avoid shell escaping issues
with open('.commit_msg_tmp', 'w') as f:
    f.write(commit_message)

if run_command("git commit -F .commit_msg_tmp"):
    print("✓ Commit created successfully")
    # Clean up temp file
    os.remove('.commit_msg_tmp')

# 4. Push to remote
print("\n4. Pushing to remote...")
if run_command("git push"):
    print("✓ Successfully pushed to remote")

# 5. Final status check
print("\n5. Final git status...")
run_command("git status")

print("\n=== Git Operations Complete ===")