import LedgerHomepage from "@/components/home2D/LedgerHomepage";

export const metadata = {
  title: 'The Working Ledger — Build the system. Then let reality improve it.',
  description: 'A personal operating system for turning goals into execution, results, learning, and better decisions.',
}

export default function LandingPage() {
  return (
    <main className="w-full bg-[#F6F3EC] text-[#1E2A24] overflow-x-hidden">
      <LedgerHomepage />
    </main>
  );
}
