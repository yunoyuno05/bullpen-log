import sys

with open('src/components/AuthModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("interface AuthModalProps {\n  isOpen: boolean;\n  onClose: () => void;\n  onLoginSuccess: (user: UserAccount) => void;", "interface AuthModalProps {\n  isOpen: boolean;\n  onClose: () => void;\n  onLoginSuccess: (user: UserAccount, isNewUser?: boolean) => void;")

content = content.replace("onLoginSuccess(userData);\n    onClose();", "onLoginSuccess(userData, mode === 'signup');\n    onClose();")

with open('src/components/AuthModal.tsx', 'w') as f:
    f.write(content)

