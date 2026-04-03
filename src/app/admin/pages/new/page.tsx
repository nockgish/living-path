import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPage } from "../actions";

export const metadata = { title: "Admin · New Page" };

export default function NewPagePage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] mb-2">
          Page Builder
        </p>
        <h1 className="font-serif text-4xl text-[var(--color-pearl)]">
          New page
        </h1>
      </header>

      <form action={createPage} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" placeholder="auto-generated from title" />
          <p className="text-xs text-[var(--color-mist)]">
            Page URL will be /p/[slug]
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (SEO)</Label>
          <Textarea id="description" name="description" rows={3} />
        </div>
        <Button type="submit">Create page</Button>
      </form>
    </div>
  );
}
