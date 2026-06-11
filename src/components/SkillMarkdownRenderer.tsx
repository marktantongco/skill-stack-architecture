'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSkillStore } from '@/lib/skill-store';
import { skills } from '@/lib/skill-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Check, FileText, AlertTriangle, RotateCcw } from 'lucide-react';

interface SkillMarkdownRendererProps {
  skillId: string;
  skillDir: string;
}

export function SkillMarkdownRenderer({ skillId, skillDir }: SkillMarkdownRendererProps) {
  const [content, setContent] = useState<string | null>(null);
  const [length, setLength] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const { addToClipboard } = useSkillStore();
  const abortRef = useRef<AbortController | null>(null);

  const skill = useMemo(() => skills.find(s => s.id === skillId), [skillId]);

  useEffect(() => {
    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetch(`/api/skill-content?skill=${encodeURIComponent(skillDir)}`, {
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then(data => {
        setContent(data?.content || null);
        setLength(data?.length || 0);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return; // cancelled, not an error
        setError(err.message || 'Failed to load SKILL.md');
        setContent(null);
        setLength(0);
        setLoading(false);
      });

    return () => { controller.abort(); };
  }, [skillDir, retryCount]); // retryCount triggers refetch

  const handleCopyFull = useCallback(async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 1500);
  }, [content]);

  const handleCopyCommand = useCallback(async () => {
    if (!skill) return;
    await navigator.clipboard.writeText(skill.installCommand);
    addToClipboard({ id: skill.id, command: skill.installCommand, skillName: skill.name });
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 1500);
  }, [skill, addToClipboard]);

  if (loading) {
    return (
      <div className="space-y-3 p-4" aria-busy="true" aria-label="Loading skill content">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-3" role="alert">
        <AlertTriangle className="h-8 w-8 mx-auto text-amber-500" />
        <p className="text-sm text-foreground font-medium">Failed to load SKILL.md</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setRetryCount(c => c + 1)}
        >
          <RotateCcw className="h-3 w-3" />
          Retry
        </Button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-8">
        <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No SKILL.md available for this skill.</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          The raw content hasn't been published yet. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {length > 0 && <Badge variant="secondary" className="text-[10px] h-5">{length} bytes</Badge>}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={copiedCommand ? 'default' : 'outline'}
            className="h-7 text-xs gap-1"
            onClick={handleCopyCommand}
          >
            {copiedCommand ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copiedCommand ? 'Copied!' : 'Copy Command'}
          </Button>
          <Button
            size="sm"
            variant={copiedFull ? 'default' : 'outline'}
            className="h-7 text-xs gap-1"
            onClick={handleCopyFull}
          >
            {copiedFull ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copiedFull ? 'Copied!' : 'Copy Full'}
          </Button>
        </div>
      </div>

      {/* Rendered Markdown */}
      <div className="prose prose-sm dark:prose-invert max-w-none
        prose-headings:font-serif prose-headings:text-foreground
        prose-h1:text-lg prose-h1:border-b prose-h1:border-border prose-h1:pb-2
        prose-h2:text-base prose-h2:mt-6
        prose-h3:text-sm prose-h3:mt-4
        prose-p:text-muted-foreground prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
        prose-pre:bg-muted/70 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-lg
        prose-li:text-muted-foreground
        prose-strong:text-foreground
        prose-table:text-xs
        prose-th:bg-muted/50 prose-th:p-2 prose-th:text-left prose-th:font-semibold
        prose-td:p-2 prose-td:border-t prose-td:border-border/30
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
