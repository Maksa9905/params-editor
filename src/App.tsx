import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import styles from './App.module.css'

declare const _brand: unique symbol

type Brand<K, T> = K & { [_brand]: T }

type ParamId = Brand<number, 'ParamId'>

enum ParamType {
  string = 'string',
  select = 'select',
  number = 'number',
}

type SelectValue = { value: string; label: string }

type Param =
  | { id: ParamId; name: string; type: ParamType.string }
  | {
      id: ParamId
      name: string
      type: ParamType.select
      options: SelectValue[]
    }
  | { id: ParamId; name: string; type: ParamType.number }

type ParamValue =
  | { paramId: ParamId; type: ParamType.string; value: string }
  | { paramId: ParamId; type: ParamType.select; value: SelectValue }
  | { paramId: ParamId; type: ParamType.number; value: number }

interface Model {
  paramValues: ParamValue[]
}

interface ParamsEditorProps {
  params: Param[]
  model: Model
}

interface BaseParamFieldProps<T extends ParamType> {
  id: ParamId
  type: T
  label: string
  value: Extract<ParamValue, { type: T }>['value']
  onChange: (
    value: Extract<ParamValue, { type: T }>['value'],
    id: ParamId,
  ) => void
}

interface StringParamFieldProps extends BaseParamFieldProps<ParamType.string> {
  type: ParamType.string
}

interface SelectParamFieldProps extends BaseParamFieldProps<ParamType.select> {
  type: ParamType.select
  options: SelectValue[]
}

interface NumberParamFieldProps extends BaseParamFieldProps<ParamType.number> {
  type: ParamType.number
  min?: number
  max?: number
}

interface ParamFieldsProps {
  params: Param[]
  model: Model
  onParamChange: (newValue: ParamValue['value'], id: ParamId) => void
}

type GetModelFn = () => Model

const createParamId = (id: number) => {
  return id as ParamId
}

const ParamsEditor = forwardRef(
  ({ params, model: _model }: ParamsEditorProps, ref) => {
    const [model, setModel] = useState(_model)

    useImperativeHandle(ref, () => ({
      getModel: () => JSON.parse(JSON.stringify(model)) as Model,
    }))

    const handleParamChange = useCallback(
      (newValue: string | SelectValue | number, id: ParamId) => {
        setModel((prevModel) => ({
          ...prevModel,
          paramValues: prevModel.paramValues.map((paramValue) =>
            paramValue.paramId === id
              ? { ...paramValue, value: newValue as never }
              : paramValue,
          ),
        }))
      },
      [],
    )

    return (
      <ParamFields
        params={params}
        model={model}
        onParamChange={handleParamChange}
      />
    )
  },
)

const ParamFields = ({ params, model, onParamChange }: ParamFieldsProps) => {
  return (
    <div className={styles.fields}>
      {params.map((param) => {
        const paramValue = model.paramValues.find(
          (value) => value.paramId === param.id,
        )

        if (paramValue === undefined) {
          throw new Error('The model must contain a value for each parameter')
        }

        if (
          param.type === ParamType.string &&
          paramValue.type === ParamType.string
        ) {
          return (
            <StringParamField
              key={param.id}
              type={param.type}
              id={param.id}
              label={param.name}
              value={paramValue.value}
              onChange={onParamChange}
            />
          )
        }

        if (
          param.type === ParamType.number &&
          paramValue.type === ParamType.number
        ) {
          return (
            <NumberParamField
              key={param.id}
              type={param.type}
              id={param.id}
              label={param.name}
              value={paramValue.value}
              onChange={onParamChange}
            />
          )
        }

        if (
          param.type === ParamType.select &&
          paramValue.type === ParamType.select
        ) {
          return (
            <SelectParamField
              key={param.id}
              type={param.type}
              id={param.id}
              label={param.name}
              value={paramValue.value}
              options={param.options}
              onChange={onParamChange}
            />
          )
        }

        return null
      })}
    </div>
  )
}

const StringParamField = ({
  id,
  label,
  value,
  type,
  onChange,
}: StringParamFieldProps) => {
  return (
    <div className={styles.field}>
      <label htmlFor={type + id}>{label}</label>
      <input
        id={type + id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value, id)}
      />
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SelectParamField = (_props: SelectParamFieldProps) => {
  return <p>Not implemented</p>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NumberParamField = (_props: NumberParamFieldProps) => {
  return <p>Not implemented</p>
}

function App() {
  const editorRef = useRef<{ getModel: GetModelFn }>(null)

  const handleSave = () => {
    if (editorRef.current) {
      const updatedModel = editorRef.current.getModel()
      console.log(updatedModel)
    }
  }

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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Редактор параметров</h1>
      <ParamsEditor
        ref={editorRef}
        params={params}
        model={model}
      />
      <button onClick={handleSave}>Сохранить</button>
    </div>
  )
}

export default App
