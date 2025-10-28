import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

import { FormInput, FormInputProps } from '@/components/form-input';
import { PhoneInput, PhoneInputProps } from '@/components/phone-input';
import { AppCheckbox } from '@/components/app-checkbox';

// Controlled text input wrapper
export type ControlledInputProps<T extends FieldValues> = Omit<FormInputProps, 'value' | 'onChangeText' | 'onBlur'> & {
  control: Control<T>;
  name: Path<T>;
};

export function ControlledInput<T extends FieldValues>({ control, name, ...rest }: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <FormInput {...rest} onChangeText={onChange} onBlur={onBlur} value={value as any} error={error?.message} />
      )}
    />
  );
}

// Controlled phone input wrapper
export type ControlledPhoneInputProps<T extends FieldValues> = Omit<PhoneInputProps, 'value' | 'onChangeText'> & {
  control: Control<T>;
  name: Path<T>;
};

export function ControlledPhoneInput<T extends FieldValues>({ control, name, ...rest }: ControlledPhoneInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <PhoneInput {...rest} value={value as any} onChangeText={onChange} error={error?.message} />
      )}
    />
  );
}

// Controlled checkbox wrapper
export type ControlledCheckboxProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

export function ControlledCheckbox<T extends FieldValues>({ control, name }: ControlledCheckboxProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <AppCheckbox checked={!!value} onChange={onChange} />
      )}
    />
  );
}
