// import { SiteHeader } from '@/components/site-header'
// import { ResqApp } from '@/components/resq-app'
// import { AiDiagnosis } from '@/components/ai-diagnosis'
// import { EmergencyFooter } from '@/components/emergency-footer'

// export default function Page() {
//   return (
//     <main id="top" className="rq-app-shell">
//       <SiteHeader />
//       <ResqApp />
//       <section id="assistant" className="rq-ai-section">
//         <div className="rq-ai-copy">
//           <span className="rq-kicker">SMART ROADSIDe SUPPORT</span>
//           <h2>AI Vehicle Diagnosis</h2>
//           <p>Describe what your vehicle is doing and get fast, safety-first guidance powered by your Groq AI integration.</p>
//           <div className="rq-ai-points"><span>✦ Probable causes</span><span>✦ Safety steps</span><span>✦ Mechanic or towing guidance</span></div>
//         </div>
//         <AiDiagnosis />
//       </section>
//       <section className="rq-sos-section">
//         <div><span className="rq-kicker">CRITICAL SITUATIONS</span><h2>Emergency SOS</h2><p>Need immediate help? Send your location and call emergency services.</p></div>
//         <div className="rq-sos-actions"><a href="tel:100">Police <small>Call 100</small></a><a href="tel:108">Ambulance <small>Call 108</small></a><a href="tel:112" className="danger">SOS <small>Call 112</small></a></div>
//       </section>
//       <EmergencyFooter />
//     </main>
//   )
// }
'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  MapPin,
  Moon,
  Navigation,
  PhoneCall,
  ShieldCheck,
  Sun,
  UserRound,
  Wrench,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false)

useEffect(() => {
  const savedTheme =
    localStorage.getItem("resqroute-theme");

  const isDark = savedTheme === "dark";

  setDarkMode(isDark);

  document.documentElement.classList.toggle(
    "dark",
    isDark,
  );

  document.documentElement.style.colorScheme =
    isDark ? "dark" : "light";
}, []);

function toggleTheme() {
  const nextTheme = !darkMode;

  setDarkMode(nextTheme);

  document.documentElement.classList.toggle(
    "dark",
    nextTheme,
  );

  document.documentElement.style.colorScheme =
    nextTheme ? "dark" : "light";

  localStorage.setItem(
    "resqroute-theme",
    nextTheme ? "dark" : "light",
  );
}

  return (
    <main className="rq-home">

      {/* HEADER */}
      <header className="rq-home-header">
        <Link
          href="/"
          className="rq-home-brand"
          aria-label="ResQRoute home"
        >
          <span className="rq-home-logo">
            <Navigation className="size-5" />
          </span>

          <span className="rq-home-brand-name">
            ResQ<span>Route</span>
          </span>
        </Link>

        <div className="rq-home-header-actions">
          <a
            href="tel:112"
            className="rq-home-emergency"
          >
            <PhoneCall className="size-4" />
            <span>Emergency 112</span>
          </a>

          <button
            type="button"
            className="rq-home-theme"
            onClick={toggleTheme}
            aria-label={
              darkMode
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            title={
              darkMode
                ? 'Light mode'
                : 'Dark mode'
            }
          >
            {darkMode ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <section className="rq-home-content">

        {/* BRAND */}
        <div className="rq-home-hero">
          <div className="rq-home-main-logo">
            <Navigation className="size-8" />
          </div>

          <h1>
            ResQ<span>Route</span>
          </h1>

          <p>
            Roadside Assistance, Reimagined
          </p>
        </div>

        {/* ROLE CARDS */}
        <div className="rq-role-grid">

          {/* USER */}
          <Link
            href="/login"
            className="rq-role-card rq-role-user"
          >
            <div className="rq-role-icon">
              <UserRound className="size-7" />
            </div>

            <div className="rq-role-content">
              <h2>I Need Help</h2>

              <p>
                Find roadside assistance
                <br />
                near you.
              </p>
            </div>

            <span className="rq-role-button">
              Continue as User
              <ArrowRight className="size-4" />
            </span>
          </Link>

          {/* PROVIDER */}
          <Link
            href="/shop-login"
            className="rq-role-card rq-role-provider"
          >
            <div className="rq-role-icon">
              <Wrench className="size-7" />
            </div>

            <div className="rq-role-content">
              <h2>I Provide Help</h2>

              <p>
                Manage requests and
                <br />
                help drivers.
              </p>
            </div>

            <span className="rq-role-button">
              Continue as Provider
              <ArrowRight className="size-4" />
            </span>
          </Link>

        </div>

        {/* QUICK ACCESS */}
        <section className="rq-quick-access">

          <div className="rq-quick-title">
            <span />
            <p>Quick Access</p>
            <span />
          </div>

          <div className="rq-quick-grid">

            <Link
              href="/map"
              className="rq-quick-item"
            >
              <span className="rq-quick-icon blue">
                <MapPin className="size-4" />
              </span>

              <span>
                <strong>View Map</strong>
                <small>Find nearby services</small>
              </span>
            </Link>

            <Link
              href="/ai-diagnosis"
              className="rq-quick-item"
            >
              <span className="rq-quick-icon purple">
                <Bot className="size-4" />
              </span>

              <span>
                <strong>AI Diagnosis</strong>
                <small>Get instant help</small>
              </span>
            </Link>

            <Link
              href="/sos"
              className="rq-quick-item"
            >
              <span className="rq-quick-icon green">
                <ShieldCheck className="size-4" />
              </span>

              <span>
                <strong>Safety Guide</strong>
                <small>Emergency support</small>
              </span>
            </Link>

            <a
  href="tel:102"
  className="rq-quick-item"
>
  <span className="rq-quick-icon red">
    <PhoneCall className="size-4" />
  </span>

  <span>
    <strong>Call 102</strong>
    <small>For medical emergency</small>
  </span>
</a>

          </div>
        </section>

        {/* EMERGENCY */}
        <a
          href="tel:112"
          className="rq-home-emergency-large"
        >
          <span className="rq-home-emergency-icon">
            <PhoneCall className="size-5" />
          </span>

          <span>
            <strong>Emergency 112</strong>
            <small>Immediate emergency assistance</small>
          </span>

          <ArrowRight className="size-5" />
        </a>

        {/* FOOT NOTE */}
        <p className="rq-home-footer-note">
          <ShieldCheck className="size-4" />
          24/7 Roadside Assistance
        </p>

      </section>
    </main>
  )
}