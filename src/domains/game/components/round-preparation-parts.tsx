"use client";

import { motion } from "motion/react";
import { memo } from "react";

const OVERLINE = "text-[11px] font-semibold tracking-[0.08em] uppercase text-muted-foreground/60";

export const RoundHeader = memo(function RoundHeader({
  roundNumber,
  label,
}: {
  roundNumber: number;
  label: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-1"
    >
      <span className={OVERLINE}>{label}</span>
      <span className="text-7xl font-bold text-slate-950">{roundNumber}</span>
    </motion.div>
  );
});

export const FirstQuestioner = memo(function FirstQuestioner({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col items-center gap-3"
    >
      <span className={OVERLINE}>{label}</span>
      <div className="bg-spy-ink/12 text-spy-ink flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
        {name.charAt(0).toUpperCase()}
      </div>
      <span className="text-2xl font-bold">{name}</span>
    </motion.div>
  );
});

export const RulesCard = memo(function RulesCard({
  title,
  rules,
}: {
  title: string;
  rules: string[];
}) {
  return (
    <div className="w-full rounded-2xl border border-white/80 bg-white/82 p-5 shadow-[0_18px_40px_rgba(148,163,184,0.12)] backdrop-blur-xl">
      <span className={`${OVERLINE} mb-3 block`}>{title}</span>
      <div className="flex flex-col gap-3">
        {rules.map((rule, i) => (
          <motion.div
            key={rule}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
            className="flex items-start gap-3"
          >
            <div className="text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
              {i + 1}
            </div>
            <span className="text-muted-foreground text-sm">{rule}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
