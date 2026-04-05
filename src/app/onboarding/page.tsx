import { redirect } from "next/navigation";
import { getOnboardingState } from "./actions";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const { role } = await getOnboardingState();

  if (role === "walker" || role === "both") redirect("/walker/dashboard");
  if (role === "owner") redirect("/owner/dashboard");

  return <OnboardingWizard />;
}
