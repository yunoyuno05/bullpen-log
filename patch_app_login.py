import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_login = """  const handleLoginSuccess = (user: UserAccount) => {
    if (authMode === 'signup') {"""

new_login = """  const handleLoginSuccess = (user: UserAccount, isNewUser?: boolean) => {
    if (authMode === 'signup' || isNewUser) {"""

content = content.replace(old_login, new_login)

old_signup = """            {activeTab === 'signup' && (
              <SignUpPage
                onReturnHome={() => setActiveTab('hero')}
                onOpenLogin={() => setIsAuthModalOpen(true)}
                onLoginSuccess={(user) => {
                  handleLoginSuccess(user);
                  setActiveTab('dashboard');
                }}
              />
            )}"""

new_signup = """            {activeTab === 'signup' && (
              <SignUpPage
                onReturnHome={() => setActiveTab('hero')}
                onOpenLogin={() => setIsAuthModalOpen(true)}
                onLoginSuccess={(user) => {
                  handleLoginSuccess(user, true);
                  // setActiveTab('dashboard'); // Will be set after onboarding completes
                }}
              />
            )}"""

content = content.replace(old_signup, new_signup)

with open('src/App.tsx', 'w') as f:
    f.write(content)

