import {
  filterByUser,
  calculateTotal,
  formatCurrency,
  parseSheetData,
} from '@/lib/dataHelpers'
import { SheetRow } from '@/types/sheet'

describe('dataHelpers', () => {
  const mockSheetData: SheetRow[] = [
    {
      purchaseDate: '01/01/2026',
      validateDate: '15/01/2026',
      description: 'Expense 1',
      value: 100,
      account: 'Account 1',
      status: 'pending',
      category: 'Food',
      subcategory: 'Groceries',
      tags: '',
      pessoas: 'user1',
      credit: '',
      card: '',
      observation: '',
      month: '1',
      year: '2026',
      code: 'CODE001',
    },
    {
      purchaseDate: '02/01/2026',
      validateDate: '16/01/2026',
      description: 'Expense 2',
      value: 200,
      account: 'Account 2',
      status: 'pending',
      category: 'Transport',
      subcategory: 'Gas',
      tags: '',
      pessoas: 'user2',
      credit: '',
      card: '',
      observation: '',
      month: '1',
      year: '2026',
      code: 'CODE002',
    },
    {
      purchaseDate: '03/01/2026',
      validateDate: '17/01/2026',
      description: 'Expense 3',
      value: 150,
      account: 'Account 1',
      status: 'pending',
      category: 'Entertainment',
      subcategory: 'Movies',
      tags: '',
      pessoas: 'user1',
      credit: '',
      card: '',
      observation: '',
      month: '1',
      year: '2026',
      code: 'CODE003',
    },
  ]

  describe('filterByUser', () => {
    it('should filter data by user name', () => {
      const result = filterByUser(mockSheetData, 'user1')
      expect(result).toHaveLength(2)
      expect(result[0].pessoas).toBe('user1')
      expect(result[1].pessoas).toBe('user1')
    })

    it('should return empty array when no matching user', () => {
      const result = filterByUser(mockSheetData, 'nonexistent')
      expect(result).toHaveLength(0)
    })

    it('should be case insensitive', () => {
      const result = filterByUser(mockSheetData, 'USER1')
      expect(result).toHaveLength(2)
    })

    it('should handle empty data array', () => {
      const result = filterByUser([], 'user1')
      expect(result).toHaveLength(0)
    })
  })

  describe('calculateTotal', () => {
    it('should calculate total value correctly', () => {
      const result = calculateTotal(mockSheetData)
      expect(result).toBe(450) // 100 + 200 + 150
    })

    it('should return 0 for empty array', () => {
      const result = calculateTotal([])
      expect(result).toBe(0)
    })

    it('should handle single item', () => {
      const result = calculateTotal([mockSheetData[0]])
      expect(result).toBe(100)
    })

  })



  describe('parseSheetData', () => {
    it('should parse raw sheet data correctly', () => {
      const rawData = [
        {
          purchaseDate: '01/01/2026',
          validateDate: '15/01/2026',
          description: 'Test',
          value: '100',
          account: 'Account',
          status: 'pending',
          category: 'Food',
          subcategory: 'Groceries',
          tags: '',
          pessoas: 'user1',
          credit: '',
          card: '',
          observation: '',
          month: '1',
          year: '2026',
          code: 'CODE001',
        },
      ]

      const result = parseSheetData(rawData)
      expect(result).toHaveLength(1)
      expect(result[0].value).toBe(100)
      expect(typeof result[0].value).toBe('number')
    })

    it('should handle string values correctly', () => {
      const rawData = [
        {
          ...mockSheetData[0],
          value: '250.50',
        },
      ]

      const result = parseSheetData(rawData)
      expect(result[0].value).toBe(250.5)
    })

    it('should handle empty array', () => {
      const result = parseSheetData([])
      expect(result).toHaveLength(0)
    })

    it('should handle invalid numeric values', () => {
      const rawData = [
        {
          ...mockSheetData[0],
          value: 'invalid',
        },
      ]

      const result = parseSheetData(rawData)
      expect(isNaN(result[0].value)).toBe(true)
    })
  })
})
