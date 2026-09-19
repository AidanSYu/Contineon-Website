import { Link } from 'react-router-dom';
import { LegalDoc, LegalSection, ProjectStatusNotice, LegalContact } from '@/components/marketing/LegalDoc';
import { Seo } from '@/components/Seo';
import { legal } from '@/config/legal';

export function TermsPage() {
  return (
    <>
      <Seo title="Website Terms, Contineon" description="Terms for using the Contineon website and requesting early access." path="/terms" />
      <LegalDoc kicker="LEGAL" title="Website Terms" lastUpdated={legal.effectiveDate}>
        <ProjectStatusNotice />
        <p>
          These terms apply to this website. “Contineon”, “we”, and “us” refer to the people
          operating the Contineon project, not an incorporated company. By using this website,
          you agree to these website terms. If you do not agree, please stop using the website.
        </p>
        <LegalSection n="1" heading="Our work and early access">
          <p>
            We are developing Asilia for laboratory research. Product descriptions, research
            directions, demonstrations, and previews describe work in development; they are not
            commitments to deliver particular features, results, integrations, or release dates.
            Availability and suitability must be confirmed with the team for your intended use.
          </p>
          <p>
            Sending an inquiry or requesting access does not guarantee admission to a pilot,
            create a partnership, or authorize a charge. Any pilot, access to lab systems, or
            paid work requires a separate agreement identifying the actual parties, scope,
            data handling, responsibilities, and any fees before it begins. These website terms
            do not replace that agreement.
          </p>
        </LegalSection>
        <LegalSection n="2" heading="Using this website">
          <p>
            Use the website lawfully. Do not attempt unauthorized access, interfere with its
            operation, distribute malicious code, submit spam, or misrepresent your identity.
            If you have an invited account, protect your credentials and contact us if you
            suspect unauthorized use. We may restrict access to address misuse or security issues.
          </p>
        </LegalSection>
        <LegalSection n="3" heading="Information you send us">
          <p>
            Provide information you are entitled to share. Please do not send confidential
            research, patient information, credentials, or other sensitive material through
            public contact forms. An inquiry alone does not establish a confidentiality agreement.
            You retain rights in your submissions; we use them to respond and evaluate your request,
            as described in our <Link to="/privacy" className="text-safety hover:underline">Privacy Notice</Link>.
          </p>
        </LegalSection>
        <LegalSection n="4" heading="Website content and third-party materials">
          <p>
            Website text, design, and branding belong to their respective owners. Viewing this
            website does not grant ownership of those materials. Open-source software is governed
            by its own license; third-party images and media remain subject to their owners’ rights.
            Links to other services are provided for reference and those services have their own terms.
          </p>
        </LegalSection>
        <LegalSection n="5" heading="Research and availability">
          <p>
            Website content is general information, not instructions to operate instruments or
            conduct experiments. Qualified personnel must independently assess scientific outputs,
            safety, and applicable requirements before using any research system. We do not promise
            that the website will always be available, error-free, or suitable for a particular purpose.
            Nothing in these terms excludes rights or responsibilities that applicable law does not
            allow to be excluded.
          </p>
        </LegalSection>
        <LegalSection n="6" heading="Changes and contact">
          <p>
            We may update these website terms as the project develops. The date above identifies
            the latest revision. If the website’s operator changes following incorporation, we
            will update the operator details and relevant notices.
          </p>
          <LegalContact />
        </LegalSection>
      </LegalDoc>
    </>
  );
}
