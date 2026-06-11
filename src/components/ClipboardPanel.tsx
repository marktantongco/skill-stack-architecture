'use client';

import { useMemo, useState } from 'react';
import { useSkillStore, ClipboardItem } from '@/lib/skill-store';
import { skills } from '@/lib/skill-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, X, Trash2, Check, ClipboardList, ClipboardCopy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type TimeGroup = 'Just now' | 'Recent' | 'Earlier' | 'Older';

function getTimeGroup(timestamp: number): TimeGroup {
  const diff = Date.now() - timestamp;
  const minutes = diff / 60000;
  if (minutes < 1) return 'Just now';
  if (minutes < 5) return 'Recent';
  if (minutes < 30) return 'Earlier';
  return 'Older';
}

const groupOrder: TimeGroup[] = ['Just now', 'Recent', 'Earlier', 'Older'];

function ClipboardItemRow({ item, onRecopy, onRemove, copied }: {
  item: ClipboardItem;
  onRecopy: () => void;
  onRemove: () => void;
  copied: boolean;
}) {
  const { setSelectedSkill } = useSkillStore();
  const skill = skills.find((s) => s.id === item.id);

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 group hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <button
          onClick={() => skill && setSelectedSkill(skill.id)}
          className="text-xs font-medium truncate block w-full text-left hover:text-primary transition-colors"
        >
          {skill ? `${skill.emoji} ` : ''}{item.skillName}
        </button>
        <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">{item.command}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
          {formatDistanceToNow(item.copiedAt, { addSuffix: true })}
        </p>
      </div>
      <Button
        size="sm"
        variant={copied ? 'default' : 'ghost'}
        className="h-7 w-7 p-0 shrink-0"
        onClick={onRecopy}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function ClipboardPanel() {
  const { clipboardHistory, clearClipboard, removeFromClipboard, addToClipboard } = useSkillStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const grouped = useMemo(() => {
    const groups: Record<TimeGroup, ClipboardItem[]> = {
      'Just now': [],
      'Recent': [],
      'Earlier': [],
      'Older': [],
    };
    clipboardHistory.forEach((item) => {
      const group = getTimeGroup(item.copiedAt);
      groups[group].push(item);
    });
    return groups;
  }, [clipboardHistory]);

  const handleRecopy = async (item: ClipboardItem) => {
    try {
      await navigator.clipboard.writeText(item.command);
    } catch {
      // Fallback for insecure contexts (HTTP, iframe restrictions)
      const textarea = document.createElement('textarea');
      textarea.value = item.command;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    addToClipboard({ id: item.id, command: item.command, skillName: item.skillName });
    setCopiedId(item.id + '-' + item.copiedAt);
    setTimeout(() => setCopiedId(null), 1000);
  };

  const handleCopyAll = async () => {
    const allCommands = clipboardHistory.map((item) => item.command).join('\n');
    try {
      await navigator.clipboard.writeText(allCommands);
    } catch {
      // Fallback for insecure contexts (HTTP, iframe restrictions)
      const textarea = document.createElement('textarea');
      textarea.value = allCommands;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <div className="border border-border/50 rounded-xl bg-background/60 backdrop-blur-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Clipboard History
          <Badge variant="secondary" className="text-xs h-5 px-1.5">
            {clipboardHistory.length}
          </Badge>
        </h3>
        <div className="flex gap-2">
          {clipboardHistory.length > 0 && (
            <>
              <Button
                size="sm"
                variant={copiedAll ? 'default' : 'outline'}
                className="h-7 text-xs gap-1"
                onClick={handleCopyAll}
              >
                {copiedAll ? <Check className="h-3 w-3" /> : <ClipboardCopy className="h-3 w-3" />}
                {copiedAll ? 'Copied!' : 'Copy All'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 text-destructive"
                onClick={clearClipboard}
              >
                <Trash2 className="h-3 w-3" /> Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {clipboardHistory.length === 0 ? (
        <div className="text-center py-6">
          <Copy className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No copied commands yet.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Click &quot;Copy&quot; on any skill card to add install commands here.
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-80">
          <div className="space-y-4 pr-2">
            {groupOrder.map((group) => {
              const items = grouped[group];
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                    {group}
                  </p>
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <ClipboardItemRow
                        key={item.id + '-' + item.copiedAt}
                        item={item}
                        onRecopy={() => handleRecopy(item)}
                        onRemove={() => removeFromClipboard(item.id)}
                        copied={copiedId === item.id + '-' + item.copiedAt}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
