"use client"

import { useEffect, useRef } from "react"

const heroRecipientItems = [
  { label: "Connect Gmail via OAuth", tag: "1 min", tone: "success" },
  { label: "Set default price", tag: "$ stamp", tone: "accent" },
  { label: "Allowlist people & domains", tag: "Free pass", tone: "soft" },
  { label: "Share your Sinmail link", tag: "Public", tone: "accent" }
] satisfies { label: string; tag: string; tone: Tone }[]

const heroSenderItems = [
  { label: "Open link, write subject & body", tag: "No signup", tone: "soft" },
  {
    label: "Allowlisted? Delivers instantly",
    tag: "Skip pay",
    tone: "success"
  },
  { label: "Otherwise, pay then deliver", tag: "Stamp paid", tone: "accent" },
  {
    label: "Arrives in Gmail with “Sinmail”",
    tag: "Under 60s",
    tone: "success"
  }
] satisfies { label: string; tag: string; tone: Tone }[]

const featureCards = [
  {
    title: "Public link or embed",
    body: "Share a link or drop the form on your site. No new inbox UI; everything routes to Gmail.",
    icon: "🔗"
  },
  {
    title: "Allowlist rules",
    body: "Emails and domains bypass payments. Fine-tune who gets the free lane.",
    icon: "🛡️"
  },
  {
    title: "402x payments",
    body: "Unknown senders pay your default price. Receipts are stored and linked to each delivery.",
    icon: "💳"
  },
  {
    title: "Gmail-native delivery",
    body: "Messages appear in your inbox with the Sinmail label. Retries avoid double-charging.",
    icon: "📨"
  }
]

const steps = [
  {
    title: "Connect Gmail",
    body: "OAuth once. We create the Sinmail label and handle token refresh securely."
  },
  {
    title: "Set price & allowlist",
    body: "Pick a default price for strangers and add free-pass senders by email or domain."
  },
  {
    title: "Share your link",
    body: "Drop it on your site or signature. The form collects subject and message."
  },
  {
    title: "Pay or pass",
    body: "Allowlisted senders deliver instantly. Others pay via 402x; webhooks confirm funds."
  },
  {
    title: "Delivery & receipt",
    body: "Worker inserts into Gmail with Sinmail label, stores receipt URL, and retries safely."
  }
]

const pillars = [
  {
    title: "Delivery guardrails",
    body: "Idempotent keys across submissions, webhooks, and Gmail inserts to prevent double charges or double sends."
  },
  {
    title: "Security first",
    body: "Webhook signature checks, token encryption, and rate limits on public endpoints with optional CAPTCHA."
  },
  {
    title: "Observability",
    body: "Structured logs plus delivery attempts history so you can trace every message and payment."
  }
]

type Tone = "success" | "accent" | "soft"

function Chip({ label, tone }: { label: string; tone: Tone }) {
  return <span className={`chip ${tone}`}>{label}</span>
}

function PanelList({
  title,
  items
}: {
  title: string
  items: { label: string; tag: string; tone: Tone }[]
}) {
  return (
    <div className="panel">
      <div className="panel-title">{title}</div>
      <ul>
        {items.map(item => (
          <li key={item.label}>
            <span>{item.label}</span>
            <Chip label={item.tag} tone={item.tone} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Page() {
  const blobOne = useRef<HTMLDivElement | null>(null)
  const blobTwo = useRef<HTMLDivElement | null>(null)
  const blobThree = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined
    import("gsap").then(mod => {
      const gsap = mod.gsap
      const blobs = [
        blobOne.current,
        blobTwo.current,
        blobThree.current
      ].filter(Boolean) as HTMLDivElement[]
      blobs.forEach((el, idx) => {
        gsap.to(el, {
          x: `+=${12 + idx * 6}`,
          y: `-=${10 + idx * 4}`,
          duration: 8 + idx * 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        })
      })

      const handleMove = (e: PointerEvent) => {
        const { clientX, clientY } = e
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        blobs.forEach((el, idx) => {
          const damp = 0.08 + idx * 0.04
          gsap.to(el, {
            x: (clientX - cx) * damp,
            y: (clientY - cy) * damp,
            duration: 0.9,
            ease: "sine.out"
          })
        })
      }
      window.addEventListener("pointermove", handleMove)
      cleanup = () => window.removeEventListener("pointermove", handleMove)
    })
    return () => cleanup?.()
  }, [])

  return (
    <div className="page">
      <div className="page-bg" />
      <div ref={blobOne} className="blob blob-one" />
      <div ref={blobTwo} className="blob blob-two" />
      <div ref={blobThree} className="blob blob-three" />

      <header className="nav">
        <div className="nav-shell">
          <div className="logo">
            <div className="mark">✉</div>
            <div className="wordmark">Sinmail</div>
          </div>
          <nav className="nav-links">
            <a href="#product">Product</a>
            <a href="#flow">How it works</a>
            <a href="#features">Features</a>
            <a href="#cta" className="pill">
              Get started
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="eyebrow">Paid gate for your Gmail</div>
          <h1>Charge strangers to email your real inbox.</h1>
          <p className="lede">
            Sinmail adds a small “stamp” on cold emails into Gmail. Trusted
            people and domains skip the paywall; everyone else pays before their
            message is delivered, with receipts and labels for every send.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#cta">
              Start free
            </a>
            <a className="button ghost" href="#flow">
              See the flow
            </a>
          </div>

          <div className="hero-panels">
            <PanelList title="Recipient" items={heroRecipientItems} />
            <PanelList title="Sender" items={heroSenderItems} />
          </div>

          <div className="status-bar">
            <div className="status-item">
              <div className="label">Delivery SLA</div>
              <div className="value">≤ 60s</div>
            </div>
            <div className="status-item">
              <div className="label">Double-charge protection</div>
              <div className="value">Idempotent</div>
            </div>
            <div className="status-item">
              <div className="label">Gmail label</div>
              <div className="value">Sinmail</div>
            </div>
          </div>
        </section>

        <section className="section" id="product">
          <div className="section-header">
            <p className="eyebrow">Built for inbox owners</p>
            <h2>Control who reaches you. Monetize the rest.</h2>
            <p className="lede">
              Sinmail turns cold outreach into a paid channel while trusted
              senders glide through.
            </p>
          </div>
          <div className="feature-grid">
            {featureCards.map(card => (
              <div className="card" key={card.title}>
                <div className="card-icon" aria-hidden>
                  {card.icon}
                </div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section flow" id="flow">
          <div className="section-header">
            <p className="eyebrow">How it works</p>
            <h2>From link to labeled Gmail in under a minute</h2>
          </div>
          <div className="steps">
            {steps.map((step, index) => (
              <div className="step" key={step.title}>
                <div className="step-number">{index + 1}</div>
                <div className="step-body">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="features">
          <div className="section-header">
            <p className="eyebrow">Reliability</p>
            <h2>Stay fast, safe, and idempotent</h2>
          </div>
          <div className="pillars">
            {pillars.map(pillar => (
              <div className="pillar" key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta" id="cta">
          <div className="cta-card">
            <div className="eyebrow">Ready to filter the noise?</div>
            <h2>Turn cold outreach into signal and revenue.</h2>
            <p>
              Start with Gmail, set your price, and ship the link. We handle
              payments, retries, and receipts.
            </p>
            <div className="cta-actions">
              <a className="button primary" href="#">
                Get started
              </a>
              <a className="button ghost" href="#product">
                See product
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="logo">
          <div className="mark">S</div>
          <div className="wordmark">Sinmail</div>
        </div>
        <div className="footer-links">
          <a href="#product">Product</a>
          <a href="#features">Reliability</a>
          <a href="#cta">Get started</a>
        </div>
        <div className="footnote">
          Built for inbox owners who value their time.
        </div>
      </footer>
    </div>
  )
}
