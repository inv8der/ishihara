import PageLayout from '../../layouts/PageLayout'
import Controls from './components/Controls'
import IshiharaPlate from './components/IshiharaPlate'

export default function Ishihara() {
  return (
    <PageLayout
      sidePanel={<Controls />}
      inlineSidePanel="lg"
      content={<IshiharaPlate />}
    />
  )
}
