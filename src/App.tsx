import { FormEvent, useMemo, useState } from "react";
import "./App.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9()+\-\s]{7,}$/;
const PASSWORD_RULES = {
  minLength: 12,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /\d/,
  symbol: /[^A-Za-z0-9]/,
};

const App = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const trimmedEmail = email.trim();
  const trimmedPhone = phone.trim();
  const trimmedPassword = password.trim();

  const hasContact = trimmedEmail.length > 0 || trimmedPhone.length > 0;
  const emailValid = trimmedEmail.length === 0 || EMAIL_REGEX.test(trimmedEmail);
  const phoneValid = trimmedPhone.length === 0 || PHONE_REGEX.test(trimmedPhone);
  const passwordRules = {
    minLength: trimmedPassword.length >= PASSWORD_RULES.minLength,
    upper: PASSWORD_RULES.upper.test(trimmedPassword),
    lower: PASSWORD_RULES.lower.test(trimmedPassword),
    number: PASSWORD_RULES.number.test(trimmedPassword),
    symbol: PASSWORD_RULES.symbol.test(trimmedPassword),
  };
  const passwordValid = Object.values(passwordRules).every(Boolean);
  const contactValid = hasContact && emailValid && phoneValid;

  const canContinue = useMemo(
    () => contactValid && passwordValid,
    [contactValid, passwordValid]
  );

  const showErrors = submitted;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page">
      <main className="card">
        <header className="card__header">
          <span className="brand">GoFundMe</span>
          <h1>Get started in 2 clicks</h1>
          <p>Continue with Apple or Google. Or use email or phone.</p>
          <div className="trust">
            <LockIcon />
            <span>Safe & secure. Your info is protected.</span>
          </div>
        </header>

        <section className="social" aria-label="Social sign up">
          <p className="quick">Fastest: Apple or Google in 2 clicks.</p>
          <button className="social__button apple" type="button">
            <AppleIcon />
            Continue with Apple
          </button>
          <button className="social__button google" type="button">
            <GoogleIcon />
            Continue with Google
          </button>
          <button className="social__button sso" type="button">
            <SsoIcon />
            Continue with SSO
          </button>
        </section>

        <div className="divider" aria-hidden="true">
          <span>or</span>
        </div>

        <form
          className="form"
          aria-describedby="form-helper"
          noValidate
          onSubmit={handleSubmit}
        >
          <fieldset className="fieldset">
            <legend className="legend">Sign up with email or phone</legend>

            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={showErrors && !emailValid}
                aria-describedby="email-hint"
              />
              <span className="hint" id="email-hint">
                {showErrors && trimmedEmail.length > 0 && !emailValid
                  ? "Enter a valid email address."
                  : "Use a valid email like name@example.com."}
              </span>
            </label>

            <label className="field">
              <span>Phone number</span>
              <input
                type="tel"
                name="phone"
                placeholder="(555) 123-4567"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                aria-invalid={showErrors && !phoneValid}
                aria-describedby="phone-hint"
              />
              <span className="hint" id="phone-hint">
                {showErrors && trimmedPhone.length > 0 && !phoneValid
                  ? "Enter a valid phone number."
                  : "Include country code if outside the U.S."}
              </span>
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="At least 12 characters"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby="password-hint"
                aria-invalid={showErrors && !passwordValid}
              />
              <span className="hint" id="password-hint">
                Use a strong password with all requirements below.
              </span>
              <ul className="password-rules" aria-live="polite">
                <li className={passwordRules.minLength ? "met" : "unmet"}>
                  12+ characters
                </li>
                <li className={passwordRules.upper ? "met" : "unmet"}>
                  Uppercase letter
                </li>
                <li className={passwordRules.lower ? "met" : "unmet"}>
                  Lowercase letter
                </li>
                <li className={passwordRules.number ? "met" : "unmet"}>
                  Number
                </li>
                <li className={passwordRules.symbol ? "met" : "unmet"}>
                  Symbol
                </li>
              </ul>
            </label>
          </fieldset>

          <button className="primary" type="submit" disabled={!canContinue}>
            Continue with email or phone
          </button>
          <p className="helper" id="form-helper">
            {showErrors && !contactValid
              ? "Add a valid email or phone number to continue."
              : showErrors && !passwordValid
              ? "Password must meet all requirements."
              : "Two clicks with Apple or Google. Or enter your info above."}
          </p>
        </form>

        <section className="alt-auth" aria-label="Passkey or authenticator">
          <p className="alt-auth__title">More secure options</p>
          <button className="social__button passkey" type="button">
            <PasskeyIcon />
            Use a passkey
          </button>
          <button className="social__button mfa" type="button">
            <AuthenticatorIcon />
            Use an authenticator app
          </button>
          <p className="alt-auth__note">
            Passkeys and authenticator apps add extra protection to your account.
          </p>
        </section>

        <footer className="footer">
          <span>Already have an account?</span>
          <button className="link" type="button">
            Sign in
          </button>
          <ul className="benefits" aria-label="Security benefits">
            <li>Secure donations and payment details</li>
            <li>Protected account and privacy controls</li>
            <li>Faster access to your fundraisers</li>
          </ul>
          <details className="compliance">
            <summary>Compliance and regional availability</summary>
            <div className="compliance__details">
              <span>SOC 2 compliant • GDPR ready • Data encrypted in transit</span>
              <span>
                Serving donors and organizers across the US, UK, EU, and more.
              </span>
            </div>
          </details>
          <p className="legal">
            By continuing, you agree to GoFundMe&apos;s Terms and acknowledge the
            Privacy Policy.
          </p>
        </footer>
      </main>
    </div>
  );
};

const AppleIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    focusable="false"
  >
    <path
      d="M16.6 2.5c-1 .7-1.8 2-1.6 3.3 1.2.1 2.4-.6 3.1-1.5.7-.9 1.1-2.2 1-3.3-1.1.1-2.3.7-3.1 1.5ZM20 17.1c-.4.9-.6 1.3-1.1 2.1-.7 1.1-1.7 2.5-2.9 2.5-1.1 0-1.4-.7-2.8-.7-1.4 0-1.8.7-2.8.7-1.2 0-2.1-1.3-2.8-2.4-1.6-2.5-1.8-5.5-.8-7.1.7-1.2 1.8-1.9 3-1.9 1.1 0 2 .7 2.8.7.8 0 2-.9 3.4-.8.6 0 2.1.2 3.1 1.7-2.7 1.5-2.3 5.3.9 6.2Z"
      fill="currentColor"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    focusable="false"
  >
    <path
      d="M23.5 12.3c0-.8-.1-1.4-.2-2.1H12v4h6.5c-.3 1.7-1.3 3.1-2.8 4V21h4.5c2.6-2.4 4.1-5.9 4.1-8.7Z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.5 0 6.5-1.2 8.7-3.3l-4.5-3.4c-1.2.8-2.7 1.3-4.2 1.3-3.2 0-5.9-2.1-6.9-5H.5v3.2C2.7 21.4 7 24 12 24Z"
      fill="#34A853"
    />
    <path
      d="M5.1 13.6c-.2-.6-.4-1.2-.4-1.6s.1-1 .4-1.6V7.2H.5C.2 8 .1 8.9.1 12s.2 4 .4 4.8l4.6-3.2Z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.8c1.9 0 3.5.7 4.8 1.9l3.6-3.6C18.5.9 15.5 0 12 0 7 0 2.7 2.6.5 6.8l4.6 3.2c1-2.9 3.7-5.2 6.9-5.2Z"
      fill="#EA4335"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    focusable="false"
  >
    <path
      d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2ZM10 7a2 2 0 1 1 4 0v2h-4V7Zm2 8a2 2 0 0 1-1-3.7V11a1 1 0 1 1 2 0v.3a2 2 0 0 1-1 3.7Z"
      fill="currentColor"
    />
  </svg>
);

const PasskeyIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    focusable="false"
  >
    <path
      d="M9.2 14a4.8 4.8 0 1 1 4.7-5.8h7.1a2 2 0 0 1 2 2v1.6a1 1 0 0 1-1 1h-1.2v1.6a1 1 0 0 1-1 1h-1.6v1.2a1 1 0 0 1-1 1H13a4.8 4.8 0 0 1-3.8-2.6Zm0-2.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"
      fill="currentColor"
    />
  </svg>
);

const AuthenticatorIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    focusable="false"
  >
    <path
      d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 4.2a2 2 0 1 1-2 2 2 2 0 0 1 2-2Zm0 13.3a7.6 7.6 0 0 1-5.9-2.9 4.8 4.8 0 0 1 9.8 0A7.6 7.6 0 0 1 12 19.5Z"
      fill="currentColor"
    />
  </svg>
);

const SsoIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    focusable="false"
  >
    <path
      d="M4 6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3h-2V6H6v12h6v-3h2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm10 6h-3v-2h3V8l5 4-5 4v-2Z"
      fill="currentColor"
    />
  </svg>
);

export default App;
