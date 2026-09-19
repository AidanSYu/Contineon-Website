import { useSearchParams } from 'react-router-dom';

const MESSAGES: Record<string, string> = {
  confirmed: 'Subscription confirmed. You’ll receive occasional updates from Contineon.',
  already: 'Your subscription is already confirmed. Thank you for following along.',
  invalid: 'This confirmation link is invalid or no longer active. Please contact hello@contineon.com if you need help.',
  error: 'We couldn’t confirm your subscription. Try the email link again later or contact hello@contineon.com.',
};

export function NewsletterStatus() {
  const [params, setParams] = useSearchParams();
  const message = MESSAGES[params.get('subscribe') ?? ''];
  if (!message) return null;
  return (
    <div role="status" className="fixed inset-x-4 bottom-4 z-[110] mx-auto flex max-w-2xl items-center gap-4 rounded-xl border border-line bg-surface p-5 text-sm text-ink shadow-lab">
      <p className="flex-1">{message}</p>
      <button type="button" className="text-safety underline underline-offset-4" onClick={() => {
        const next = new URLSearchParams(params);
        next.delete('subscribe');
        setParams(next, { replace: true });
      }}>Dismiss</button>
    </div>
  );
}
