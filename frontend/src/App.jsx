import { HelloMessage } from './components/HelloMessage'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Hello World</h1>
      <HelloMessage />
    </div>
  )
}

export default App
