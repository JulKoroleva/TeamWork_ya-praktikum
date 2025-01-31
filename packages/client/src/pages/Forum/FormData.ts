import { IFieldConfig } from '@/components/FormComponent/components/FormField/FormField.interface';

export const createNewTopicFields: IFieldConfig[] = [
  {
    id: 'title',
    label: 'Topic name',
    type: 'text',
    placeholder: 'Enter topic title',
    isRequired: true,
    maxLength: 30,
    validation: () => ({
      validate: value => {
        if (value.length < 3) {
          return 'Minimum 3 characters';
        }
        return true;
      },
    }),
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter description',
    isRequired: true,
    maxLength: 500,
    validation: () => ({
      validate: value => {
        if (value.length < 20) {
          return 'Minimum 20 characters';
        }
        return true;
      },
    }),
  },
];

export const createNewTopicFieldsInitialValues = {
  title: '',
  description: '',
};
