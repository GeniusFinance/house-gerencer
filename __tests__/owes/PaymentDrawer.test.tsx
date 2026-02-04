import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PaymentDrawer from '@/app/owes/PaymentDrawer'
import { SheetRow } from '@/types/sheet'
import '@testing-library/jest-dom'

const mockOnClose = jest.fn()
const mockOnSubmit = jest.fn()

const mockTransaction: SheetRow = {
  purchaseDate: '01/01/2026',
  validateDate: '15/01/2026',
  description: 'Test Transaction',
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
}

const mockSelectedOwes: SheetRow[] = [
  {
    ...mockTransaction,
    description: 'Owe 1',
    value: 50,
    code: 'CODE001',
  },
  {
    ...mockTransaction,
    description: 'Owe 2',
    value: 75,
    code: 'CODE002',
  },
]

describe('PaymentDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <PaymentDrawer
          isOpen={false}
          onClose={mockOnClose}
          selectedTransaction={null}
          selectedOwes={[]}
          userName="testuser"
          netDebt={100}
          onSubmit={mockOnSubmit}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render when isOpen is true', () => {
      render(
        <PaymentDrawer
          isOpen={true}
          onClose={mockOnClose}
          selectedTransaction={null}
          selectedOwes={[]}
          userName="testuser"
          netDebt={100}
          onSubmit={mockOnSubmit}
        />
      )
      expect(screen.getByText('Registrar Pagamento')).toBeInTheDocument()
    })
  })

  describe('Single Transaction Payment', () => {

  })

  describe('Multiple Owes Payment', () => {

  })

  describe('Form Interaction', () => {

    it('should call onClose when cancel button is clicked', () => {
      render(
        <PaymentDrawer
          isOpen={true}
          onClose={mockOnClose}
          selectedTransaction={mockTransaction}
          selectedOwes={[]}
          userName="testuser"
          netDebt={100}
          onSubmit={mockOnSubmit}
        />
      )

      const cancelButton = screen.getByText('Cancelar')
      fireEvent.click(cancelButton)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(
        <PaymentDrawer
          isOpen={true}
          onClose={mockOnClose}
          selectedTransaction={mockTransaction}
          selectedOwes={[]}
          userName="testuser"
          netDebt={100}
          onSubmit={mockOnSubmit}
        />
      )

      const backdrop = container.querySelector('.fixed.inset-0')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe('Form Submission', () => {

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(
        <PaymentDrawer
          isOpen={true}
          onClose={mockOnClose}
          selectedTransaction={mockTransaction}
          selectedOwes={[]}
          userName="testuser"
          netDebt={100}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByText('Confirmar Pagamento')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Enviando...')).toBeInTheDocument()
      })
    })

  })


})
