import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { copy } from "@/content/copy";

export async function Footer(): Promise<ReactNode> {
  return (
    <footer className="bg-ink-deep py-2xl text-surface">
      <Container>
        <p className="type-h3 text-surface">ReCob.id</p>
        <p className="mt-xs type-body-md text-surface/90">{copy.footer.tagline}</p>
        <p className="mt-sm type-caption uppercase text-accent">{copy.footer.badge}</p>

        <div className="mt-xl grid gap-xl md:grid-cols-3">
          <div>
            <h2 className="type-label-md uppercase text-surface">{copy.footer.productTitle}</h2>
            <ul className="mt-sm space-y-xs">
              {copy.footer.productLinks.map((link) => (
                <li className="type-body-sm text-surface/85" key={link}>
                  {link}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="type-label-md uppercase text-surface">{copy.footer.companyTitle}</h2>
            <ul className="mt-sm space-y-xs">
              {copy.footer.regions.map((region) => (
                <li className="type-body-sm text-surface/85" key={region.name}>
                  <span className="text-surface">{region.name}</span> — {region.location}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="type-label-md uppercase text-surface">{copy.footer.contactTitle}</h2>
            <ul className="mt-sm space-y-xs">
              {copy.footer.compliance.map((item) => (
                <li className="type-body-sm text-surface/85" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-xl border-t border-surface/20 pt-lg">
          <h2 className="type-label-md uppercase text-surface">{copy.footer.legalTitle}</h2>
          <ul className="mt-sm flex flex-wrap gap-md">
            {copy.footer.legalLinks.map((link) => (
              <li className="type-body-sm text-surface/85" key={link}>
                {link}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-xl type-body-sm text-surface/85">{copy.footer.address}</p>
        <p className="mt-xs type-body-sm text-surface/85">{copy.footer.nppStatus}</p>
        <p className="mt-md type-caption text-surface/70">{copy.footer.contactNotice}</p>
        <p className="mt-xs type-caption text-surface/70">{copy.footer.copyright}</p>
      </Container>
    </footer>
  );
}
