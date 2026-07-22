import { requireUser } from "@/lib/session";
import { HouseForm } from "@/components/house-form";
import { Card } from "@/components/ui";

export default async function NewHousePage() {
  await requireUser();

  return (
    <div className="page-shell flex justify-center">
      <Card className="w-full max-w-lg p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create a house page
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Your home, a project, or a dream space — no street address needed.
        </p>
        <div className="mt-6">
          <HouseForm />
        </div>
      </Card>
    </div>
  );
}
