"use client";
import "./landing.css";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Plus,
  Package,
  Languages,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers";
import { CategoryBrowser } from "./category-browser";
import { LandingSpotlight, LandingCollection } from "./landing-products";
import { landingCopy } from "@/lib/landing-copy";
export function Home() {
  const { t, locale } = useTranslation();
  const copy = landingCopy[locale];
  return (
    <div className="landing-page">
      <section className="landing-hero shell">
        <div className="landing-hero-copy">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("hero")}</h1>
          <p className="landing-intro">{t("intro")}</p>
          <div className="landing-actions">
            <Button size="lg" asChild>
              <Link href="/products">
                {t("explore")}
                <ArrowRight />
              </Link>
            </Button>
            <Link href="#the-journey" className="text-link">
              {t("how")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <p className="landing-shop-note">
            <Check size={15} />
            {copy.shopNote}
          </p>
        </div>
        <LandingSpotlight />
      </section>
      <div className="landing-connection shell">
        <span>
          <i className="country-mark china-mark" aria-hidden="true" />
          {copy.china}
          <small lang="zh">中国</small>
        </span>
        <span className="connection-thread" aria-hidden="true" />
        <p>{copy.connection}</p>
        <span className="connection-thread" aria-hidden="true" />
        <span>
          <i className="country-mark ethiopia-mark" aria-hidden="true" />
          {copy.ethiopia}
          <small lang="am">ኢትዮጵያ</small>
        </span>
      </div>
      <section className="landing-section shell">
        <div className="landing-heading">
          <div>
            <p className="eyebrow">{t("selected")}</p>
            <h2>{t("curated")}</h2>
          </div>
          <Link className="text-link" href="/products">
            {t("viewAll")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <LandingCollection />
      </section>
      <section
        className="landing-assurance shell"
        aria-labelledby="why-ethiosource"
      >
        <div className="assurance-heading">
          <p className="eyebrow">{copy.whyLabel}</p>
          <h2 id="why-ethiosource">{copy.whyTitle}</h2>
          <p>{copy.whyIntro}</p>
        </div>
        <div className="assurance-grid">
          <article>
            <CreditCard
              className="assurance-icon"
              aria-hidden="true"
              strokeWidth={1.5}
            />
            <h3>{copy.paymentTitle}</h3>
            <p>{copy.paymentBody}</p>
          </article>
          <article>
            <Package
              className="assurance-icon"
              aria-hidden="true"
              strokeWidth={1.5}
            />
            <h3>{copy.trackingTitle}</h3>
            <p>{copy.trackingBody}</p>
          </article>
          <article>
            <Languages
              className="assurance-icon"
              aria-hidden="true"
              strokeWidth={1.5}
            />
            <h3>{copy.languageTitle}</h3>
            <p>{copy.languageBody}</p>
          </article>
        </div>
        <Link href="/how-it-works" className="assurance-link">
          {t("how")}
          <ArrowUpRight size={17} />
        </Link>
      </section>
      <section className="landing-section shell">
        <div className="landing-heading">
          <div>
            <p className="eyebrow">{copy.departmentsLabel}</p>
            <h2>{copy.departmentsTitle}</h2>
          </div>
        </div>
        <CategoryBrowser />
      </section>
      <section className="landing-process shell" id="the-journey">
        <div className="process-intro">
          <p className="eyebrow">{copy.journeyLabel}</p>
          <h2>{copy.journeyTitle}</h2>
          <Link className="text-link" href="/how-it-works">
            {t("how")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <ol>
          {copy.steps.map((step, index) => (
            <li key={index}>
              <span className="step-number">0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="landing-faq shell">
        <div>
          <p className="eyebrow">{copy.faqLabel}</p>
          <h2>{copy.faqTitle}</h2>
        </div>
        <div>
          {copy.questions.map((question) => (
            <details key={question.title} name="landing-questions">
              <summary>
                {question.title}
                <Plus size={18} />
              </summary>
              <p>{question.body}</p>
            </details>
          ))}
          <Link className="text-link" href="/policies">
            {t("policyLink")}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <section className="landing-closing shell">
        <p className="eyebrow">{copy.closingLabel}</p>
        <h2>{copy.closingTitle}</h2>
        <p>{copy.closingBody}</p>
        <Button size="lg" asChild>
          <Link href="/products">
            {t("explore")}
            <ArrowRight />
          </Link>
        </Button>
      </section>
    </div>
  );
}
