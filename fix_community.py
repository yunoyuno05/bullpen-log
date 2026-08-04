import re

with open('src/components/CommunityForum.tsx', 'r') as f:
    content = f.read()

# Change max-w-xl back to max-w-5xl
content = content.replace('max-w-xl mx-auto', 'max-w-5xl mx-auto')

# Update the feed to use a grid
content = content.replace(
    'className="space-y-4 pb-20"',
    'className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20"'
)

# Shrink paddings and elements in posts
content = content.replace('rounded-[24px] p-5', 'rounded-[20px] p-4')
content = content.replace('mb-8', 'mb-5')
content = content.replace('text-2xl font-bold', 'text-xl font-bold')

with open('src/components/CommunityForum.tsx', 'w') as f:
    f.write(content)

