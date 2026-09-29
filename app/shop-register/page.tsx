"use client";

import {
  ArrowDown,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Store,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SERVICE_TYPES = [
  "Mechanic / Garage",
  "Towing Service",
  "Emergency Rental Cars",
];

export default function ShopRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [serviceType, setServiceType] = useState("");
  const [serviceOpen, setServiceOpen] = useState(false);

  const serviceRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        serviceRef.current &&
        !serviceRef.current.contains(event.target as Node)
      ) {
        setServiceOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const password = String(formData.get("password") || "");
    const serviceType = String(formData.get("serviceType") || "");
    const confirmPassword = String(
      formData.get("confirmPassword") || "",
    );

      if (
    !name ||
    !email ||
    !phone ||
    !serviceType ||
    !password ||
    !confirmPassword
  ) {
    setError("Please fill all fields.");
    setLoading(false);
    return;
  }

    try {
      const res = await fetch("/api/auth/shop-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
 body: JSON.stringify({
  name,
  email,
  phone,
  serviceType,
  password,
  confirmPassword,
}),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccess("Business account created successfully!");

      setTimeout(() => {
        router.push("/shop-login");
      }, 1000);
    } catch (error) {
      console.error("Shop registration error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        {/* Back */}
        <Link href="/shop-login" className="auth-back">
          <ArrowLeft className="size-4" />
          Back to Partner Login
        </Link>

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
          <p className="auth-eyebrow">BECOME A PARTNER</p>

          <h1>Register your business</h1>

          <p>
            Join ResQRoute and connect your roadside service business with
            drivers who need help.
          </p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Business name */}
          <div className="auth-field">
            <label htmlFor="shop-name">Business name</label>

            <div className="auth-input-wrap">
              <Store className="auth-input-icon" />

              <input
                id="shop-name"
                name="name"
                type="text"
                placeholder="Enter your business name"
                autoComplete="organization"
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="shop-register-email">
              Business email
            </label>

            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" />

              <input
                id="shop-register-email"
                name="email"
                type="email"
                placeholder="business@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="auth-field">
            <label htmlFor="shop-phone">Business phone</label>

            <div className="auth-input-wrap">
              <Phone className="auth-input-icon" />

              <input
                id="shop-phone"
                name="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                autoComplete="tel"
              />
            </div>
          </div>

          
          {/* Service type */}
<div className="auth-field">
  <label htmlFor="shop-service-type">
    Service type
  </label>

  <div className="auth-input-wrap auth-select-wrap">
    <Store className="auth-input-icon" />

    <select
      id="shop-service-type"
      name="serviceType"
      defaultValue=""
      className="auth-select"
      required
    >
      <option value="" disabled>
        Select your service type
      </option>

      <option value="mechanics">
        Mechanic / Garage
      </option>

      <option value="towing">
        Towing Service
      </option>

      <option value="rentals">
        Emergency Rental Cars
      </option>
    </select>
  </div>
</div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="shop-register-password">
              Password
            </label>

            <div className="auth-input-wrap">
              <LockKeyhole className="auth-input-icon" />

              <input
                id="shop-register-password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a password"
                autoComplete="new-password"
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

          {/* Confirm password */}
          <div className="auth-field">
            <label htmlFor="shop-confirm-password">
              Confirm password
            </label>

            <div className="auth-input-wrap">
              <LockKeyhole className="auth-input-icon" />

              <input
                id="shop-confirm-password"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword,
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
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

            <span>
              I agree to the Partner Terms & Privacy Policy
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register Business"}
          </button>
        </form>

        {/* Login */}
        <div className="auth-signup">
          <span>
            Already a ResQRoute partner?
          </span>

          <Link href="/shop-login">
            Sign in
          </Link>
        </div>

        {/* User account */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        <Link
          href="/register"
          className="auth-guest"
        >
          Create a User Account
        </Link>
      </div>
    </main>
  );
}