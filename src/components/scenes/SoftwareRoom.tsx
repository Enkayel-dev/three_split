import { useState } from 'react'
import { Text } from '@react-three/drei'
import { GlassPanel, GlassCard, GlassButton } from '@/components/glass'
import { useNavigationStore } from '@/store'

interface SoftwareRoomProps {
  reducedMotion: boolean
  reducedTransparency: boolean
}

// Mock projects data
const projects = [
  {
    id: 'software-1',
    title: 'DataPulse Analytics',
    type: 'Real-time Dashboard',
    summary: 'Multi-source business analytics platform',
    tech: ['React', 'D3.js', 'WebSocket'],
  },
  {
    id: 'software-2',
    title: 'FlowState',
    type: 'Workflow Automation',
    summary: 'Visual workflow builder for operations',
    tech: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    id: 'software-3',
    title: 'ContractTrack Pro',
    type: 'Document Management',
    summary: 'Construction document tracking system',
    tech: ['Next.js', 'Supabase', 'AI'],
  },
]

const techStack = [
  { name: 'React', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Three.js', category: '3D/WebGL' },
  { name: 'Supabase', category: 'BaaS' },
]

export default function SoftwareRoom({
  reducedMotion,
  reducedTransparency,
}: SoftwareRoomProps) {
  const { navigateTo } = useNavigationStore()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  return (
    <group>
      {/* Service header */}
      <GlassPanel
        width={1.8}
        height={0.35}
        position={[0, 1.95, 0]}
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
          Custom Software Development
        </Text>
        <Text
          position={[0, -0.04, 0.02]}
          fontSize={0.025}
          color="#b0b0b0"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.6}
        >
          Built for your exact needs. Scalable from day one.
        </Text>
      </GlassPanel>

      {/* Tech stack panel */}
      <GlassPanel
        width={0.65}
        height={0.7}
        position={[-0.85, 1.25, 0]}
        reducedTransparency={reducedTransparency}
        reducedMotion={reducedMotion}
      >
        <Text
          position={[0, 0.28, 0.02]}
          fontSize={0.032}
          color="#4A90D9"
          anchorX="center"
          anchorY="middle"
        >
          Tech Stack
        </Text>
        {techStack.map((tech, i) => (
          <group key={tech.name} position={[0, 0.15 - i * 0.075, 0.02]}>
            <Text
              position={[-0.25, 0, 0]}
              fontSize={0.022}
              color="#e0e0e0"
              anchorX="left"
              anchorY="middle"
            >
              {tech.name}
            </Text>
            <Text
              position={[0.25, 0, 0]}
              fontSize={0.016}
              color="#888888"
              anchorX="right"
              anchorY="middle"
            >
              {tech.category}
            </Text>
          </group>
        ))}
      </GlassPanel>

      {/* Capabilities */}
      <GlassPanel
        width={0.65}
        height={0.45}
        position={[-0.85, 0.65, 0]}
        reducedTransparency={reducedTransparency}
        reducedMotion={reducedMotion}
      >
        <Text
          position={[0, 0.15, 0.02]}
          fontSize={0.028}
          color="#4A90D9"
          anchorX="center"
          anchorY="middle"
        >
          Services
        </Text>
        {['Web Applications', 'Dashboards', 'API Integration', 'PWAs'].map(
          (cap, i) => (
            <Text
              key={cap}
              position={[-0.25, 0.05 - i * 0.065, 0.02]}
              fontSize={0.02}
              color="#e0e0e0"
              anchorX="left"
              anchorY="middle"
            >
              • {cap}
            </Text>
          )
        )}
      </GlassPanel>

      {/* Featured projects */}
      <group position={[0.4, 1.25, 0]}>
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
      <group position={[0, 0.3, 0]}>
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
        <group position={[0, 1.3, 0.3]}>
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
                    position={[0, -0.05, 0.02]}
                    fontSize={0.022}
                    color="#888888"
                    anchorX="center"
                    anchorY="middle"
                  >
                    Technologies: {project?.tech.join(' • ')}
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
