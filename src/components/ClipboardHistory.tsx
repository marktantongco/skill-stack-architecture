'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clipboard, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSkillStore } from '@/lib/skill-store';
import { copyToClipboard } from '@/lib/clipboard';
import { springs } from '@/lib/animation-variants';

export function ClipboardHistory() {
  const { clipboardHistory, removeFromClipboard, clearClipboard, addToClipboard } =
    useSkillStore();

  const handleReCopy = async (command: string, id: string, skillName: string) => {
    const ok = await copyToClipboard(command);
    if (ok) {
      addToClipboard({ id, command, skillName });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clipboard className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">
            Clipboard History
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            ({clipboardHistory.length})
          </span>
        </div>
        {clipboardHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearClipboard}
            className="h-7 text-[10px] text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {clipboardHistory.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-4 text-center">
          No copied commands yet. Click &quot;Copy&quot; on a skill card.
        </p>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-64 space-y-1.5 pr-1 custom-scrollbar">
          <AnimatePresence initial={false}>
            {clipboardHistory.map((item) => (
              <motion.div
                key={item.id + item.copiedAt}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.97 }}
                transition={springs.snappy}
                className="group flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border transition-colors"
              >
                <button
                  onClick={() =>
                    handleReCopy(item.command, item.id, item.skillName)
                  }
                  className="flex-1 text-left min-h-[44px] flex flex-col justify-center cursor-pointer"
                  aria-label={`Re-copy ${item.skillName} command`}
                >
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {item.skillName}
                  </span>
                  <code className="text-[9px] font-mono text-foreground/70 break-all line-clamp-2">
                    {item.command}
                  </code>
                </button>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() =>
                      handleReCopy(item.command, item.id, item.skillName)
                    }
                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Re-copy command"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeFromClipboard(item.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    aria-label="Remove from clipboard"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
