import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ExternalLink, Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";

interface StatData {
  id: string;
  number: string;
  ariaLabel: string;
  descriptor: string;
  source: string;
}

const STATS: StatData[] = [
  {
    id: "aishe-grads",
    number: "10.7M",
    ariaLabel: "Ten point seven million non-technical graduates per year",
    descriptor: "non-tech grads / yr (AISHE)",
    source: "AISHE",
  },
  {
    id: "rural-tier",
    number: "62%",
    ariaLabel: "Sixty-two percent from rural and Tier 4 or 5 regions",
    descriptor: "rural / Tier-4/5 (PLFS proxy)",
    source: "PLFS",
  },
  {
    id: "employability",
    number: "54%",
    ariaLabel: "Fifty-four percent estimated employability based on skills testing",
    descriptor: "estimated employability (skills-tested baseline)",
    source: "Skills Report",
  },
];

const METHODOLOGY_CONTENT = {
  title: "What these numbers mean",
  blocks: [
    {
      statId: "aishe-grads",
      heading: "10.7M non-tech grads / yr (AISHE)",
      explainer:
        "Scale estimate derived from AISHE higher-education outputs; non-technical streams approximated for annual graduating cohorts. This is directional and periodically updated.",
      linkText: "View AISHE reports",
      linkUrl: "https://aishe.gov.in/",
    },
    {
      statId: "rural-tier",
      heading: "62% rural / Tier-4/5 (PLFS proxy)",
      explainer:
        "Rural share approximates talent distribution using PLFS rural/urban composition as a proxy for entry-level candidate origins.",
      linkText: "View PLFS overview",
      linkUrl: "https://mospi.gov.in/",
    },
    {
      statId: "employability",
      heading: "54% estimated employability (skills-tested baseline)",
      explainer:
        "Baseline employability is referenced from skills-tested national reports; varies by cohort and year; used here to frame training impact.",
      linkText: "View employability benchmarks",
      linkUrl: "https://indiaeducationforum.org/",
    },
  ],
  footnote:
    "Figures are estimates for employer planning. Sources updated annually. Methodology available on request.",
};

export const EmployerStatStrip = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatId, setSelectedStatId] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);

  // Track stat_strip_view when visible
  useEffect(() => {
    if (!stripRef.current || hasTrackedView.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView.current) {
            hasTrackedView.current = true;
            trackEvent({
              page: "employers",
              eventType: "pageview",
              metadata: { action: "stat_strip_view" },
            }).catch(() => {});
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(stripRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCardClick = (statId: string) => {
    setSelectedStatId(statId);
    setIsModalOpen(true);
    trackEvent({
      page: "employers",
      eventType: "pageview",
      metadata: { action: "stat_modal_open", stat_id: statId },
    }).catch(() => {});
  };

  const handleDownload = () => {
    trackEvent({
      page: "employers",
      eventType: "pageview",
      metadata: { action: "onepager_download" },
    }).catch(() => {});
    
    // Trigger PDF download
    const link = document.createElement("a");
    link.href = "/employer-onepager.pdf";
    link.download = "UdaYantu-Employer-Stats-OnePager.pdf";
    link.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent, statId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(statId);
    }
  };

  return (
    <>
      {/* Stat Strip */}
      <div
        ref={stripRef}
        className="w-full py-6 md:py-8"
        data-testid="employer-stat-strip"
      >
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {STATS.map((stat) => (
                <Card
                  key={stat.id}
                  onClick={() => handleCardClick(stat.id)}
                  onKeyDown={(e) => handleKeyDown(e, stat.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${stat.ariaLabel}. Click for methodology details.`}
                  className="flex-1 p-4 md:p-5 bg-card/80 backdrop-blur-sm border border-primary/20 shadow-sm hover:shadow-md hover:border-primary/40 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
                  data-testid={`stat-card-${stat.id}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span
                          aria-label={stat.ariaLabel}
                          className="text-2xl md:text-3xl font-semibold text-primary"
                        >
                          {stat.number}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-tight">
                        {stat.descriptor}
                      </p>
                    </div>
                    <ChevronRight
                      className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors flex-shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Methodology Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-[580px] md:max-w-[640px] max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="methodology-title"
        >
          <DialogHeader>
            <DialogTitle id="methodology-title" className="text-xl md:text-2xl font-bold text-foreground">
              {METHODOLOGY_CONTENT.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Methodology and sources for the employer statistics
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {METHODOLOGY_CONTENT.blocks.map((block, index) => (
              <div
                key={block.statId}
                className={`pb-5 ${
                  index < METHODOLOGY_CONTENT.blocks.length - 1
                    ? "border-b border-border"
                    : ""
                } ${selectedStatId === block.statId ? "bg-primary/5 -mx-4 px-4 py-3 rounded-lg" : ""}`}
              >
                <h3 className="font-semibold text-foreground mb-2 text-base">
                  {block.heading}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {block.explainer}
                </p>
                <a
                  href={block.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  {block.linkText}
                </a>
              </div>
            ))}

            {/* Footnote */}
            <p className="text-xs text-muted-foreground/80 italic border-t border-border pt-4">
              {METHODOLOGY_CONTENT.footnote}
            </p>

            {/* Download CTA */}
            <Button
              onClick={handleDownload}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
              size="lg"
              data-testid="button-download-onepager"
            >
              <Download className="w-5 h-5" aria-hidden="true" />
              Download one-pager (PDF)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Reusable hero subhead line
export const StatSubheadLine = () => (
  <p
    className="text-base md:text-lg text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed font-light"
    data-testid="stat-subhead-line"
  >
    Access India's{" "}
    <span aria-label="Ten point seven million per year">10.7M/Year</span> non-tech graduate
    pool | <span aria-label="Sixty-two percent">62%</span> from rural and
    Tier-4/5 regions
  </p>
);

// Reusable "Why Partner" intro sentence
export const WhyPartnerIntroLine = () => (
  <p className="text-muted-foreground max-w-4xl mx-auto font-light mb-4">
    We convert a baseline ~<span aria-label="Fifty-four percent">54%</span>{" "}
    employability into job-ready talent through role-based training and
    assessments.
  </p>
);
