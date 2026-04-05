"use client";

import { Play } from "lucide-react";
import { motion } from "motion/react";
import { memo, useCallback, useMemo } from "react";

import { useTranslation } from "@/shared/i18n/context";
import { Button } from "@/shared/ui/button";

import { FirstQuestioner, RoundHeader, RulesCard } from "./round-preparation-parts";

export const RoundPreparation = memo(function RoundPreparation({
  roundNumber,
  players,
  onStartRound,
}: {
  roundNumber: number;
  players: Array<{ id: string; name: string }>;
  onStartRound: () => void;
}) {
  const { t } = useTranslation();
  const firstPlayer = useMemo(() => players[roundNumber % players.length], [roundNumber, players]);
  const rules = useMemo(() => [t.preparation.rule1, t.preparation.rule2, t.preparation.rule3], [t]);
  const handleStart = useCallback(() => onStartRound(), [onStartRound]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 px-4 py-10">
      <RoundHeader roundNumber={roundNumber} label={t.preparation.roundN} />
      <FirstQuestioner name={firstPlayer?.name ?? ""} label={t.preparation.firstToAsk} />
      <RulesCard title={t.preparation.roundRules} rules={rules} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full"
      >
        <Button
          onClick={handleStart}
          className="h-14 w-full rounded-2xl bg-white text-lg font-semibold text-black hover:bg-white/90"
        >
          <Play className="mr-2 h-5 w-5" /> {t.preparation.startRound}
        </Button>
      </motion.div>
    </div>
  );
});
