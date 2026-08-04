import sys

with open('src/lib/serverSync.ts', 'r') as f:
    content = f.read()

old_sync = """export async function syncAccountToServer(email: string, accountData: any) {
  if (!email) return;
  try {
    const res = await fetch('/api/account/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, accountData }),
    });"""

new_sync = """export async function syncAccountToServer(email: string, accountData: any) {
  if (!email) return;
  try {
    const res = await fetch('/api/account/data', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': accountData?.user?.isAdmin ? 'Bearer admin-secret-token' : ''
      },
      body: JSON.stringify({ email, accountData }),
    });"""

content = content.replace(old_sync, new_sync)

with open('src/lib/serverSync.ts', 'w') as f:
    f.write(content)
