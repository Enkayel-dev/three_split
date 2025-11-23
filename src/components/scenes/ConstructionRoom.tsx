import { useState } from 'react'
import { Text } from '@react-three/drei'
import { GlassPanel, GlassCard, GlassButton } from '@/components/glass'
import { useNavigationStore } from '@/store'

interface ConstructionRoomProps {
  reducedMotion: boolean
  reducedTransparency: boolean
}

// Mock construction projects
const projects = [
  {
    id: 'construction-1',
    title: 'Harmony House',
    type: 'Custom Residential',
    summary: '3,200 sq ft net-zero ready home',
    location: 'West Vancouver, BC',
    year: '2024',
  },
  {
    id: 'construction-2',
    title: 'The Corner Studio',
    type: 'Live/Work Conversion',
    summary: 'Historic warehouse to creative space',
    location: 'Gastown, Vancouver',
    year: '2023',
  },
  {
    id: 'construction-3',
    title: 'Bloom Botanics HQ',
    type: 'Commercial Renovation',
    summary: 'Retail flagship with integrated greenhouse',
    location: 'Kitsilano, Vancouver',
    year: '2023',
  },
]

const services = [
  'Architectural Design',
  'Space Planning',
  'Residential Construction',
  'Commercial Renovation',
  'Sustainable Building',
  'Project Management',
]

export default function ConstructionRoom({
  reducedMotion,
  reducedTransparency,
}: ConstructionRoomProps) {
  const { navigateTo } = useNavigationStore()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  return (
    <group>
      {/* Service header */}
      <GlassPanel
        width={1.8}
        height={0.35}
        position={[0, 1.9, 0]}
        reducedTransparency={reducedTransparency}
        reducedMotion={reducedMotion}
      >
        <Text
          position={[0, 0.06, 0.02]}
          fontSize={0.055}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-SemiBold.woff"
        >
          Construction & Architecture
        </Text>
        <Text
          position={[0, -0.04, 0.02]}
          fontSize={0.025}
          color="#b0b0b0"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.6}
        >
          Spaces that work as hard as you do.
        </Text>
      </GlassPanel>

      {/* Services panel */}
      <GlassPanel
        width={0.7}
        height={0.75}
        position={[-0.85, 1.15, 0]}
        reducedTransparency={reducedTransparency}
        reducedMotion={reducedMotion}
      >
        <Text
          position={[0, 0.3, 0.02]}
          fontSize={0.032}
          color="#4A90D9"
          anchorX="center"
          anchorY="middle"
        >
          Services
        </Text>
        {services.map((service, i) => (
          <Text
            key={service}
            position={[-0.28, 0.18 - i * 0.08, 0.02]}
            fontSize={0.021}
            color="#e0e0e0"
            anchorX="left"
            anchorY="middle"
          >
            • {service}
          </Text>
        ))}
      </GlassPanel>

      {/* Approach panel */}
      <GlassPanel
        width={0.7}
        height={0.35}
        position={[-0.85, 0.55, 0]}
        reducedTransparency={reducedTransparency}
        reducedMotion={reducedMotion}
      >
        <Text
          position={[0, 0.1, 0.02]}
          fontSize={0.028}
          color="#4A90D9"
          anchorX="center"
          anchorY="middle"
        >
          Our Approach
        </Text>
        <Text
          position={[0, -0.04, 0.02]}
          fontSize={0.018}
          color="#b0b0b0"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.6}
          textAlign="center"
        >
          Design-build integration ensures your space supports operational goals
          from day one.
        </Text>
      </GlassPanel>

      {/* Featured projects */}
      <group position={[0.4, 1.2, 0]}>
        <Text
          position={[0, 0.42, 0.02]}
          fontSize={0.032}
          color="#4A90D9"
          anchorX="center"
          anchorY="middle"
        >
          Featured Projects
        </Text>

        {projects.map((project, index) => (
          <GlassCard
            key={project.id}
            width={0.85}
            height={0.24}
            position={[0, 0.2 - index * 0.3, 0]}
            title={project.title}
            subtitle={project.type}
            reducedTransparency={reducedTransparency}
            reducedMotion={reducedMotion}
            onClick={() => setSelectedProject(project.id)}
          />
        ))}
      </group>

      {/* Back button */}
      <group position={[0, 0.25, 0]}>
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

      {/* Project detail modal */}
      {selectedProject && (
        <group position={[0, 1.25, 0.3]}>
          <GlassPanel
            width={1.4}
            height={0.95}
            reducedTransparency={reducedTransparency}
            reducedMotion={reducedMotion}
            onClick={() => setSelectedProject(null)}
          >
            {(() => {
              const project = projects.find((p) => p.id === selectedProject)
              return (
                <>
                  <Text
                    position={[0, 0.38, 0.02]}
                    fontSize={0.045}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {project?.title}
                  </Text>
                  <Text
                    position={[0, 0.28, 0.02]}
                    fontSize={0.025}
                    color="#4A90D9"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {project?.type}
                  </Text>
                  <Text
                    position={[0, 0.12, 0.02]}
                    fontSize={0.028}
                    color="#e0e0e0"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={1.2}
                  >
                    {project?.summary}
                  </Text>
                  <Text
                    position={[0, -0.02, 0.02]}
                    fontSize={0.022}
                    color="#888888"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {project?.location} • {project?.year}
                  </Text>
                  <Text
                    position={[0, -0.35, 0.02]}
                    fontSize={0.018}
                    color="#666666"
                    anchorX="center"
                    anchorY="middle"
                  >
                    Click to close
                  </Text>
                </>
              )
            })()}
          </GlassPanel>
        </group>
      )}
    </group>
  )
}
