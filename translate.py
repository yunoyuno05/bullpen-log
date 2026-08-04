import os
import re
import json

def get_korean_strings(content):
    # Find all strings containing Korean characters
    # This regex looks for text between > and < or quotes containing Korean
    korean_pattern = re.compile(r'[\uac00-\ud7a3]+')
    return korean_pattern.findall(content)

# We want a more precise replacement. 
# Finding >...Korean...<
