import {
  BaseButton,
  DatePickerFormField,
  FormInput,
  FormTextarea,
  FormFile,
  FormCustomInput,
  FormCheckbox,
  FormDropdown,
  SearchBar,
  TriStateCheckbox
} from '../../index';

describe('Components Index', () => {
  it('should export BaseButton component', () => {
    expect(BaseButton).toBeDefined();
  });

  it('should export DatePickerFormField component', () => {
    expect(DatePickerFormField).toBeDefined();
  });

  it('should export FormInput component', () => {
    expect(FormInput).toBeDefined();
  });

  it('should export FormTextarea component', () => {
    expect(FormTextarea).toBeDefined();
  });

  it('should export FormFile component', () => {
    expect(FormFile).toBeDefined();
  });

  it('should export FormCustomInput component', () => {
    expect(FormCustomInput).toBeDefined();
  });

  it('should export FormCheckbox component', () => {
    expect(FormCheckbox).toBeDefined();
  });

  it('should export FormDropdown component', () => {
    expect(FormDropdown).toBeDefined();
  });

  it('should export SearchBar component', () => {
    expect(SearchBar).toBeDefined();
  });

  it('should export TriStateCheckbox component', () => {
    expect(TriStateCheckbox).toBeDefined();
  });
}); 