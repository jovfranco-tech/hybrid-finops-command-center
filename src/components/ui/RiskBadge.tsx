

export const RiskBadge = ({ level }: { level: 'Low' | 'Medium' | 'High' }) => {
  const styles = {
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[level]}`}>
      {level} Risk
    </span>
  );
};
