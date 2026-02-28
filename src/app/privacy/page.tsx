'use client'

import LegalLayout, { Section } from '@/components/LegalLayout'
import { Eye, Shield, Globe, Lock } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <LegalLayout title="Privacy Policy">
            <Section title="1. Information We Collect" icon={Eye}>
                <p>We collect information you provide directly to us, such as when you create an account (email, name, password hash), connect social SSO providers, or use our identity management features. We also collect usage data to improve our service security.</p>
            </Section>

            <Section title="2. How We Use Information" icon={Lock}>
                <p>We use the information we collect to provide, maintain, and improve Kaappu Identity, to develop new features, and to protect us and our users. This includes security monitoring, rate limiting, and fraud prevention.</p>
            </Section>

            <Section title="3. Data Sharing" icon={Globe}>
                <p>We do not share your personal information with companies, organizations, or individuals outside of Kaappu except in limited cases, such as to comply with legal obligations or with your explicit consent (e.g., when connecting to a third-party application).</p>
            </Section>

            <Section title="4. Your Rights" icon={Shield}>
                <p>You have the right to access, update, or delete your personal information at any time through your account dashboard. For data export requests, please contact our support team.</p>
            </Section>
        </LegalLayout>
    )
}
