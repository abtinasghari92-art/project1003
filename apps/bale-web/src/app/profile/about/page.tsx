import { AboutMajara } from '@majara/ui';
import { AppShell } from '@/components/shell';

export default function ProfileAboutPage() {
  return (
    <AppShell>
      <div className="pb-3">
        <h1 className="mb-5 text-[1.45rem] font-bold">دربارهٔ ما</h1>
        <AboutMajara />
      </div>
    </AppShell>
  );
}
