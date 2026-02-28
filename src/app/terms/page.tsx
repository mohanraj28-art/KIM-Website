'use client'

import LegalLayout, { Section } from '@/components/LegalLayout'
import { Scale, ScrollText, Shield, AlertTriangle } from 'lucide-react'

export default function TermsPage() {
    return (
        <LegalLayout title="Terms of Service">
            <Section title="1. Acceptance of Terms" icon={Scale}>
                <p>By accessing or using Kaappu Identity, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We reserve the right to update these terms at any time.</p>
            </Section>

            <Section title="2. Account Responsibility" icon={Shield}>
                <p>You are responsible for maintaining the security of your account and credentials. Any activity performed under your account is your sole responsibility. We recommend enabling Multi-Factor Authentication (MFA) for enhanced protection.</p>
            </Section>

            <Section title="3. Acceptable Use" icon={AlertTriangle}>
                <p>You may not use Kaappu Identity for any illegal or unauthorized purpose. You agree to comply with all laws, rules, and regulations applicable to your use of the service. Prohibited activities include but are not limited to attempting to breach our security infrastructure or using the service for phishing.</p>
            </Section>

            <Section title="4. Termination" icon={ScrollText}>
                <p>We reserve the right to suspend or terminate your access to the service at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users of the service, us, or third parties, or for any other reason.</p>
            </Section>
        </LegalLayout>
    )
}
