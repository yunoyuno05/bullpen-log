import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

event_listener = """
  useEffect(() => {
    const handleOpenPricing = () => {
      if (currentUser) {
        setOnboardingUser(currentUser);
        setShowOnboarding(true);
      } else {
        setAuthMode('signup');
        setIsAuthModalOpen(true);
      }
    };
    
    window.addEventListener('open-pricing-modal', handleOpenPricing);
    return () => window.removeEventListener('open-pricing-modal', handleOpenPricing);
  }, [currentUser]);
"""

# Insert right before checkSupabaseAuth definition
if 'open-pricing-modal' not in content:
    content = content.replace("  useEffect(() => {", event_listener + "\n  useEffect(() => {", 1)

with open('src/App.tsx', 'w') as f:
    f.write(content)

