"use client";

import {
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  phone: string;
  role: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        if (data.authenticated) {
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h1>Please sign in</h1>

          <Link href="/login" className="auth-submit">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-card">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/user-dashboard")}
          className="auth-back"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="auth-brand">
          <div className="auth-logo">
            <UserCircle className="size-7" />
          </div>

          <div>
            <div className="auth-brand-name">
              ResQ<span>Route</span>
            </div>

            <p>My account</p>
          </div>
        </div>

        <div className="auth-heading">
          <p className="auth-eyebrow">PROFILE</p>

          <h1>{user.name}</h1>

          <p>
            Manage your ResQRoute account information.
          </p>
        </div>

        <div className="auth-form">

          <div className="auth-field">
            <label>Name</label>

            <div className="auth-input-wrap">
              <UserCircle className="auth-input-icon" />

              <input
                value={user.name}
                readOnly
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Email address</label>

            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" />

              <input
                value={user.email}
                readOnly
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Mobile number</label>

            <div className="auth-input-wrap">
              <Phone className="auth-input-icon" />

              <input
                value={user.phone}
                readOnly
              />
            </div>
          </div>

          <div className="auth-security">
            <ShieldCheck className="size-4" />

            <span>
              Your account is protected by ResQRoute authentication.
            </span>
          </div>

          <button
            type="button"
            className="auth-submit"
            onClick={async () => {
              await fetch("/api/auth/logout", {
                method: "POST",
              });

              router.push("/login");
              router.refresh();
            }}
          >
            Sign Out
          </button>

          <Link
            href="/"
            className="auth-submit"
            style={{
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Back to Home
          </Link>

        </div>
      </div>
    </main>
  );
}