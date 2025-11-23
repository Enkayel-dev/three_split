import { useState } from 'react'
import { Text } from '@react-three/drei'
import { GlassPanel, GlassButton } from '@/components/glass'
import { GlassInput, GlassTextarea, GlassSelect } from '@/components/glass'
import { useNavigationStore } from '@/store'

interface ContactNodeProps {
  reducedMotion: boolean
  reducedTransparency: boolean
}

const serviceOptions = [
  { value: 'consulting', label: 'Business Consulting' },
  { value: 'software', label: 'Software Development' },
  { value: 'construction', label: 'Construction & Architecture' },
  { value: 'multiple', label: 'Multiple Services' },
  { value: 'other', label: 'Other / General Inquiry' },
]

export default function ContactNode({
  reducedMotion,
  reducedTransparency,
}: ContactNodeProps) {
  const { navigateTo } = useNavigationStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    // In production, this would send to an API
    console.log('Form submitted:', formData)
    setSubmitted(true)
  }

  return (
    <group>
      {/* Header */}
      <GlassPanel
        width={1.6}
        height={0.25}
        position={[0, 1.75, 0]}
        reducedTransparency={reducedTransparency}
        reducedMotion={reducedMotion}
      >
        <Text
          position={[0, 0.03, 0.02]}
          fontSize={0.055}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          
        >
          Get in Touch
        </Text>
        <Text
          position={[0, -0.06, 0.02]}
          fontSize={0.022}
          color="#b0b0b0"
          anchorX="center"
          anchorY="middle"
        >
          Let's discuss how we can help your business grow
        </Text>
      </GlassPanel>

      {/* Contact form panel */}
      <GlassPanel
        width={1.2}
        height={1.0}
        position={[-0.45, 1.05, 0]}
        reducedTransparency={reducedTransparency}
        reducedMotion={reducedMotion}
      >
        {!submitted ? (
          <group>
            <Text
              position={[0, 0.42, 0.02]}
              fontSize={0.028}
              color="#4A90D9"
              anchorX="center"
              anchorY="middle"
            >
              Send Us a Message
            </Text>

            {/* Form fields */}
            <GlassInput
              label="Name"
              placeholder="Your name"
              value={formData.name}
              width={0.9}
              position={[0, 0.28, 0.02]}
              reducedTransparency={reducedTransparency}
              reducedMotion={reducedMotion}
              onChange={(v) => setFormData({ ...formData, name: v })}
            />

            <GlassInput
              label="Email"
              placeholder="you@company.com"
              value={formData.email}
              width={0.9}
              position={[0, 0.12, 0.02]}
              reducedTransparency={reducedTransparency}
              reducedMotion={reducedMotion}
              onChange={(v) => setFormData({ ...formData, email: v })}
            />

            <GlassSelect
              label="Service Interest"
              placeholder="Select a service..."
              options={serviceOptions}
              value={formData.service}
              width={0.9}
              position={[0, -0.04, 0.02]}
              reducedTransparency={reducedTransparency}
              reducedMotion={reducedMotion}
              onChange={(v) => setFormData({ ...formData, service: v })}
            />

            <GlassTextarea
              label="Message"
              placeholder="Tell us about your project..."
              value={formData.message}
              width={0.9}
              height={0.12}
              position={[0, -0.25, 0.02]}
              reducedTransparency={reducedTransparency}
              reducedMotion={reducedMotion}
              onChange={(v) => setFormData({ ...formData, message: v })}
            />

            <group position={[0, -0.42, 0.02]}>
              <GlassButton
                label="Send Message"
                variant="primary"
                size="lg"
                reducedTransparency={reducedTransparency}
                reducedMotion={reducedMotion}
                onClick={handleSubmit}
              />
            </group>
          </group>
        ) : (
          <group>
            <Text
              position={[0, 0.1, 0.02]}
              fontSize={0.04}
              color="#4A90D9"
              anchorX="center"
              anchorY="middle"
            >
              Thank You!
            </Text>
            <Text
              position={[0, -0.02, 0.02]}
              fontSize={0.025}
              color="#e0e0e0"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.0}
              textAlign="center"
            >
              We've received your message and will get back to you within 24
              hours.
            </Text>
            <group position={[0, -0.2, 0.02]}>
              <GlassButton
                label="Send Another"
                variant="secondary"
                size="md"
                reducedTransparency={reducedTransparency}
                reducedMotion={reducedMotion}
                onClick={() => {
                  setSubmitted(false)
                  setFormData({ name: '', email: '', service: '', message: '' })
                }}
              />
            </group>
          </group>
        )}
      </GlassPanel>

      {/* Contact info panel */}
      <GlassPanel
        width={0.65}
        height={0.75}
        position={[0.55, 1.05, 0]}
        reducedTransparency={reducedTransparency}
        reducedMotion={reducedMotion}
      >
        <Text
          position={[0, 0.3, 0.02]}
          fontSize={0.028}
          color="#4A90D9"
          anchorX="center"
          anchorY="middle"
        >
          Contact Info
        </Text>

        {/* Email */}
        <group position={[0, 0.15, 0.02]}>
          <Text
            position={[0, 0.025, 0]}
            fontSize={0.018}
            color="#888888"
            anchorX="center"
            anchorY="middle"
          >
            Email
          </Text>
          <Text
            position={[0, -0.015, 0]}
            fontSize={0.02}
            color="#e0e0e0"
            anchorX="center"
            anchorY="middle"
          >
            hello@enkayel.studio
          </Text>
        </group>

        {/* Phone */}
        <group position={[0, 0.02, 0.02]}>
          <Text
            position={[0, 0.025, 0]}
            fontSize={0.018}
            color="#888888"
            anchorX="center"
            anchorY="middle"
          >
            Phone
          </Text>
          <Text
            position={[0, -0.015, 0]}
            fontSize={0.02}
            color="#e0e0e0"
            anchorX="center"
            anchorY="middle"
          >
            +1 (604) 555-0123
          </Text>
        </group>

        {/* Location */}
        <group position={[0, -0.11, 0.02]}>
          <Text
            position={[0, 0.025, 0]}
            fontSize={0.018}
            color="#888888"
            anchorX="center"
            anchorY="middle"
          >
            Location
          </Text>
          <Text
            position={[0, -0.015, 0]}
            fontSize={0.02}
            color="#e0e0e0"
            anchorX="center"
            anchorY="middle"
          >
            Vancouver, BC
          </Text>
        </group>

        {/* Hours */}
        <group position={[0, -0.24, 0.02]}>
          <Text
            position={[0, 0.025, 0]}
            fontSize={0.018}
            color="#888888"
            anchorX="center"
            anchorY="middle"
          >
            Business Hours
          </Text>
          <Text
            position={[0, -0.015, 0]}
            fontSize={0.018}
            color="#e0e0e0"
            anchorX="center"
            anchorY="middle"
          >
            Mon-Fri: 9am - 6pm PST
          </Text>
        </group>
      </GlassPanel>

      {/* Back button */}
      <group position={[0, 0.35, 0]}>
        <GlassButton
          label="← Back to Home"
          variant="secondary"
          size="md"
          position={[0, 0, 0]}
          reducedTransparency={reducedTransparency}
          reducedMotion={reducedMotion}
          onClick={() => navigateTo('home')}
        />
      </group>
    </group>
  )
}
