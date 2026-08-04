with open('src/index.css', 'r') as f:
    content = f.read()

content = content.replace(
    'html {\n    font-family',
    'html {\n    font-size: 14px;\n    font-family'
)

with open('src/index.css', 'w') as f:
    f.write(content)
