import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }

type State = { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AppErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-white p-8 text-[#323232]">
          <h1 className="text-xl font-bold">Villa í forritinu</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#666]">
            Eitthvað fór úrskeiðis við birtingu. Athugaðu stöðluðu gluggann (F12 → Console) og endurhlaðið síðuna.
          </p>
          <pre className="mt-4 max-w-full overflow-auto rounded-md bg-[#f3f5f7] p-4 text-[13px] text-red-700">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            className="mt-6 rounded-md bg-[#18325a] px-4 py-2 text-[14px] font-medium text-white"
            onClick={() => this.setState({ error: null })}
          >
            Reyna aftur
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
