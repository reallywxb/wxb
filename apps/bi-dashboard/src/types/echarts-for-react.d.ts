declare module 'echarts-for-react' {
  import * as React from 'react'
  import type { ECharts } from 'echarts'

  export interface EChartsReactProps {
    option: any
    style?: React.CSSProperties
    opts?: Record<string, any>
    onEvents?: Record<string, (...args: any[]) => void>
    theme?: string | Record<string, any>
    showLoading?: boolean
    loadingOption?: Record<string, any>
    autoResize?: boolean
    onChartReady?: (instance: ECharts) => void
  }

  const ReactEChartsCore: React.ComponentType<EChartsReactProps>
  export default ReactEChartsCore
  export { ReactEChartsCore }
}
