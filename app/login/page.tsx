"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  return (
    <main className="auth-page">
      <div className="auth-card">
        {/* Back */}
        <Link href="/" className="auth-back">
          <ArrowLeft className="size-4" />
          Back to ResQRoute
        </Link>

        {/* Brand */}
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

        {/* Heading */}
        <div className="auth-heading">
          <p className="auth-eyebrow">WELCOME BACK</p>

          <h1>Sign in to ResQRoute</h1>

          <p>
            Access nearby roadside services, saved providers, emergency
            assistance and more.
          </p>
        </div>

        {/* Form */}
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault();

            setError("");
            setSuccess("");
            setLoading(true);

            const form = e.currentTarget;

            const email = (form.elements.namedItem("email") as HTMLInputElement)
              .value;

            const password = (
              form.elements.namedItem("password") as HTMLInputElement
            ).value;

            try {
              const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email,
                  password,
                }),
              });

              const data = await response.json();

              if (!response.ok) {
                setError(data.error || "Login failed");
                return;
              }

             setSuccess("Login successful!");

console.log("Logged in user:", data.user);

setTimeout(() => {
  router.push("/user-dashboard");
}, 700);
            } catch {
              setError("Something went wrong. Please try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          {/* Email */}
          <div className="auth-field">
            <label htmlFor="email">Email address</label>

            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" />

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="password">Password</label>

              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <div className="auth-input-wrap">
              <LockKeyhole className="auth-input-icon" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
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

          {/* Remember */}
          <label className="auth-checkbox">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>

          {/* Login */}

          {error && <p className="auth-error">{error}</p>}

          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Signup */}
        <div className="auth-signup">
          <span>Don't have an account?</span>
          <Link href="/register">Create account</Link>
        </div>

        {/* Guest */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        <Link href="/user-dashboard" className="auth-guest">
  Continue as Guest
</Link>

        {/* Security */}
        <div className="auth-security">
          <ShieldCheck className="size-4" />
          <span>Your information is securely protected</span>
        </div>
      </div>
    </main>
  );
}
