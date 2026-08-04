import sys

with open('src/components/AuthModal.tsx', 'r') as f:
    content = f.read()

# 1. Add new state variables
state_injection = """  const [selectedPitchTypes, setSelectedPitchTypes] = useState<string[]>(['포심 패스트볼', '슬라이더']);
  const [pitchCustomText, setPitchCustomText] = useState<string>('');

  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
"""
content = content.replace("  const [selectedPitchTypes, setSelectedPitchTypes] = useState<string[]>(['포심 패스트볼', '슬라이더']);\n  const [pitchCustomText, setPitchCustomText] = useState<string>('');", state_injection)


# 2. Add verification functions
func_injection = """
  const handleSendVerification = async () => {
    if (!signupEmail.trim()) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }
    if (!signupPassword.trim() || signupPassword.length < 6) {
      setErrorMessage('비밀번호를 먼저 6자 이상 입력해주세요.');
      return;
    }
    if (signupPassword !== signupPasswordConfirm) {
      setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword.trim(),
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('이미 가입된 이메일입니다.');
        }
        throw error;
      }
      
      setIsVerificationSent(true);
      setSuccessMessage('인증번호가 전송되었습니다. 이메일을 확인해주세요.');
      
      if (data.session) {
        setIsVerified(true);
        setSuccessMessage('이메일이 자동으로 인증되었습니다 (테스트 모드).');
      }
    } catch (err: any) {
      console.error('Send verification error:', err);
      setErrorMessage(err.message || '인증번호 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) return;
    setIsVerifying(true);
    setErrorMessage(null);
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: signupEmail.trim(),
        token: verificationCode.trim(),
        type: 'signup'
      });
      
      if (error) throw error;
      
      setIsVerified(true);
      setSuccessMessage('이메일 인증이 완료되었습니다.');
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setErrorMessage('인증번호가 올바르지 않거나 만료되었습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNextSignupStep = () => {
"""
content = content.replace("  const handleNextSignupStep = () => {", func_injection)


# 3. Add verification check to step 1
step1_check_replacement = """    if (signupStep === 1) {
      if (!name.trim()) {
        setErrorMessage('선수 성명을 입력해주세요.');
        return;
      }
      if (!signupEmail.trim() || !signupPassword.trim()) {
        setErrorMessage('이메일과 비밀번호를 입력해주세요.');
        return;
      }
      if (signupPassword.length < 6) {
        setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (signupPassword !== signupPasswordConfirm) {
        setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
      if (!isVerified) {
        setErrorMessage('이메일 인증을 먼저 완료해주세요.');
        return;
      }
      setSignupStep(2);"""
# Target the existing step 1 validation logic
step1_target = """    if (signupStep === 1) {
      if (!name.trim()) {
        setErrorMessage('선수 성명을 입력해주세요.');
        return;
      }
      if (!signupEmail.trim() || !signupPassword.trim()) {
        setErrorMessage('이메일과 비밀번호를 입력해주세요.');
        return;
      }
      if (signupPassword.length < 6) {
        setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (signupPassword !== signupPasswordConfirm) {
        setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
      setSignupStep(2);"""
content = content.replace(step1_target, step1_check_replacement)


# 4. Modify handleSignupSubmit to use updateUser instead of signUp
submit_target = """    // Background sync with Supabase
    try {
      const { data: sbData } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword.trim(),
        options: {
          data: {
            name: userData.name,
            number: userData.number,
            team: userData.team,
            throwingArm: userData.throwingArm,
            role: userData.role,
            height: userData.height,
            weight: userData.weight,
            wingspan: userData.wingspan,
            age: userData.age,
            birthdate: userData.birthdate,
            maxVelocity: userData.maxVelocity,
          }
        }
      });
    } catch (sbErr) {
      console.error(sbErr);
    }"""

submit_replacement = """    // Background sync with Supabase
    try {
      const { error: sbError } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          number: userData.number,
          team: userData.team,
          throwingArm: userData.throwingArm,
          role: userData.role,
          height: userData.height,
          weight: userData.weight,
          wingspan: userData.wingspan,
          age: userData.age,
          birthdate: userData.birthdate,
          maxVelocity: userData.maxVelocity,
        }
      });
      if (sbError) {
        console.error('Supabase update error:', sbError);
      }
    } catch (sbErr) {
      console.error(sbErr);
    }"""
content = content.replace(submit_target, submit_replacement)


# 5. Modify UI for Email input to add verification
ui_email_target = """                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 font-medium">이메일 계정 *</label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                            <input
                              type="email"
                              required
                              placeholder="pitcher@example.com"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>
                        </div>"""

ui_email_replacement = """                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 font-medium">이메일 계정 *</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                              <input
                                type="email"
                                required
                                disabled={isVerificationSent || isVerified}
                                placeholder="pitcher@example.com"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-50"
                              />
                            </div>
                            <button 
                              type="button"
                              onClick={handleSendVerification}
                              disabled={isVerified || isLoading}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                            >
                              {isVerificationSent ? '재전송' : '인증번호 받기'}
                            </button>
                          </div>
                          
                          {isVerificationSent && !isVerified && (
                            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                              <label className="block text-xs text-emerald-300 font-bold mb-2">이메일로 전송된 인증번호 6자리를 입력해주세요</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="인증번호 6자리"
                                  value={verificationCode}
                                  onChange={(e) => setVerificationCode(e.target.value)}
                                  className="w-full bg-black/50 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 tracking-widest text-center"
                                />
                                <button 
                                  type="button"
                                  onClick={handleVerifyCode}
                                  disabled={isVerifying || !verificationCode}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                                >
                                  {isVerifying ? '확인 중...' : '인증하기'}
                                </button>
                              </div>
                            </div>
                          )}
                          {isVerified && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-1.5">
                              <Check className="w-3.5 h-3.5" /> 이메일 인증이 완료되었습니다.
                            </div>
                          )}
                        </div>"""
content = content.replace(ui_email_target, ui_email_replacement)


# 6. Disable password fields if verification is sent
ui_pw_target = """                              <input
                                type="password"
                                required
                                placeholder="최소 6자 이상"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              />"""
ui_pw_replacement = """                              <input
                                type="password"
                                required
                                disabled={isVerificationSent || isVerified}
                                placeholder="최소 6자 이상"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-50"
                              />"""
content = content.replace(ui_pw_target, ui_pw_replacement)

ui_pwc_target = """                              <input
                                type="password"
                                required
                                placeholder="비밀번호 재입력"
                                value={signupPasswordConfirm}
                                onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              />"""
ui_pwc_replacement = """                              <input
                                type="password"
                                required
                                disabled={isVerificationSent || isVerified}
                                placeholder="비밀번호 재입력"
                                value={signupPasswordConfirm}
                                onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-50"
                              />"""
content = content.replace(ui_pwc_target, ui_pwc_replacement)

with open('src/components/AuthModal.tsx', 'w') as f:
    f.write(content)

