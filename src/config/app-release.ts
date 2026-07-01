export type ReleaseNote = {
  version: string;
  releasedOn: string;
  summary: string;
  changes: string[];
};

export const appRelease = {
  name: "PayEngine",
  version: "1.2.5",
  releasedOn: "2026-07-01",
  releaseNotes: [
    {
      version: "1.2.5",
      releasedOn: "2026-07-01",
      summary: "Mobile reset-password reliability update.",
      changes: [
        "Explicitly exchanges recovery codes on the reset-password page so email links work more reliably on phones.",
        "Disabled native form validation on the reset-password form so browser behavior does not hide update errors.",
      ],
    },
    {
      version: "1.2.4",
      releasedOn: "2026-07-01",
      summary: "Auth security hardening update.",
      changes: [
        "Added a simple cooldown to login, signup, and forgot-password actions to reduce spam and abuse.",
        "Kept forgot-password responses generic to avoid leaking account details.",
      ],
    },
    {
      version: "1.2.3",
      releasedOn: "2026-07-01",
      summary: "Password recovery and change-password release.",
      changes: [
        "Added forgot-password flow from the login screen with recovery email link.",
        "Added reset-password page for recovery-link password changes.",
        "Added signed-in password change card in My Settings with current-password verification.",
      ],
    },
    {
      version: "1.2.2",
      releasedOn: "2026-07-01",
      summary: "Export formatting and sidebar polish update.",
      changes: [
        "Fixed PDF export currency display to use a safe PHP text format.",
        "Added Excel borders, section styling, and auto-fit column widths for payroll exports.",
        "Removed collapsed sidebar letter fallback so minimized navigation is icon-only.",
        "Constrained collapsed email/profile content to prevent overflow outside the sidebar card.",
      ],
    },
    {
      version: "1.2.1",
      releasedOn: "2026-07-01",
      summary: "Product transparency and shell polish update.",
      changes: [
        "Added About This App page with current version and structured release notes.",
        "Added About This App navigation entry and sidebar version badge.",
        "Updated sidebar brand subtitle to user-friendly wording.",
        "Added smooth sidebar collapse transitions and animated toggle icon state change.",
      ],
    },
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
