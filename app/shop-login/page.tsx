"use client";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShopLoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const res = await fetch("/api/auth/shop-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      setSuccess("Shop login successful!");

      console.log("Logged in shop:", data.user);

      router.push("/shop-dashboard");
    } catch (error) {
      console.error("Shop login error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="auth-back"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">
            <Store className="size-7" />
          </div>

          <div>
            <div className="auth-brand-name">
              ResQ<span>Route</span>
            </div>

            <p>Partner roadside services.</p>
          </div>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <p className="auth-eyebrow">
            SERVICE PARTNER
          </p>

          <h1>Shop Partner Login</h1>

          <p>
            Sign in to manage your roadside service
            business and customer requests.
          </p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="shop-email">
              Business email
            </label>

            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" />

              <input
                id="shop-email"
                name="email"
                type="email"
                placeholder="business@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="shop-password">
                Password
              </label>

              <Link href="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <div className="auth-input-wrap">
              <LockKeyhole className="auth-input-icon" />

              <input
                id="shop-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
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
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In as Partner"}
          </button>

        </form>

        {/* Register */}
        <div className="auth-signup">
          <span>
            Not registered as a partner?
          </span>

          <Link href="/shop-register">
            Register your business
          </Link>
        </div>

        {/* User Login */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        <Link
          href="/login"
          className="auth-guest"
        >
          Login as User
        </Link>

      </div>
    </main>
  );
}