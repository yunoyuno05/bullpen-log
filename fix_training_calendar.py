import re

with open('src/components/TrainingCalendar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""  onAddVideo = () => {
  const { formatSpeed, formatWeight, speedUnit, weightUnit } = useUnits();
},""", "  onAddVideo = () => {},"
)

# And now inject it right after `}) => {`
content = content.replace(
"""}) => {
  const todayObj = new Date();""",
"""}) => {
  const { formatSpeed, formatWeight, speedUnit, weightUnit } = useUnits();
  const todayObj = new Date();"""
)

with open('src/components/TrainingCalendar.tsx', 'w') as f:
    f.write(content)
print("Fixed TrainingCalendar")
