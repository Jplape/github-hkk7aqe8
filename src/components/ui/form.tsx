import * as React from 'react'
import {
  useFormContext,
  UseFormReturn,
  FieldValues,
  FieldPath,
  Control,
  useController,
  ControllerRenderProps, 
  ControllerFieldState,
} from 'react-hook-form'

type FormProps = {
  children: React.ReactNode
} & React.FormHTMLAttributes<HTMLFormElement>

type FormFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  render: (props: {
    field: ControllerRenderProps<TFieldValues>
    fieldState: ControllerFieldState
  }) => React.ReactNode
}

type FormItemProps = {
  children: React.ReactNode
}

type FormLabelProps = {
  children: React.ReactNode
} & React.LabelHTMLAttributes<HTMLLabelElement>

type FormControlProps = {
  children: React.ReactNode
}

type FormDescriptionProps = {
  children: React.ReactNode
}

type FormMessageProps = {
  children?: React.ReactNode
}

const FormContext = React.createContext<UseFormReturn<FieldValues> | null>(null)

export function Form({ children, ...props }: FormProps) {
  const methods = useFormContext()
  
  return (
    <FormContext.Provider value={methods}>
      <form {...props}>
        {children}
      </form>
    </FormContext.Provider>
  )
}

export function FormField<T extends FieldValues>({
  name,
  control,
  render
}: FormFieldProps<T>) {
  const { field, fieldState } = useController({
    name,
    control
  })

  return (
    <div className="space-y-2">
      {render({ field, fieldState })}
    </div>
  )
}

export function FormItem({ children }: FormItemProps) {
  return <div className="space-y-1">{children}</div>
}

export function FormLabel({ children, ...props }: FormLabelProps) {
  return (
    <label className="block text-sm font-medium" {...props}>
      {children}
    </label>
  )
}

export function FormControl({ children }: FormControlProps) {
  return <div>{children}</div>
}

export function FormDescription({ children }: FormDescriptionProps) {
  return <p className="text-sm text-gray-500">{children}</p>
}

export function FormMessage({ children }: FormMessageProps) {
  return <p className="text-sm text-red-500">{children}</p>
}