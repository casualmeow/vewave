import { Component, type ErrorInfo, type ReactNode } from 'react'

export class RendererErrorBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    this.props.onFailure()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
