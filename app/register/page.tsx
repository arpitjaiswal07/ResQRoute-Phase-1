"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/login" className="auth-back">
          <ArrowLeft className="size-4" />
          Back to Login
        </Link>

        <div className="auth-brand">
          <div className="auth-logo">
            <ShieldCheck className="size-7" />
          </div>

          <div>
            <div className="auth-brand-name">
              ResQ<span>Route</span>
            </div>
            <p>Roadside assistance, simplified.</p>
          </div>
        </div>

        <div className="auth-heading">
          <p className="auth-eyebrow">GET STARTED</p>

          <h1>Create your account</h1>

          <p>
            Create a ResQRoute account to quickly access roadside assistance
            whenever you need it.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault();

            setError("");
            setSuccess("");
            setLoading(true);

            const form = e.currentTarget;

            const name = (form.elements.namedItem("name") as HTMLInputElement)
              .value;
            const email = (
              form.elements.namedItem("register-email") as HTMLInputElement
            ).value;
            const phone = (form.elements.namedItem("phone") as HTMLInputElement)
              .value;
            const password = (
              form.elements.namedItem("register-password") as HTMLInputElement
            ).value;
            const confirmPassword = (
              form.elements.namedItem("confirm-password") as HTMLInputElement
            ).value;

            try {
              const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name,
                  email,
                  phone,
                  password,
                  confirmPassword,
                }),
              });

              const data = await response.json();

              if (!response.ok) {
                setError(data.error || "Registration failed");
                return;
              }

              setSuccess("Account created successfully! You can now sign in.");
              form.reset();
            } catch {
              setError("Something went wrong. Please try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          {/* Name */}
          <div className="auth-field">
            <label htmlFor="name">Full name</label>

            <div className="auth-input-wrap">
              <User className="auth-input-icon" />

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="register-email">Email address</label>

            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" />

              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="auth-field">
            <label htmlFor="phone">Mobile number</label>

            <div className="auth-input-wrap">
              <Phone className="auth-input-icon" />

              <input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="register-password">Password</label>

            <div className="auth-input-wrap">
              <LockKeyhole className="auth-input-icon" />

              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="auth-field">
            <label htmlFor="confirm-password">Confirm password</label>

            <div className="auth-input-wrap">
              <LockKeyhole className="auth-input-icon" />

              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="auth-checkbox">
            <input type="checkbox" />
            <span>I agree to the Terms & Privacy Policy</span>
          </label>

          {/* Create account */}

          {error && <p className="auth-error">{error}</p>}

          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-signup">
          <span>Already have an account?</span>

          <Link href="/login">Sign in</Link>
        </div>

        <div className="auth-security">
          <ShieldCheck className="size-4" />
          <span>Your information is securely protected</span>
        </div>
      </div>
    </main>
  );
}
