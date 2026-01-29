import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import {
  ParamsEditor,
  createParamId,
  ParamType,
  type Param,
  type Model,
  type ParamValue,
} from './App'

describe('ParamsEditor', () => {
  describe('Отображение полей по params', () => {
    it('должен отобразить все поля согласно переданным params', () => {
      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Имя пользователя',
          type: ParamType.string,
        },
        {
          id: createParamId(2),
          name: 'Email',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          { paramId: createParamId(1), type: ParamType.string, value: 'Иван' },
          {
            paramId: createParamId(2),
            type: ParamType.string,
            value: 'ivan@example.com',
          },
        ],
      }

      render(<ParamsEditor params={params} model={model} />)

      expect(screen.getByLabelText('Имя пользователя')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('должен отобразить правильное количество полей', () => {
      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Поле 1',
          type: ParamType.string,
        },
        {
          id: createParamId(2),
          name: 'Поле 2',
          type: ParamType.string,
        },
        {
          id: createParamId(3),
          name: 'Поле 3',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          { paramId: createParamId(1), type: ParamType.string, value: '' },
          { paramId: createParamId(2), type: ParamType.string, value: '' },
          { paramId: createParamId(3), type: ParamType.string, value: '' },
        ],
      }

      render(<ParamsEditor params={params} model={model} />)

      const inputs = screen.getAllByRole('textbox')
      expect(inputs).toHaveLength(3)
    })

    it('должен отобразить корректные labels для каждого поля', () => {
      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Уникальное имя поля',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'значение',
          },
        ],
      }

      render(<ParamsEditor params={params} model={model} />)

      expect(screen.getByLabelText('Уникальное имя поля')).toBeInTheDocument()
    })
  })

  describe('Корректная инициализация из model.paramValues', () => {
    it('должен отобразить начальные значения из model.paramValues', () => {
      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Имя',
          type: ParamType.string,
        },
        {
          id: createParamId(2),
          name: 'Email',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'Александр',
          },
          {
            paramId: createParamId(2),
            type: ParamType.string,
            value: 'alex@test.com',
          },
        ],
      }

      render(<ParamsEditor params={params} model={model} />)

      const nameInput = screen.getByLabelText('Имя') as HTMLInputElement
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement

      expect(nameInput.value).toBe('Александр')
      expect(emailInput.value).toBe('alex@test.com')
    })

    it('должен корректно инициализировать пустые значения', () => {
      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Пустое поле',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          { paramId: createParamId(1), type: ParamType.string, value: '' },
        ],
      }

      render(<ParamsEditor params={params} model={model} />)

      const input = screen.getByLabelText('Пустое поле') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('должен выбросить ошибку, если в model нет значения для параметра', () => {
      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Поле',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [],
      }

      const originalError = console.error
      console.error = () => {}

      expect(() => {
        render(<ParamsEditor params={params} model={model} />)
      }).toThrow('The model must contain a value for each parameter')

      console.error = originalError
    })
  })

  describe('Корректный результат getModel() после изменений', () => {
    it('должен вернуть обновленную модель через getModel() после изменения одного поля', async () => {
      const user = userEvent.setup()
      const ref = createRef<{ getModel: () => Model }>()

      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Имя',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'Начальное значение',
          },
        ],
      }

      render(<ParamsEditor ref={ref} params={params} model={model} />)

      const input = screen.getByLabelText('Имя')
      await user.clear(input)
      await user.type(input, 'Новое значение')

      const updatedModel = ref.current?.getModel()

      expect(updatedModel).toEqual({
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'Новое значение',
          },
        ],
      })
    })

    it('должен вернуть обновленную модель после изменения нескольких полей', async () => {
      const user = userEvent.setup()
      const ref = createRef<{ getModel: () => Model }>()

      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Имя',
          type: ParamType.string,
        },
        {
          id: createParamId(2),
          name: 'Email',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'Иван',
          },
          {
            paramId: createParamId(2),
            type: ParamType.string,
            value: 'ivan@test.com',
          },
        ],
      }

      render(<ParamsEditor ref={ref} params={params} model={model} />)

      const nameInput = screen.getByLabelText('Имя')
      const emailInput = screen.getByLabelText('Email')

      await user.clear(nameInput)
      await user.type(nameInput, 'Петр')

      await user.clear(emailInput)
      await user.type(emailInput, 'petr@example.com')

      const updatedModel = ref.current?.getModel()

      expect(updatedModel).toEqual({
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'Петр',
          },
          {
            paramId: createParamId(2),
            type: ParamType.string,
            value: 'petr@example.com',
          },
        ],
      })
    })

    it('должен вернуть новый объект модели (глубокая копия)', async () => {
      const user = userEvent.setup()
      const ref = createRef<{ getModel: () => Model }>()

      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Имя',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'Тест',
          },
        ],
      }

      render(<ParamsEditor ref={ref} params={params} model={model} />)

      const input = screen.getByLabelText('Имя')
      await user.clear(input)
      await user.type(input, 'Обновлено')

      const updatedModel = ref.current?.getModel()

      expect(updatedModel).not.toBe(model)
      expect(updatedModel?.paramValues).not.toBe(model.paramValues)
      expect(updatedModel?.paramValues[0]).not.toBe(model.paramValues[0])
    })

    it('должен сохранить изменения только в измененных полях', async () => {
      const user = userEvent.setup()
      const ref = createRef<{ getModel: () => Model }>()

      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Имя',
          type: ParamType.string,
        },
        {
          id: createParamId(2),
          name: 'Email',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'Иван',
          },
          {
            paramId: createParamId(2),
            type: ParamType.string,
            value: 'ivan@test.com',
          },
        ],
      }

      render(<ParamsEditor ref={ref} params={params} model={model} />)

      const nameInput = screen.getByLabelText('Имя')
      await user.clear(nameInput)
      await user.type(nameInput, 'Петр')

      const updatedModel = ref.current?.getModel()

      expect(updatedModel?.paramValues[0].value).toBe('Петр')
      expect(updatedModel?.paramValues[1].value).toBe('ivan@test.com')
    })
  })

  describe('Обновление значений в UI', () => {
    it('должен обновить значение поля в UI при вводе текста', async () => {
      const user = userEvent.setup()

      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Имя',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: '',
          },
        ],
      }

      render(<ParamsEditor params={params} model={model} />)

      const input = screen.getByLabelText('Имя') as HTMLInputElement

      await user.type(input, 'Текст для ввода')

      expect(input.value).toBe('Текст для ввода')
    })

    it('должен корректно обрабатывать очистку поля', async () => {
      const user = userEvent.setup()

      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Имя',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'Начальное значение',
          },
        ],
      }

      render(<ParamsEditor params={params} model={model} />)

      const input = screen.getByLabelText('Имя') as HTMLInputElement

      expect(input.value).toBe('Начальное значение')

      await user.clear(input)

      expect(input.value).toBe('')
    })

    it('должен корректно обрабатывать изменение нескольких полей последовательно', async () => {
      const user = userEvent.setup()

      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Поле 1',
          type: ParamType.string,
        },
        {
          id: createParamId(2),
          name: 'Поле 2',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'Значение 1',
          },
          {
            paramId: createParamId(2),
            type: ParamType.string,
            value: 'Значение 2',
          },
        ],
      }

      render(<ParamsEditor params={params} model={model} />)

      const input1 = screen.getByLabelText('Поле 1') as HTMLInputElement
      const input2 = screen.getByLabelText('Поле 2') as HTMLInputElement

      await user.clear(input1)
      await user.type(input1, 'Новое 1')

      expect(input1.value).toBe('Новое 1')
      expect(input2.value).toBe('Значение 2')

      await user.clear(input2)
      await user.type(input2, 'Новое 2')

      expect(input1.value).toBe('Новое 1')
      expect(input2.value).toBe('Новое 2')
    })
  })

  describe('Краевые случаи', () => {
    it('должен корректно работать с одним параметром', () => {
      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Единственное поле',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: 'значение',
          },
        ],
      }

      render(<ParamsEditor params={params} model={model} />)

      expect(screen.getByLabelText('Единственное поле')).toBeInTheDocument()
    })

    it('должен корректно работать с большим количеством параметров', () => {
      const params: Param[] = Array.from({ length: 10 }, (_, i) => ({
        id: createParamId(i + 1),
        name: `Поле ${i + 1}`,
        type: ParamType.string,
      }))

      const model: Model = {
        paramValues: Array.from({ length: 10 }, (_, i) => ({
          paramId: createParamId(i + 1),
          type: ParamType.string,
          value: `значение ${i + 1}`,
        })) as ParamValue[],
      }

      render(<ParamsEditor params={params} model={model} />)

      const inputs = screen.getAllByRole('textbox')
      expect(inputs).toHaveLength(10)

      inputs.forEach((input, index) => {
        expect((input as HTMLInputElement).value).toBe(`значение ${index + 1}`)
      })
    })

    it('должен корректно обрабатывать специальные символы в значениях', async () => {
      const user = userEvent.setup()
      const ref = createRef<{ getModel: () => Model }>()

      const params: Param[] = [
        {
          id: createParamId(1),
          name: 'Поле',
          type: ParamType.string,
        },
      ]

      const model: Model = {
        paramValues: [
          {
            paramId: createParamId(1),
            type: ParamType.string,
            value: '',
          },
        ],
      }

      render(<ParamsEditor ref={ref} params={params} model={model} />)

      const input = screen.getByLabelText('Поле')
      await user.type(input, '<script>alert("xss")</script>')

      const updatedModel = ref.current?.getModel()

      expect(updatedModel?.paramValues[0].value).toBe(
        '<script>alert("xss")</script>',
      )
    })
  })
})
