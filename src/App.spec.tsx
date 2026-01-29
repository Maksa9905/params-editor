import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('должен рендерить заголовок', () => {
    render(<App />)
    expect(screen.getByText('Редактор параметров')).toBeInTheDocument()
  })

  it('должен рендерить текстовые поля параметров', () => {
    render(<App />)
    expect(screen.getByLabelText('Имя пользователя')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('должен отображать начальные значения', () => {
    render(<App />)
    const nameInput = screen.getByLabelText('Имя пользователя') as HTMLInputElement
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    
    expect(nameInput.value).toBe('Иван')
    expect(emailInput.value).toBe('ivan@example.com')
  })
})
