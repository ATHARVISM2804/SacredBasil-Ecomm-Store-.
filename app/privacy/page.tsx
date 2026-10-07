import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Sacred Basil handles the information you share through this website.",
  alternates: { canonical: "/privacy" },
};

// CLIENT TO CONFIRM: review with counsel and add the data controller's details before launch.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>This page explains what information Sacred Basil collects through this website and how it is used.</p>
      <h2>What we collect</h2>
      <p>
        When you send an enquiry, we receive the details you enter in the form: your name, email address and, if you
        choose to share them, your phone number, company, gifting requirements and message.
      </p>
      <h2>How we use it</h2>
      <p>
        We use these details only to respond to your enquiry and to arrange any gifts you ask us about. We do not sell
        your information.
      </p>
      <h2>Your choices</h2>
      <p>You can ask us at any time to see, correct or delete the information you have sent us.</p>
    </LegalPage>
  );
}
