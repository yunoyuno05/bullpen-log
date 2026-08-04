import os
import glob

components = [
    "src/components/CommunityForum.tsx",
    "src/components/SettingsTab.tsx",
    "src/components/AdminPanel.tsx",
    "src/components/SupportTicket.tsx",
    "src/components/SubscriptionLock.tsx"
]

for filepath in components:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()

    # Outer containers
    content = content.replace('max-w-4xl mx-auto p-4 sm:p-6 md:p-8 min-h-screen relative', 'pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto min-h-screen relative text-white')
    content = content.replace('max-w-4xl mx-auto p-4 sm:p-6 md:p-8 min-h-screen', 'pt-24 pb-16 px-4 md:px-8 max-w-3xl mx-auto min-h-screen text-white space-y-6')
    content = content.replace('max-w-6xl mx-auto p-4 sm:p-6 md:p-8 min-h-screen', 'pt-24 pb-16 px-4 md:px-8 max-w-5xl mx-auto min-h-screen text-white space-y-6')
    
    # Headers
    content = content.replace('text-3xl font-bold', 'text-2xl font-bold tracking-tight')

    # Cards
    content = content.replace('bg-gray-900 border border-white/10 rounded-2xl', 'bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[24px]')
    content = content.replace('bg-gray-900 border border-white/10 rounded-3xl', 'bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[24px]')
    content = content.replace('bg-gray-800 border border-white/10 rounded-xl', 'bg-black/40 backdrop-blur-md border border-white/10 rounded-[20px]')
    content = content.replace('bg-gray-800 rounded-xl', 'bg-black/40 rounded-[20px]')

    # Padding inside cards (reduce to make them look more compact)
    # Be careful not to replace generic strings
    
    with open(filepath, 'w') as f:
        f.write(content)
