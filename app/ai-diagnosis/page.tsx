'use client'

import { ArrowLeft, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AIDiagnosis from '@/components/ai-diagnosis'

export default function AIDiagnosisPage() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
       <button
  type="button"
  onClick={() => router.back()}
  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
>
  <ArrowLeft className="size-4" />
  Back
</button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="size-6" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              ResQRoute AI
            </p>

            <h1 className="text-2xl font-bold text-foreground">
              AI Diagnosis
            </h1>

            <p className="text-sm text-muted-foreground">
              Get AI-powered assistance for your roadside problem.
            </p>
          </div>
        </div>

        <AIDiagnosis />
      </div>
    </main>
  )
}