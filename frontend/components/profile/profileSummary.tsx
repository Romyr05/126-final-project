import StatBox from "@/components/profile/statBox";
import type { ProfileSummary } from "@/lib/types/profile";


export default function ProfileSummary({ user, stats }: ProfileSummary) {
  return (
    <section className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-8">
        <div className="h-28 w-28 shrink-0 rounded-md border-2 border-[var(--vault-border-strong)] bg-[var(--vault-surface)]" />

        <div>
          <h1 className="text-3xl font-bold tracking-normal text-[var(--vault-text)]">
            {user.username}
          </h1>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-3 md:w-auto">
        <StatBox label="Logged" value={stats.logged} />
        <StatBox label="Avg Rating" value={`${stats.avg_rating}`} showStar />
        <StatBox label="Completed" value={stats.completed} />
      </div>
    </section>
  );
}
