export type ReleaseNote = {
  version: string;
  releasedOn: string;
  summary: string;
  changes: string[];
};

export const appRelease = {
  name: "PayEngine",
  version: "1.2.0",
  releasedOn: "2026-07-01",
  releaseNotes: [
    {
      version: "1.2.0",
      releasedOn: "2026-07-01",
      summary: "Production launch hardening and trust-focused UX updates.",
      changes: [
        "Added source links and updated-as-of messaging for tax and government deductions.",
        "Added 2026 seeded contribution tables and automatic defaults for SSS, PhilHealth, and Pag-IBIG.",
        "Introduced optional manual holiday bonus override controls.",
        "Added government rule year selection in My Settings.",
        "Refined app shell visuals with icon navigation and clearer My History staging state.",
      ],
    },
    {
      version: "1.1.0",
      releasedOn: "2026-06-30",
      summary: "Personal payroll calculator scope finalized.",
      changes: [
        "Removed admin-role behavior and management workflows from active app UX.",
        "Enabled automatic tax explainability with bracket-level breakdown.",
        "Added multi-holiday input handling and frequency-aware computation.",
        "Added PDF and Excel exports from payroll preview.",
      ],
    },
    {
      version: "1.0.0",
      releasedOn: "2026-06-29",
      summary: "Initial personal payroll calculator release.",
      changes: [
        "Shipped signup, login, and protected personal workspace.",
        "Added personal settings and payroll preview flow.",
      ],
    },
  ] as ReleaseNote[],
} as const;
