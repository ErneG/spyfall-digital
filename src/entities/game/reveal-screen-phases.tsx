"use client";

import { AlertTriangle, MapPin, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { memo } from "react";

import { useTranslation } from "@/shared/i18n/context";

export const RevealGameOver = memo(function RevealGameOver() {
  const { t } = useTranslation();

  return (
    <motion.div
      className="space-y-3"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="bg-spy-gold/12 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
        <Trophy className="text-spy-gold h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold text-slate-950">{t.game.gameOver}</h1>
    </motion.div>
  );
});

export const RevealLocation = memo(function RevealLocation({ location }: { location: string }) {
  const { t, translateLocation } = useTranslation();

  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <p className="text-muted-foreground/60 flex items-center justify-center gap-1 text-[11px] tracking-[0.08em] uppercase">
        <MapPin className="h-3 w-3" /> {t.game.locationWas}
      </p>
      <p className="text-2xl font-bold text-slate-950">{translateLocation(location)}</p>
    </motion.div>
  );
});

export const RevealSpyNames = memo(function RevealSpyNames({ spyNames }: { spyNames: string[] }) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.5 }}
    >
      <p className="text-muted-foreground/60 flex items-center justify-center gap-1 text-[11px] tracking-[0.08em] uppercase">
        <AlertTriangle className="h-3 w-3" />
        {spyNames.length === 1 ? t.game.spyWas : t.game.spiesWere}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {spyNames.map((name) => (
          <motion.span
            key={name}
            className="bg-spy-red/12 text-spy-red rounded-full px-4 py-1.5 text-base font-semibold"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: [0, -3, 3, -2, 2, 0] }}
            transition={{
              opacity: { delay: 1.6, duration: 0.3 },
              x: { delay: 2.0, duration: 0.4, ease: "easeInOut" },
            }}
          >
            {name}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
});

export const RevealRoleInfo = memo(function RevealRoleInfo({
  didSpy,
  myRole,
}: {
  didSpy: boolean;
  myRole: string;
}) {
  const { t, translateRole } = useTranslation();

  return (
    <motion.p
      className="text-muted-foreground text-[13px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 0.5 }}
    >
      {didSpy ? t.game.youWereSpy : t.game.yourRoleWas}{" "}
      <span className="font-semibold text-slate-950">{translateRole(myRole)}</span>
    </motion.p>
  );
});
