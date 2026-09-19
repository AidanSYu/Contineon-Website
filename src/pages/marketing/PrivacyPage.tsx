import { Link } from 'react-router-dom';
import { LegalDoc, LegalSection, ProjectStatusNotice, LegalContact } from '@/components/marketing/LegalDoc';
import { Seo } from '@/components/Seo';
import { legal, websiteProviders } from '@/config/legal';

export function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy Notice, Contineon" description="How the Contineon website handles inquiries, newsletter subscriptions, and account information." path="/privacy" />
      <LegalDoc kicker="LEGAL" title="Privacy Notice" lastUpdated={legal.effectiveDate}>
        <ProjectStatusNotice />
        <p>
          This notice describes personal information handled through this website by the people
          operating the Contineon project. It covers website visits, inquiries, launch updates,
          and invited website accounts. It does not describe a deployed Asilia lab environment;
          any pilot’s data flows and responsibilities must be agreed before lab data is connected.
        </p>
        <LegalSection n="1" heading="What we collect and why">
          <ul className="ml-5 list-disc space-y-3">
            <li><strong className="text-ink">Inquiries.</strong> Your name, email, optional organization,
              selected topic, and message help us respond to requests. Emailing us directly also shares
              your email address and message with our email service. Do not include sensitive or
              confidential research in an initial inquiry.</li>
            <li><strong className="text-ink">Launch updates.</strong> If newsletter signup is available
              and you choose to subscribe, we store your email, signup source, timestamps, and
              confirmation status. A confirmation link verifies your subscription before it is activated.
              Signing up for updates is separate from contacting us or requesting access.</li>
            <li><strong className="text-ink">Invited accounts.</strong> Account records include email,
              name, authentication and session information, access role, and any project records
              entered in the website dashboard. These support account access and requested functions.</li>
            <li><strong className="text-ink">Security and delivery.</strong> Hosting and security providers
              may process IP addresses, browser information, and request logs. Our contact database stores
              an IP hash for abuse prevention, rather than a raw IP address. This does not prevent hosting
              providers or bot protection services from processing a raw IP address.</li>
          </ul>
          <p>We do not sell personal information or use contact messages to train shared models.
            This website does not ask you to submit payment-card details through its contact forms.</p>
        </LegalSection>
        <LegalSection n="2" heading="Storage in your browser">
          <p>
            The website uses browser storage for preferences such as your color theme and, if you
            sign in, your authentication session. Bot protection may use additional browser signals
            and storage when enabled. We do not run advertising pixels or advertising cookies in
            this website’s application code.
          </p>
        </LegalSection>
        <LegalSection n="3" heading="Service providers and sharing">
          <p>The website uses these services where the corresponding functions are enabled:</p>
          <ul className="ml-5 list-disc space-y-2">
            {websiteProviders.map((provider) => (
              <li key={provider.name}><strong className="text-ink">{provider.name}</strong>: {provider.role}.</li>
            ))}
          </ul>
          <p>
            Information may also be disclosed when required by law or necessary to address fraud,
            security incidents, or legal claims. Providers may process information outside your
            country. Contact us about processing locations and arrangements before sharing data
            subject to residency or transfer restrictions.
          </p>
        </LegalSection>
        <LegalSection n="4" heading="Reasons for processing">
          <p>
            Where applicable data protection law requires a legal basis, we rely on consent for
            optional launch updates; our legitimate interests in answering inquiries and operating
            and protecting the website; steps you request before entering an agreement or performance
            of an agreement for relevant account services; and legal obligations where they apply.
            You can withdraw newsletter consent without affecting earlier processing.
          </p>
        </LegalSection>
        <LegalSection n="5" heading="How long information is kept">
          <p>
            Retention depends on the purpose: whether an inquiry is still active, whether an account
            is still needed, whether you remain subscribed, and whether records are needed to address
            abuse, a dispute, or a legal obligation. Contact us to request deletion or ask about a
            particular record. Backup and provider-log retention may differ from active records;
            deletion from every backup is not immediate.
          </p>
        </LegalSection>
        <LegalSection n="6" heading="Your choices and requests">
          <p>
            Email <a href={`mailto:${legal.contactEmail}`} className="text-safety hover:underline">{legal.contactEmail}</a>{' '}
            to request access, correction, a copy, or deletion of your information, or to unsubscribe
            from launch updates. For an unsubscribe request, use the subscribed address and put
            “Unsubscribe” in the subject. We may ask for information needed to verify a request.
          </p>
          <p>
            Depending on your location, you may also have rights to restrict or object to processing,
            portability, and to complain to your local data protection authority. We handle requests
            according to applicable law. Contacting us does not limit your right to complain to an authority.
          </p>
        </LegalSection>
        <LegalSection n="7" heading="Security and intended audience">
          <p>
            This website is intended for professional research inquiries, not for children. Please
            contact us if you believe a child has submitted personal information so we can address it.
            See our <Link to="/security" className="text-safety hover:underline">Security page</Link> for
            the website’s current controls and limitations. No online system is completely secure.
          </p>
        </LegalSection>
        <LegalSection n="8" heading="Updates and contact">
          <p>
            We will revise this notice when our practices or operator change and update the date
            above. A future incorporated entity will be identified here if it takes over operation.
          </p>
          <LegalContact />
        </LegalSection>
      </LegalDoc>
    </>
  );
}
