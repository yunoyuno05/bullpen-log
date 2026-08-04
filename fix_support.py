import re

with open('src/components/SupportTicket.tsx', 'r') as f:
    content = f.read()

# Make it wider but use smaller elements
content = content.replace('max-w-xl mx-auto', 'max-w-4xl mx-auto')
content = content.replace('p-6', 'p-5')
content = content.replace('py-3 text-sm font-medium', 'py-2 text-sm font-medium')
content = content.replace('mb-8', 'mb-5')
content = content.replace('mb-6', 'mb-4')
content = content.replace('p-5 flex items-center', 'p-4 flex items-center')

# In my tickets, I can make it grid too!
content = content.replace(
    'className="space-y-4"',
    'className="grid grid-cols-1 md:grid-cols-2 gap-4"'
)

with open('src/components/SupportTicket.tsx', 'w') as f:
    f.write(content)

