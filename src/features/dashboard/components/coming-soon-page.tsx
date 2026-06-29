import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ComingSoonPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function ComingSoonPage({
  eyebrow,
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="space-y-3">
        <Badge variant="outline" className="w-fit">{eyebrow}</Badge>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Module staged for next phase</CardTitle>
          <CardDescription>
            The route is active now so personal workflow navigation stays stable while this module is being built.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-5">
            <div className="bg-background flex size-11 items-center justify-center rounded-2xl border border-border/70">
              <Clock3 className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Planned in a later implementation phase</p>
              <p className="text-sm text-muted-foreground">Navigation and page routing are wired, but business workflows are intentionally deferred.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
