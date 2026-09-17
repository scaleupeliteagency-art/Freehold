import LedgerHomepage from "@/components/home2D/LedgerHomepage";

export const metadata = {
  title: 'Working Ledger — Build a System for Your Long-Term Goals',
  description: 'Turn a major long-term goal into a structured operating system with daily execution, reviews, evolving inputs, results, and five years of accumulated learning.',
}

export default function LandingPage() {
  return (
    <main className="w-full bg-white text-gray-900 overflow-x-hidden">
      <LedgerHomepage />
    </main>
  );
}
