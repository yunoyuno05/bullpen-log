import re

# 1. Update types.ts
with open('/app/applet/src/types.ts', 'r') as f:
    types_content = f.read()

if 'speedUnit' not in types_content:
    types_content = types_content.replace(
        "langPref?: LanguageType;\n}",
        "langPref?: LanguageType;\n  speedUnit?: 'kmh' | 'mph';\n  weightUnit?: 'kg' | 'lbs';\n}"
    )
    with open('/app/applet/src/types.ts', 'w') as f:
        f.write(types_content)
        
# 2. Update store.ts
with open('/app/applet/src/lib/store.ts', 'r') as f:
    store_content = f.read()

if 'speedUnit: ' not in store_content:
    # Add to AppState
    store_content = store_content.replace(
        "language: LanguageType;\n",
        "language: LanguageType;\n  speedUnit: 'kmh' | 'mph';\n  weightUnit: 'kg' | 'lbs';\n"
    )
    
    store_content = store_content.replace(
        "setLanguage: (lang: LanguageType) => void;\n",
        "setLanguage: (lang: LanguageType) => void;\n  setSpeedUnit: (unit: 'kmh' | 'mph') => void;\n  setWeightUnit: (unit: 'kg' | 'lbs') => void;\n"
    )
    
    # Add to create AppState
    store_content = store_content.replace(
        "language: initialUser?.langPref || 'ko',\n",
        "language: initialUser?.langPref || 'ko',\n  speedUnit: initialUser?.speedUnit || 'kmh',\n  weightUnit: initialUser?.weightUnit || 'kg',\n"
    )
    
    store_content = store_content.replace(
        "setLanguage: (lang) => {\n    i18n.changeLanguage(lang);\n    set({ language: lang });\n  },\n",
        "setLanguage: (lang) => {\n    i18n.changeLanguage(lang);\n    set({ language: lang });\n  },\n  setSpeedUnit: (speedUnit) => set({ speedUnit }),\n  setWeightUnit: (weightUnit) => set({ weightUnit }),\n"
    )

    with open('/app/applet/src/lib/store.ts', 'w') as f:
        f.write(store_content)
print("Store and types updated.")
