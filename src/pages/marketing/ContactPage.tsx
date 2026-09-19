import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Turnstile } from '@/components/Turnstile';
import { submitContact } from '@/lib/api';
import { contactSchema, type ContactInput } from '@/lib/validation';
import { Seo } from '@/components/Seo';
import { legal } from '@/config/legal';
import { isBackendConfigured } from '@/lib/backendConfig';

const turnstileEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

/** Tailors the page copy + a starter message to where the visitor came from. */
const TOPICS: Record<string, { eyebrow: string; heading: string; blurb: string; starter: string }> = {
  partner: {
    eyebrow: 'DESIGN PARTNER PROGRAM',
    heading: 'Apply for access.',
    blurb:
      'We’re speaking with chemistry, materials, and biology teams interested in shaping Asilia around their instruments and research workflows. Tell us about your lab and we’ll be in touch as soon as we can.',
    starter:
      'Our lab works on … and we run the following instruments / ELN: …\nWe’d like to join the design-partner program because …\nTeam size: …',
  },
  demo: {
    eyebrow: 'BOOK A DEMO',
    heading: 'See Asilia on your bench.',
    blurb: 'Tell us about your lab and what you run, and we’ll set up a walkthrough on instruments like yours.',
    starter: 'I’d like a demo of Asilia. Our lab works on … and we run the following instruments / ELN: …',
  },
  enterprise: {
    eyebrow: 'ENTERPRISE',
    heading: 'Let’s scope your deployment.',
    blurb: 'Multi-lab, governance, SSO, dedicated compute, tell us your requirements and we’ll scope a deployment.',
    starter: 'We’re interested in an enterprise deployment. We have … labs / sites and need …',
  },
  security: {
    eyebrow: 'SECURITY',
    heading: 'Security & compliance questions.',
    blurb: 'Ask for our security details, or share the controls and terms your evaluation needs.',
    starter: 'For our security review we need details on … (e.g. data residency, DPA, SSO, audit logs).',
  },
  careers: {
    eyebrow: 'CAREERS',
    heading: 'Come build it with us.',
    blurb:
      'We’re a small team of researchers and engineers. If you build foundational models, autonomous systems, or the instruments they run on, tell us what you’ve made and where you want to go next.',
    starter:
      'I’m interested in working on … at Contineon.\nHere’s what I’ve built / a link to my work: …',
  },
  general: {
    eyebrow: 'CONTACT',
    heading: 'Let’s talk.',
    blurb: 'Whether you’re evaluating Asilia for your team or need an enterprise deployment, tell us what you’re building and we’ll get back as soon as we can.',
    starter: '',
  },
};

export function ContactPage() {
  const [params] = useSearchParams();
  const requestedTopic = params.get('topic') ?? 'general';
  const topicKey = Object.hasOwn(TOPICS, requestedTopic) ? requestedTopic : 'general';
  const topic = TOPICS[topicKey] ?? TOPICS.general;
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [verificationAttempt, setVerificationAttempt] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', organization: '', message: '', company_website: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (turnstileEnabled && !turnstileToken) {
      toast.error('Please complete the verification challenge.');
      return;
    }

    setIsPending(true);
    try {
      await submitContact({ ...values, topic: topicKey, turnstileToken });
      toast.success('Message received. Thank you for getting in touch.');
      reset();
      setTurnstileToken('');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsPending(false);
      setTurnstileToken('');
      setVerificationAttempt((attempt) => attempt + 1);
    }
  });

  return (
    <div className="px-[5vw] pb-28 pt-32 lg:px-8 lg:pt-40">
      <Seo
        title="Contact, Contineon"
        description="Talk to the Contineon team about retrofitting your lab with Asilia. Book a demo or ask about an enterprise deployment."
        path="/contact"
      />
      <div className="mx-auto grid max-w-6xl border border-line bg-surface shadow-lab lg:grid-cols-2">
        {/* Left, copy + details */}
        <div className="border-b border-line p-8 sm:p-12 lg:border-b-0 lg:border-r">
          <p className="lab-label text-safety">{topic.eyebrow}</p>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-ink">
            {topic.heading}
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-muted">{topic.blurb}</p>

          <div className="mt-10 space-y-px border-t border-line">
            <div className="flex items-center gap-3 border-b border-line py-4 text-ink-muted">
              <Mail className="h-5 w-5 text-safety" strokeWidth={1.5} />
              <a href={`mailto:${legal.contactEmail}`} className="hover:text-ink">
                {legal.contactEmail}
              </a>
            </div>
            <p className="pt-4 text-sm text-ink-muted">Based in {legal.baseLocation}.</p>
            <p className="pb-4 pt-2 text-sm text-ink-muted">{legal.status}</p>
          </div>
        </div>

        {/* Right, form */}
        <div className="p-8 sm:p-12">
          {!isBackendConfigured ? (
            <div className="space-y-4 text-ink-muted">
              <h2 className="font-display text-xl font-semibold text-ink">Email the team</h2>
              <p>For inquiries and access requests, email us with a short description of what you have in mind.</p>
              <a href={`mailto:${legal.contactEmail}?subject=${encodeURIComponent(topic.eyebrow)}`} className="inline-block text-safety underline underline-offset-4">{legal.contactEmail}</a>
              <p className="text-sm">Please do not include confidential research or sensitive personal information.</p>
              <a href="/privacy" className="inline-block text-sm text-safety hover:underline">How we handle your information</a>
            </div>
          ) : <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div>
              <Label htmlFor="name" className="mb-2 block text-ink-muted">Name</Label>
              <Input id="name" autoComplete="name" {...register('name')} aria-invalid={Boolean(errors.name)} />
              {errors.name && <p className="mt-1.5 text-xs text-safety">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 block text-ink-muted">Email</Label>
              <Input id="email" autoComplete="email" type="email" {...register('email')} aria-invalid={Boolean(errors.email)} />
              {errors.email && <p className="mt-1.5 text-xs text-safety">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="organization" className="mb-2 block text-ink-muted">Organization (optional)</Label>
              <Input id="organization" autoComplete="organization" {...register('organization')} aria-invalid={Boolean(errors.organization)} />
              {errors.organization && <p className="mt-1.5 text-xs text-safety">{errors.organization.message}</p>}
            </div>
            <div>
              <Label htmlFor="message" className="mb-2 block text-ink-muted">Message</Label>
              <Textarea id="message" placeholder={topic.starter || "How can we help?"} {...register('message')} className="min-h-[120px]" aria-invalid={Boolean(errors.message)} />
              {errors.message && <p className="mt-1.5 text-xs text-safety">{errors.message.message}</p>}
            </div>

            {/* Honeypot */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="company_website">Company website</label>
              <input id="company_website" type="text" tabIndex={-1} autoComplete="off" {...register('company_website')} />
            </div>

            {turnstileEnabled && <Turnstile key={verificationAttempt} onToken={setTurnstileToken} className="pt-1" />}

            <p className="text-xs leading-relaxed text-ink-muted">
              We use these details to respond to your inquiry. Please do not send confidential research
              or sensitive personal information. Read our <a href="/privacy" className="text-safety hover:underline">Privacy Notice</a>.
            </p>
            <Button type="submit" disabled={isPending} className="w-full bg-safety text-white hover:bg-safety/90">
              {isPending ? 'Sending…' : 'Send message'}
            </Button>
          </form>}
        </div>
      </div>
    </div>
  );
}
