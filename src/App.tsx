import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { MeetingsPage } from './pages/MeetingsPage'
import { ContractsPage } from './pages/ContractsPage'
import { BillsPage } from './pages/BillsPage'
import { MessagesPage } from './pages/MessagesPage'
import { ResidentsPage } from './pages/ResidentsPage'
import { SettingsPage } from './pages/SettingsPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/innskraning" element={<LoginPage />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="fundir" element={<MeetingsPage />} />
            <Route path="samningar" element={<ContractsPage />} />
            <Route path="reikningar" element={<BillsPage />} />
            <Route path="skilabod" element={<MessagesPage />} />
            <Route path="eigendur" element={<ResidentsPage />} />
            <Route path="stillingar" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/innskraning" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
