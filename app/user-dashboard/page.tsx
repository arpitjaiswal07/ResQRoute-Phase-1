import { SiteHeader } from '@/components/site-header'
import { ResqApp } from '@/components/resq-app'
import AIDiagnosis from '@/components/ai-diagnosis'
import { EmergencyFooter } from '@/components/emergency-footer'


export default function Page() {
  return (
    <main id="top" className="rq-app-shell">
      <SiteHeader />
      
      <ResqApp />

     {/* AI Vehicle Diagnosis */}
<section id="assistant" className="rq-ai-section">
  <div className="rq-ai-card">
    <div className="rq-ai-copy">
      <span className="rq-kicker">
        SMART ROADSIDE SUPPORT
      </span>

      <h2>AI Vehicle Diagnosis</h2>

      <p>
        Describe what your vehicle is doing and get fast,
        safety-first guidance powered by your Groq AI
        integration.
      </p>

      <div className="rq-ai-points">
        <span>✦ Probable causes</span>
        <span>✦ Safety steps</span>
        <span>✦ Mechanic or towing guidance</span>
      </div>
    </div>

    <div className="rq-ai-diagnosis-wrapper">
      <AIDiagnosis />
    </div>
  </div>
</section>
      {/* Emergency SOS */}
      <section className="rq-sos-section">
        <div>
          <span className="rq-kicker">
            CRITICAL SITUATIONS
          </span>

          <h2 className="font-display text-2xl font-extrabold tracking-tight">
  Emergency SOS
</h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
  Need immediate help? Send your location and call
  emergency services.
</p>
        </div>

        <div className="rq-sos-actions">
          <a href="tel:112">
            Police
            <small>Call 112</small>
          </a>

          <a href="tel:102">
            Ambulance
            <small>Call 102</small>
          </a>

          <a href="tel:112" className="danger">
            SOS
            <small>Call 112</small>
          </a>
        </div>
      </section>

      <EmergencyFooter />
    </main>
  )
}