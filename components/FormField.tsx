import React from 'react';
import {
  FormControl,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface FormFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  className?: string;
}

const FormField = ({ 
  control, 
  name, 
  label, 
  placeholder, 
  type = "text",
  className = ""
}: FormFieldProps) => {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-sm font-semibold text-gray-700">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              className="p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-primary transition-colors duration-200"
            />
          </FormControl>
          <FormMessage className="text-red-500 text-xs" />
        </FormItem>
      )}
    />
  );
};

export default FormField;
