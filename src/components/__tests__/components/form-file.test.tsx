import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import FormFile from '@/components/reusables/form-fields/form-file';
import { UploadType } from '@/enums/base-enum';
import { showWarningToast } from '~/components/toast-variant';
import Image from 'next/image';

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn(() => 'mock-url');
const mockRevokeObjectURL = jest.fn();

// Mock the URL object
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

// Mock the toast component
jest.mock('~/components/toast-variant', () => ({
  showWarningToast: jest.fn(),
}));

type ImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: string | number | undefined;
};

// Mock next/image
jest.mock('next/image', () => ({
  default: (props: ImageProps) => <Image {...props} alt={props.alt ?? 'Image'} />,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ImageMinus: () => <span>ImageMinus</span>,
  Image: () => <span>Image</span>,
  FileIcon: () => <span>FileIcon</span>,
  X: () => <span>X</span>,
}));

// Mock react-icons
jest.mock('react-icons/pi', () => ({
  PiLinkSimple: () => <span>PiLinkSimple</span>,
}));

type BufferData = {
  type: string;
  data: number[];
};

type FormFileValues = {
  [key: string]: File | File[] | Buffer | BufferData | null;
};

const FormWrapper = ({ children, defaultValues = {} }: { children: React.ReactNode; defaultValues?: FormFileValues }) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('FormFile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders attachment type input correctly', () => {
    render(
      <FormWrapper>
        <FormFile
          name="attachment"
          label="Attachment"
          placeholder="Add an Attachment"
          uploadType={UploadType.ATTACHMENT}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Attachment')).toBeInTheDocument();
    expect(screen.getByText('Add an Attachment')).toBeInTheDocument();
  });

  it('renders image type input correctly', () => {
    render(
      <FormWrapper>
        <FormFile
          name="image"
          label="Image"
          placeholder="Add an Image"
          uploadType={UploadType.PROFILE_PICTURE}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Image:')).toBeInTheDocument();
    expect(screen.getByText('Add an Image')).toBeInTheDocument();
  });

  it('handles file selection for attachment type', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const onFileChange = jest.fn();

    render(
      <FormWrapper>
        <FormFile
          name="attachment"
          label="Attachment"
          uploadType={UploadType.ATTACHMENT}
          onFileChange={onFileChange}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Attachment');
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('handles array of files in useEffect', () => {
    const files = [
      new File(['test1'], 'test1.png', { type: 'image/png' }),
      new File(['test2'], 'test2.png', { type: 'image/png' }),
    ];
    render(
      <FormWrapper defaultValues={{ images: files }}>
        <FormFile
          name="images"
          label="Images"
          uploadType={UploadType.ATTACHMENT}
        />
      </FormWrapper>
    );

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
  });

  it('shows warning for invalid file type', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    render(
      <FormWrapper>
        <FormFile
          name="image"
          label="Image"
          uploadType={UploadType.PROFILE_PICTURE}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Image:');
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);
    
    await waitFor(() => {
      expect(showWarningToast).toHaveBeenCalledWith(
        expect.stringContaining('File type not supported')
      );
    });
  });

  it('shows warning for file exceeding size limit', async () => {
    const largeFile = new File(['x'.repeat(1024 * 1024 * 6)], 'large.png', { type: 'image/png' });

    render(
      <FormWrapper>
        <FormFile
          name="image"
          label="Image"
          uploadType={UploadType.PROFILE_PICTURE}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Image:');
    Object.defineProperty(input, 'files', {
      value: [largeFile],
    });

    fireEvent.change(input);
    
    await waitFor(() => {
      expect(showWarningToast).toHaveBeenCalledWith(
        expect.stringContaining('File is too large')
      );
    });
  });

  it('handles multiple file removal', async () => {
    const files = [
      new File(['test1'], 'test1.png', { type: 'image/png' }),
      new File(['test2'], 'test2.png', { type: 'image/png' }),
    ];

    render(
      <FormWrapper defaultValues={{ images: files }}>
        <FormFile
          name="images"
          label="Images"
          uploadType={UploadType.ATTACHMENT}
        />
      </FormWrapper>
    );

    const removeButton = screen.getByText('X');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test1.png')).not.toBeInTheDocument();
    });
  });

  it('handles disabled state', () => {
    render(
      <FormWrapper>
        <FormFile
          name="image"
          label="Image"
          uploadType={UploadType.PROFILE_PICTURE}
          disabled={true}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Image:');
    expect(input).toBeDisabled();
  });

  it('handles custom styles', () => {
    const customStyles = {
      container: 'custom-container',
      label: 'custom-label',
      placeholder: <div>Custom Placeholder</div>,
    };

    render(
      <FormWrapper>
        <FormFile
          name="image"
          label="Image"
          uploadType={UploadType.PROFILE_PICTURE}
          customStyles={customStyles}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Custom Placeholder')).toBeInTheDocument();
  });

  it('handles file input ref', () => {
    const fileInputRef = { current: null };

    render(
      <FormWrapper>
        <FormFile
          name="image"
          label="Image"
          uploadType={UploadType.PROFILE_PICTURE}
          fileInputRef={fileInputRef}
        />
      </FormWrapper>
    );

    expect(fileInputRef.current).not.toBeNull();
  });

  it('handles file validation with unsupported file type', async () => {
    const file = new File(['test'], 'test.xyz', { type: 'application/xyz' });

    render(
      <FormWrapper>
        <FormFile
          name="image"
          label="Image"
          uploadType={UploadType.PROFILE_PICTURE}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Image:');
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);
    
    await waitFor(() => {
      expect(showWarningToast).toHaveBeenCalledWith(
        expect.stringContaining('File type not supported')
      );
    });
  });

  it('handles multiple file selection exceeding limit', async () => {
    const files = Array.from({ length: 6 }, (_, i) => 
      new File(['test'], `test${i}.png`, { type: 'image/png' })
    );

    render(
      <FormWrapper>
        <FormFile
          name="images"
          label="Images"
          uploadType={UploadType.ATTACHMENT}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Images');
    Object.defineProperty(input, 'files', {
      value: files,
    });

    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.queryByText('test0.png')).not.toBeInTheDocument();
    });
  });

  it('handles attachment type with file name display', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    render(
      <FormWrapper>
        <FormFile
          name="attachment"
          label="Attachment"
          uploadType={UploadType.ATTACHMENT}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Attachment');
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('handles attachment type file removal', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    render(
      <FormWrapper>
        <FormFile
          name="attachment"
          label="Attachment"
          uploadType={UploadType.ATTACHMENT}
        />
      </FormWrapper>
    );

    const input = screen.getByLabelText('Attachment');
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    const removeButton = screen.getByText('X');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });
}); 