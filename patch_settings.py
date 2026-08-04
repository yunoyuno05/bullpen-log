import re

with open('/app/applet/src/components/SettingsTab.tsx', 'r') as f:
    content = f.read()

# 1. Update useAppStore call
content = content.replace(
    "const { theme, setTheme, language, setLanguage } = useAppStore();",
    "const { theme, setTheme, language, setLanguage, speedUnit: storeSpeedUnit, setSpeedUnit, weightUnit: storeWeightUnit, setWeightUnit, user, setUser } = useAppStore();"
)

# 2. Update local state initialization to use store values
content = content.replace(
    "const [speedUnit, setSpeedUnit] = useState<'kmh'|'mph'>('kmh');",
    "const [localSpeedUnit, setLocalSpeedUnit] = useState<'kmh'|'mph'>(storeSpeedUnit);"
)
content = content.replace(
    "const [weightUnit, setWeightUnit] = useState<'kg'|'lbs'>('kg');",
    "const [localWeightUnit, setLocalWeightUnit] = useState<'kg'|'lbs'>(storeWeightUnit);"
)

# Now, wait, the template uses `setSpeedUnit` which we renamed to `setLocalSpeedUnit`.
# Let's replace the bindings
content = content.replace("setSpeedUnit(", "setLocalSpeedUnit(")
content = content.replace("speedUnit ===", "localSpeedUnit ===")

content = content.replace("setWeightUnit(", "setLocalWeightUnit(")
content = content.replace("weightUnit ===", "localWeightUnit ===")

# Wait, `setSpeedUnit` from store was extracted. So it's fine.

# 3. Update handleSaveSettings
save_code = """
  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    
    // Update store
    setSpeedUnit(localSpeedUnit);
    setWeightUnit(localWeightUnit);
    
    // Save to local storage
    if (user) {
      const updatedUser = { 
        ...user, 
        themePref: theme, 
        langPref: language, 
        speedUnit: localSpeedUnit, 
        weightUnit: localWeightUnit 
      };
      setUser(updatedUser);
      localStorage.setItem('bullpen_user_account', JSON.stringify(updatedUser));
    } else {
      const saved = localStorage.getItem('bullpen_user_account');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updatedUser = {
            ...parsed,
            themePref: theme,
            langPref: language,
            speedUnit: localSpeedUnit,
            weightUnit: localWeightUnit
          };
          localStorage.setItem('bullpen_user_account', JSON.stringify(updatedUser));
        } catch (e) {}
      }
    }

    setTimeout(() => {
      setIsSavingSettings(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };
"""

content = re.sub(
    r"const handleSaveSettings = \(\) => \{[\s\S]*?\}, 600\);\n  \};",
    save_code.strip(),
    content
)

with open('/app/applet/src/components/SettingsTab.tsx', 'w') as f:
    f.write(content)
print("SettingsTab.tsx patched.")
