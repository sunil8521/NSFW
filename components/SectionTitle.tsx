export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-white font-display">
        {children}
      </h2>
      <div className="h-[2px] flex-1 bg-gradient-to-r from-accent/60 to-transparent rounded-full" />
    </div>
  );
}
