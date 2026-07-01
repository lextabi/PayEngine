import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appRelease } from "@/config/app-release";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-3">
        <Badge variant="outline" className="w-fit">About</Badge>
        <h2 className="text-3xl font-semibold tracking-tight">About This App</h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          This page is your product version reference. When new features are added, release notes are updated here so users can track exactly what changed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Version</CardTitle>
          <CardDescription>
            Active production release details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{appRelease.name}</Badge>
            <Badge variant="default">v{appRelease.version}</Badge>
            <Badge variant="outline">Released {appRelease.releasedOn}</Badge>
          </div>
          <p className="text-muted-foreground">
            Keep this up to date by editing release metadata in src/config/app-release.ts whenever you ship a new feature.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Release Notes</CardTitle>
          <CardDescription>
            Feature history and change tracking by version.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appRelease.releaseNotes.map((release) => (
              <article
                key={release.version}
                className="rounded-2xl border border-border/70 bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">v{release.version}</Badge>
                  <Badge variant="outline">{release.releasedOn}</Badge>
                </div>
                <p className="mt-3 text-sm font-medium">{release.summary}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {release.changes.map((change) => (
                    <li key={change} className="flex items-start gap-2">
                      <span className="mt-1 inline-block size-1.5 rounded-full bg-primary/70" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
