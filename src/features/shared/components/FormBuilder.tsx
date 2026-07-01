import type { FormFieldDefinition } from '../types';

interface FormBuilderProps {
  fields: FormFieldDefinition[];
}

export const FormBuilder = ({ fields }: FormBuilderProps) => {
  return (
    <form className="form-builder">
      {fields.map((field) => (
        <label key={field.name} className="form-builder__field">
          <span>{field.label}</span>
          <input
            name={field.name}
            type={field.type ?? 'text'}
            placeholder={field.placeholder}
            required={field.required}
            autoComplete={field.autoComplete}
          />
        </label>
      ))}
    </form>
  );
};
