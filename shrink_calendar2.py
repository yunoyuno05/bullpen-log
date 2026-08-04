import re

with open('src/components/TrainingCalendar.tsx', 'r') as f:
    content = f.read()

# Make it tighter
content = content.replace('text-[10px]', 'text-[9px]') # Make text-[10px] -> text-[9px]
content = content.replace('h-20 sm:h-24', 'h-16 sm:h-20') # Make cells smaller
content = content.replace('p-1.5 border text-left', 'p-1 border text-left')
content = content.replace('gap-4', 'gap-3')
content = content.replace('p-4 sm:p-5', 'p-3 sm:p-4')
content = content.replace('space-y-5', 'space-y-4')

with open('src/components/TrainingCalendar.tsx', 'w') as f:
    f.write(content)
