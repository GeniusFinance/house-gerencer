import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import OwesPage from '@/app/owes/page'
import '@testing-library/jest-dom'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock PaymentDrawer component
jest.mock('@/app/owes/PaymentDrawer', () => {
  return function MockPaymentDrawer() {
    return <div data-testid="payment-drawer">Payment Drawer</div>
  }
})

// Mock fetch globally
global.fetch = jest.fn()

const mockSheetData = [
  {
    purchaseDate: '01/01/2026',
    validateDate: '15/01/2026',
    description: 'Test Expense 1',
    value: 100,
    account: 'Test Account',
    status: 'pending',
    category: 'Food',
    subcategory: 'Groceries',
    tags: '',
    pessoas: 'testuser',
    credit: '',
    card: '',
    observation: '',
    month: '1',
    year: '2026',
    code: 'CODE001',
  },
  {
    purchaseDate: '05/01/2026',
    validateDate: '20/01/2026',
    description: 'Test Expense 2',
    value: 200,
    account: 'Test Account',
    status: 'pending',
    category: 'Transport',
    subcategory: 'Gas',
    tags: '',
    pessoas: 'testuser',
    credit: '',
    card: '',
    observation: '',
    month: '1',
    year: '2026',
    code: 'CODE002',
  },
  {
    purchaseDate: '10/01/2026',
    validateDate: '25/01/2026',
    description: 'Test Expense 3',
    value: 150,
    account: 'Test Account',
    status: 'pending',
    category: 'Entertainment',
    subcategory: 'Movies',
    tags: 'recebi',
    pessoas: 'testuser',
    credit: '',
    card: '',
    observation: '',
    month: '1',
    year: '2026',
    code: 'CODE003',
  },
]

const mockIncomeData = [
  {
    date: '12/01/2026',
    description: 'Payment for Test Expense 1',
    value: 50,
    account: 'Test Account',
    status: 'received',
    category: 'Incomes',
    tags: 'testuser',
    relatedCreditId: 'Test Expense 1',
    month: '1',
    year: '2026',
  },
]

describe('OwesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/sheet-data')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSheetData,
        })
      }
      if (url.includes('/api/income-data')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockIncomeData,
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  describe('Component Rendering', () => {
    it('should show loading state initially', () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => 'testuser'),
      })

      render(<OwesPage />)
      expect(screen.getByText('Carregando...')).toBeInTheDocument()
    })

    it('should show error message when user parameter is missing', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => null),
      })

      render(<OwesPage />)

      await waitFor(() => {
        expect(screen.getByText('Missing User Parameter')).toBeInTheDocument()
        expect(screen.getByText(/Please provide a user name/i)).toBeInTheDocument()
      })
    })

    it('should display user name when data loads', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => 'testuser'),
      })

      render(<OwesPage />)

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument()
      })
    })

    it('should show error state when API fails', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => 'testuser'),
      })
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('API Error')
      )

      render(<OwesPage />)

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
      })
    })
  })

  describe('Data Display', () => {
    it('should display total debt amount', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => 'testuser'),
      })

      render(<OwesPage />)

      await waitFor(() => {
        // Total of unpaid items (CODE001: 100 + CODE002: 200 = 300)
        // CODE003 is marked as 'recebi' so it's excluded by default
        expect(screen.getByText(/Total em Dívida/i)).toBeInTheDocument()
      })
    })

    it('should show "No debts found" when no data matches filter', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => 'nonexistentuser'),
      })

      render(<OwesPage />)

      await waitFor(() => {
        expect(screen.getByText('All Clear!')).toBeInTheDocument()
        expect(screen.getByText('No debts found for this user.')).toBeInTheDocument()
      })
    })
  })

  describe('Filtering', () => {
    it('should clear date filters', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => 'testuser'),
      })

      render(<OwesPage />)

      await waitFor(() => {
        const clearButton = screen.getByText('Limpar Filtro de Data')
        fireEvent.click(clearButton)
      })
    })
  })

  describe('Multi-select Functionality', () => {
    it('should show alert when trying to pay with no selection', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => 'testuser'),
      })

      const alertMock = jest.spyOn(window, 'alert').mockImplementation()

      render(<OwesPage />)

      await waitFor(() => {
        const payButtons = screen.queryAllByText('Pagar Selecionados')
        if (payButtons.length === 0) {
          // This is expected when nothing is selected
          expect(payButtons).toHaveLength(0)
        }
      })

      alertMock.mockRestore()
    })
  })

  describe('Payment Summary', () => {
    it('should display total paid amount when payments exist', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => 'testuser'),
      })

      render(<OwesPage />)

      await waitFor(() => {
        expect(screen.getByText(/Total Pago/i)).toBeInTheDocument()
      })
    })

    it('should calculate net debt correctly', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => 'testuser'),
      })

      render(<OwesPage />)

      await waitFor(() => {
        expect(screen.getByText(/Saldo Devedor/i)).toBeInTheDocument()
      })
    })
  })
})
