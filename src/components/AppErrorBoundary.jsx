import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="fatal-error" role="alert">
          <p>Mission control lost contact with the simulation.</p>
          <button type="button" onClick={() => window.location.reload()}>Reload mission</button>
        </main>
      )
    }

    return this.props.children
  }
}
