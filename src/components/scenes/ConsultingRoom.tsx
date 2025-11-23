import { useState } from 'react'
import { Text } from '@react-three/drei'
import { GlassPanel, GlassCard, GlassButton } from '@/components/glass'
import { useNavigationStore } from '@/store'

interface ConsultingRoomProps {
  reducedMotion: boolean
  reducedTransparency: boolean
}

// Mock case studies data
const caseStudies = [
  {
    id: 'consulting-1',
    title: 'The Brew Lab',
    type: 'Operations Automation',
    summary: '25% reduction in operational overhead',
    year: '2024',
  },
  {
    id: 'consulting-2',
    title: 'Urban Threads',
    type: 'Retail Process Streamlining',
    summary: '40% fewer errors across 5 locations',
    year: '2023',
  },
  {
    id: 'consulting-3',
    title: 'Peak Performance Physio',
    type: 'Healthcare Workflow',
    summary: '20% increase in patient throughput',
    year: '2023',
  },
]

export default function ConsultingRoom({
  reducedMotion,
  reducedTransparency,
}: ConsultingRoomProps) {
  const { navigateTo } = useNavigationStore()
  const [selectedCase, setSelectedCase] = useState<string | null>(null)

  return (
    <group>
      {/* Service header panel */}
      <GlassPanel
        width={1.8}
        height={0.35}
        position={[0, 1.8, 0]}
        reducedTransparency={reducedTransparency}
        reducedMotion={reducedMotion}
      >
        <Text
          position={[0, 0.06, 0.02]}
          fontSize={0.06}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          
        >
          Business Operations Consulting
        </Text>
        <Text
          position={[0, -0.04, 0.02]}
          fontSize={0.025}
          color="#b0b0b0"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.6}
        >
          Streamline processes. Eliminate waste. Scale with confidence.
        </Text>
      </GlassPanel>

      {/* Capabilities panel */}
      <GlassPanel
        width={0.7}
        height={0.8}
        position={[-0.85, 1.1, 0]}
        reducedTransparency={reducedTransparency}
        reducedMotion={reducedMotion}
      >
        <Text
          position={[0, 0.32, 0.02]}
          fontSize={0.035}
          color="#4A90D9"
          anchorX="center"
          anchorY="middle"
        >
          Capabilities
        </Text>
        {[
          'Process mapping',
          'Workflow automation',
          'KPI dashboards',
          'SOP creation',
          'Change management',
          'Efficiency audits',
        ].map((cap, i) => (
          <Text
            key={cap}
            position={[-0.28, 0.2 - i * 0.085, 0.02]}
            fontSize={0.022}
            color="#e0e0e0"
            anchorX="left"
            anchorY="middle"
          >
            • {cap}
          </Text>
        ))}
      </GlassPanel>

      {/* Case studies grid */}
      <group position={[0.4, 1.1, 0]}>
        <Text
          position={[0, 0.42, 0.02]}
          fontSize={0.035}
          color="#4A90D9"
          anchorX="center"
          anchorY="middle"
        >
          Featured Work
        </Text>

        {caseStudies.map((study, index) => (
          <GlassCard
            key={study.id}
            width={0.85}
            height={0.22}
            position={[0, 0.2 - index * 0.28, 0]}
            title={study.title}
            subtitle={study.type}
            reducedTransparency={reducedTransparency}
            reducedMotion={reducedMotion}
            onClick={() => setSelectedCase(study.id)}
          />
        ))}
      </group>

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

      {/* Selected case study detail (simple overlay) */}
      {selectedCase && (
        <group position={[0, 1.2, 0.3]}>
          <GlassPanel
            width={1.4}
            height={0.9}
            reducedTransparency={reducedTransparency}
            reducedMotion={reducedMotion}
            onClick={() => setSelectedCase(null)}
          >
            <Text
              position={[0, 0.35, 0.02]}
              fontSize={0.045}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {caseStudies.find((c) => c.id === selectedCase)?.title}
            </Text>
            <Text
              position={[0, 0.25, 0.02]}
              fontSize={0.025}
              color="#4A90D9"
              anchorX="center"
              anchorY="middle"
            >
              {caseStudies.find((c) => c.id === selectedCase)?.type}
            </Text>
            <Text
              position={[0, 0.1, 0.02]}
              fontSize={0.03}
              color="#e0e0e0"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.2}
            >
              {caseStudies.find((c) => c.id === selectedCase)?.summary}
            </Text>
            <Text
              position={[0, -0.3, 0.02]}
              fontSize={0.02}
              color="#888888"
              anchorX="center"
              anchorY="middle"
            >
              Click to close
            </Text>
          </GlassPanel>
        </group>
      )}
    </group>
  )
}
