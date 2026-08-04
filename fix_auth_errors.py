with open('src/components/AuthModal.tsx', 'r') as f:
    content = f.read()

old_1 = """    } catch (err: any) {
      console.error('Send verification error:', err);
      setErrorMessage(err.message || '인증번호 전송에 실패했습니다.');
    }"""
new_1 = """    } catch (err: any) {
      console.error('Send verification error:', err);
      let msg = err.message || '인증번호 전송에 실패했습니다.';
      if (msg.includes('secret API key') || msg.includes('service_role')) {
        msg = '오류: Supabase Anon Key 대신 Secret Key가 설정되었습니다. AI Studio Settings에서 VITE_SUPABASE_ANON_KEY 값을 public(anon) 키로 변경해주세요.';
      }
      setErrorMessage(msg);
    }"""
content = content.replace(old_1, new_1)

old_3 = """    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err?.message || '인증 처리 중 오류가 발생했습니다.';
      if (msg.includes('Invalid login credentials')) {
        msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (msg.includes('Email not confirmed')) {
        msg = '이메일 인증이 완료되지 않았습니다. 수신함에서 발송된 인증 링크를 확인해 주세요.';
      }
      setErrorMessage(msg);
    }"""
new_3 = """    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err?.message || '인증 처리 중 오류가 발생했습니다.';
      if (msg.includes('Invalid login credentials')) {
        msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (msg.includes('Email not confirmed')) {
        msg = '이메일 인증이 완료되지 않았습니다. 수신함에서 발송된 인증 링크를 확인해 주세요.';
      } else if (msg.includes('secret API key') || msg.includes('service_role')) {
        msg = '오류: Supabase Anon Key 대신 Secret Key가 설정되었습니다. AI Studio Settings에서 VITE_SUPABASE_ANON_KEY 값을 public(anon) 키로 변경해주세요.';
      }
      setErrorMessage(msg);
    }"""
content = content.replace(old_3, new_3)

with open('src/components/AuthModal.tsx', 'w') as f:
    f.write(content)

