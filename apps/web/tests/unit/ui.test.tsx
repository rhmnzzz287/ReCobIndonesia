import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

describe("Button", () => {
  it("memakai gaya utama secara bawaan", () => {
    render(<Button>Kirim</Button>);
    const button = screen.getByRole("button", { name: "Kirim" });
    expect(button.className).toContain("bg-primary");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("varian accent memakai bidang accent dengan teks ink", () => {
    render(<Button variant="accent">Klaim Sampel Gratis</Button>);
    const button = screen.getByRole("button", { name: "Klaim Sampel Gratis" });
    expect(button.className).toContain("bg-accent");
    expect(button.className).toContain("text-ink");
  });
});

describe("ButtonLink", () => {
  it("menambahkan target dan rel aman untuk tautan luar", () => {
    render(
      <ButtonLink external href="https://wa.me/6281200000000">
        WhatsApp
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "WhatsApp" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });
});

describe("Badge dan Alert", () => {
  it("badge partner memuat ikon handshake", () => {
    const { container } = render(<Badge tone="partner">Mitra KUD</Badge>);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("alert peringatan memuat ikon triangle-alert dan teksnya", () => {
    const { container } = render(<Alert>Ilustrasi berbasis asumsi</Alert>);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.textContent).toContain("Ilustrasi berbasis asumsi");
  });
});

describe("Section", () => {
  it("menerapkan permukaan sesuai tone dan meneruskan id", () => {
    const { container } = render(
      <Section id="dampak" tone="ink">
        <p>Metrik</p>
      </Section>,
    );
    const section = container.querySelector("section");
    expect(section?.className).toContain("bg-ink-deep");
    expect(section?.getAttribute("id")).toBe("dampak");
  });

  it("tone primary memakai bidang hijau dengan teks permukaan", () => {
    const { container } = render(
      <Section id="form-sampel" tone="primary">
        <p>Ajakan</p>
      </Section>,
    );
    const section = container.querySelector("section");
    expect(section?.className).toContain("bg-primary");
    expect(section?.className).toContain("text-surface");
  });
});
