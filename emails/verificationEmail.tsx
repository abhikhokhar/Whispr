import { Preview, Row, Section, Heading, Text } from "react-email";

interface VerificationEmailProps{
    username: string;
    otp: string;
}

export default function verificationEmail({username, otp}: VerificationEmailProps){
    return (
        <html lang="en" >
            <head>
                <title>Verification Code</title>
            </head>
            <Preview>Here&apos;s your verification code: {otp}</Preview>
            <Section>
                <Row>
                    <Heading as="h2">Hello {username}</Heading>
                </Row>
                <Row>
                    <Text>
                        Thankyou for signing up! Please use the following One-Time Password (OTP) to verify your email address and complete your registration:
                    </Text>
                </Row>
                <Row>
                    <Text>{otp}</Text>
                </Row>
            </Section>
            
        </html>
    )
}