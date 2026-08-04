import re

with open('/app/applet/src/lib/store.ts', 'r') as f:
    content = f.read()

# Add i18n changeLanguage for initialization
init_lang = """
const initialUser = getInitialUser();
if (initialUser?.langPref) {
  i18n.changeLanguage(initialUser.langPref);
}
"""

if "const initialUser = getInitialUser();" in content and "if (initialUser?.langPref)" not in content:
    content = content.replace("const initialUser = getInitialUser();", init_lang)
    with open('/app/applet/src/lib/store.ts', 'w') as f:
        f.write(content)
    print("store.ts initialized language")
