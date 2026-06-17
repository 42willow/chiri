import { openUrl } from '@tauri-apps/plugin-opener';
import ExternalLink from 'lucide-react/icons/external-link';
import { marked } from 'marked';
import { useEffect, useMemo, useRef } from 'react';
import { ModalButton } from '$components/ModalButton';
import { ModalWrapper } from '$components/ModalWrapper';
import { cleanChangelog } from '$utils/github';

interface ChangelogModalProps {
  version: string;
  changelog: string;
  onClose: () => void;
}

const handleLinkClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const anchor = target.closest('a');
  if (anchor?.href) {
    e.preventDefault();
    openUrl(anchor.href);
  }
};

export const ChangelogModal = ({ version, changelog, onClose }: ChangelogModalProps) => {
  const cleanedChangelog = cleanChangelog(changelog);
  const hasContent = cleanedChangelog.trim().length > 0;

  const renderedHtml = useMemo(() => {
    if (!hasContent) return '';
    return marked.parse(cleanedChangelog);
  }, [cleanedChangelog, hasContent]);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    el.addEventListener('click', handleLinkClick);
    return () => el.removeEventListener('click', handleLinkClick);
  }, []);

  return (
    <ModalWrapper
      onClose={onClose}
      title={`What's new in ${version}`}
      zIndex="z-60"
      className="max-h-[80vh] max-w-2xl"
      footerLeft={
        <ModalButton
          variant="ghost"
          onClick={() => {
            openUrl(`https://github.com/chiriapp/chiri/releases/tag/app-v${version}`);
          }}
        >
          <ExternalLink className="h-4 w-4" />
          View on GitHub
        </ModalButton>
      }
      footer={<ModalButton onClick={onClose}>Close</ModalButton>}
    >
      {hasContent ? (
        <div
          ref={contentRef}
          className="prose prose-sm dark:prose-invert max-w-none [&_a]:text-primary-600 hover:[&_a]:underline dark:[&_a]:text-primary-400 [&_code]:rounded-sm [&_code]:bg-surface-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs dark:[&_code]:bg-surface-800 [&_h2:first-child]:mt-0 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:font-semibold [&_h2]:text-base [&_h2]:text-surface-800 dark:[&_h2]:text-surface-200 [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:text-surface-700 dark:[&_h3]:text-surface-300 [&_p]:my-2 [&_p]:text-sm [&_p]:text-surface-700 dark:[&_p]:text-surface-300 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:ml-6 [&_ul]:list-outside [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:text-surface-700 dark:[&_ul]:text-surface-300"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown is rendered from trusted changelog content
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      ) : (
        <p className="py-8 text-center text-sm text-surface-500 italic dark:text-surface-400">
          No changelog available for this release.
        </p>
      )}
    </ModalWrapper>
  );
};
