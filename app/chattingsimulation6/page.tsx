import PracticeSimulation from '@/components/simulation/PracticeSimulation'

export const metadata = { title: 'Changing the Topic Simulation | LuxLife Training', robots: { index: false, follow: false } }

export default function TopicSimulationPage() {
  return <PracticeSimulation type="topic-change" />
}
