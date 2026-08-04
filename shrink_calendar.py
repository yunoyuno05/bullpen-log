import re

with open('src/components/TrainingCalendar.tsx', 'r') as f:
    content = f.read()

# Make the wrapper container max-w-5xl instead of whatever it is
# Wait, user asked to scale down the actual elements so it fits without being too long.

# 1. Cell height and padding
content = content.replace('gap-2', 'gap-1.5')
content = content.replace('h-24 sm:h-28', 'h-20 sm:h-24')
content = content.replace('p-5 sm:p-7', 'p-4 sm:p-5')
content = content.replace('space-y-6', 'space-y-4')
content = content.replace('space-y-8', 'space-y-5')
content = content.replace('pt-24 pb-16 px-4 md:px-8', 'pt-20 pb-12 px-4 md:px-8')
content = content.replace('mb-2 flex items-center justify-between', 'mb-1 flex items-center justify-between')
content = content.replace('mb-1 flex items-center justify-between', 'mb-0.5 flex items-center justify-between')

# 2. Text sizes in cell headers
content = content.replace('text-xs font-black', 'text-[10px] font-black')
content = content.replace('text-lg sm:text-2xl', 'text-base sm:text-lg')
content = content.replace('p-2 border text-left', 'p-1.5 border text-left')
content = content.replace('w-6 h-6', 'w-5 h-5') # Reduce icons

# 3. Inside the cell blocks
content = content.replace('px-1.5 py-0.5 rounded flex items-center justify-between', 'px-1 py-0.5 rounded flex items-center justify-between')
content = content.replace('text-[10px]', 'text-[9px]')
content = content.replace('text-[9px]', 'text-[10px]') # revert mistake if I want text-[10px], I'll use regex.
content = content.replace('w-3 h-3', 'w-2.5 h-2.5')

with open('src/components/TrainingCalendar.tsx', 'w') as f:
    f.write(content)
